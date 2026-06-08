<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { batchAllowableNumber, handleAllocation } from '#/api/system/cardImport';
import { getBatchDict, getProjectDict, getTenantDict } from './hooks/useGetDict';

const emit = defineEmits<{ reload: [] }>();

const allowNum = ref(0);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Select',
      fieldName: 'productionBatch',
      label: '批次',
      rules: 'required',
      componentProps: {
        options: [],
        placeholder: '请选择',
        onChange: async (val: any) => {
          if (val) {
            const res = await batchAllowableNumber(val);
            allowNum.value = res.data?.count ?? 0;
          } else {
            allowNum.value = 0;
          }
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'allowNum',
      label: '允许分配数量',
      componentProps: { disabled: true, placeholder: '选择批次后显示' },
    },
    {
      component: 'Select',
      fieldName: 'tenantId',
      label: '所属租户',
      rules: 'required',
      componentProps: {
        options: [],
        placeholder: '请选择',
        onChange: async (val: any) => {
          if (val) {
            const projectDict = await getProjectDict(val);
            formApi.updateSchema([
              {
                fieldName: 'projectId',
                componentProps: { options: projectDict },
              },
            ]);
          }
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'projectId',
      label: '所属项目',
      rules: 'required',
      componentProps: { options: [], placeholder: '请先选择租户' },
    },
    {
      component: 'InputNumber',
      fieldName: 'count',
      label: '数量',
      rules: 'required',
      componentProps: { min: 1 },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    allowNum.value = 0;
    const batchDict = await getBatchDict();
    const companyDict = await getTenantDict();
    formApi.updateSchema([
      { fieldName: 'productionBatch', componentProps: { options: batchDict } },
      { fieldName: 'tenantId', componentProps: { options: companyDict } },
    ]);
    await formApi.resetForm();
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    if (values.productionBatch) {
      await handleAllocation(values.productionBatch as string, {
        productionBatch: values.productionBatch,
        count: values.count,
        projectId: values.projectId,
      });
    }
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
  <BasicModal title="卡数分配" class="w-[600px]">
    <BasicForm />
  </BasicModal>
</template>
