<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { inventoryAdd } from '#/api/system/inventory';
import { CARD_VENDOR_OPTIONS } from '#/utils/inventoryStatus';

const emit = defineEmits<{ reload: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Input',
      fieldName: 'eid',
      label: 'EID',
      rules: 'required',
      componentProps: {
        maxlength: 64,
        placeholder: '请输入EID',
      },
    },
    {
      component: 'Input',
      fieldName: 'seedNo',
      label: '预制种子号',
      componentProps: {
        maxlength: 64,
        placeholder: '请输入预制种子号',
      },
    },
    {
      component: 'Select',
      fieldName: 'cardVendor',
      label: '制卡商',
      rules: 'required',
      componentProps: {
        options: CARD_VENDOR_OPTIONS,
        placeholder: '请选择制卡商',
      },
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
    await inventoryAdd(values);
    window.message.success('入库成功');
    emit('reload');
    modalApi.close();
  } catch (error: any) {
    const msg = error?.message || error?.msg;
    if (msg?.includes('已存在')) {
      window.message.error('该EID已存在，请勿重复入库');
    }
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}
</script>

<template>
  <BasicModal title="手动入库" class="w-[520px]">
    <BasicForm />
  </BasicModal>
</template>
