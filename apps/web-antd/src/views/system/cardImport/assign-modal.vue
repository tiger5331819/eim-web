<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { inventoryAssignOne } from '#/api/system/inventory';
import { getLedgerEnabledTenantOptions } from '#/api/system/profile-ledger';

const emit = defineEmits<{ reload: [] }>();

const inventoryId = ref<number | string>('');

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Select',
      fieldName: 'tenantId',
      label: '目标租户',
      rules: 'required',
      componentProps: {
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择目标租户',
        options: [],
        style: { width: '100%' },
      },
    },
    {
      component: 'Input',
      fieldName: 'sizeDisplay',
      label: '分配数量',
      componentProps: { disabled: true },
      defaultValue: '1',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '请输入备注',
      },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as {
      inventoryId?: number | string;
    };
    inventoryId.value = data.inventoryId ?? '';

    modalApi.modalLoading(true);
    const tenantOptions = await getLedgerEnabledTenantOptions();
    formApi.updateSchema([
      {
        fieldName: 'tenantId',
        componentProps: { options: tenantOptions },
      },
    ]);
    await formApi.resetForm();
    formApi.setValues({ sizeDisplay: '1' });
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());

    await inventoryAssignOne(inventoryId.value, {
      tenantId: values.tenantId,
      remark: values.remark,
    });
    window.message.success('分配成功');
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
  <BasicModal title="分配码号" class="w-[520px]">
    <BasicForm />
  </BasicModal>
</template>
