<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { alovaInstance } from '#/utils/http';

const emit = defineEmits<{ reload: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 110 },
  schema: [
    {
      component: 'Input',
      fieldName: 'eid',
      label: 'EID',
      rules: 'required',
      componentProps: { placeholder: '请输入 EID' },
    },
    {
      component: 'Input',
      fieldName: 'iccid',
      label: '预制种子号',
      rules: 'required',
      componentProps: { placeholder: '请输入 ICCID' },
    },
    {
      component: 'Input',
      fieldName: 'eimFqdn',
      label: '预制 EIM',
      componentProps: { placeholder: '请输入 EIM FQDN' },
    },
    {
      component: 'Input',
      fieldName: 'cardProviderName',
      label: '制卡商',
      componentProps: { placeholder: '请输入制卡商名称' },
    },
    {
      component: 'Input',
      fieldName: 'productionBatch',
      label: '生产批次',
      rules: 'required',
      componentProps: { placeholder: '请输入批次号' },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => formApi.resetForm(),
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    // 单卡添加：调用后端 POST /manager/seed 接口；如后端未实现会自动报错
    await alovaInstance.postWithMsg<void>('/manager/seed', values);
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}
</script>

<template>
  <BasicModal title="单卡添加" class="w-[520px]">
    <div
      class="mb-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    >
      手动录入单张卡的入库信息。如需批量录入，请使用"批量导入"。
    </div>
    <BasicForm />
  </BasicModal>
</template>
