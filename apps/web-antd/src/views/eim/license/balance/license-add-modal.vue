<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { addLicense } from '#/api/system/license';

const emit = defineEmits<{ reload: [] }>();

const tenantId = ref<string>('');

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 100,
  },
  schema: [
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
        max: 1_000_000,
        step: 100,
        precision: 0,
        style: 'width: 100%',
        placeholder: '请输入添加次数',
      },
      fieldName: 'quota',
      label: '添加次数',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '可填写本次添加的业务说明，便于后续追溯',
      },
      fieldName: 'remark',
      label: '备注',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => formApi.resetForm(),
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { tenantId: string };
    tenantId.value = data.tenantId;
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    await addLicense({
      tenantId: tenantId.value,
      quota: values.quota,
      remark: values.remark,
    });
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
  <BasicModal title="添加 License 次数" class="w-[480px]">
    <div class="mb-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
      新增的次数会立即追加到该租户的可用次数中，并生成一条变更流水。
    </div>
    <BasicForm />
  </BasicModal>
</template>
