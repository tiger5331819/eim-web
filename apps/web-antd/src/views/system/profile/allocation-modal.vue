<script setup lang="ts">
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { allBatchList, batchAllowableNumber, handleAllocation } from '#/api/system/profile';
import { getCompanyDict, getProjectDict } from '#/views/system/cardImport/hooks/useGetDict';

const emit = defineEmits<{ reload: [] }>();
const allowNum = ref(0);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    { component: 'Select', fieldName: 'productionBatch', label: '批次', rules: 'required', componentProps: { options: [], placeholder: '请选择', onChange: async (val: any) => { if (val) { const res = await batchAllowableNumber(val); allowNum.value = res.data ?? 0; } else { allowNum.value = 0; } } } },
    { component: 'Input', fieldName: 'allowNum', label: '允许分配数量', componentProps: { disabled: true, placeholder: '选择批次后显示' } },
    { component: 'Select', fieldName: 'company', label: '归属企业', componentProps: { options: [], placeholder: '请选择', onChange: async (val: any) => { if (val) { const projectDict = await getProjectDict(val); formApi.updateSchema([{ fieldName: 'projectId', componentProps: { options: projectDict } }]); } } } },
    { component: 'Select', fieldName: 'projectId', label: '归属项目', rules: 'required', componentProps: { options: [], placeholder: '请先选择归属企业' } },
    { component: 'InputNumber', fieldName: 'size', label: '数量', rules: 'required', componentProps: { min: 1 } },
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
    const res = await allBatchList();
    const batchDict = (res.data || []).map((item: any) => ({ label: item, value: item }));
    const companyDict = await getCompanyDict();
    formApi.updateSchema([
      { fieldName: 'productionBatch', componentProps: { options: batchDict } },
      { fieldName: 'company', componentProps: { options: companyDict } },
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
    await handleAllocation({ productionBatch: values.productionBatch, projectId: values.projectId, size: values.size });
    emit('reload');
    modalApi.close();
  } catch (error) { console.error(error); } finally { modalApi.lock(false); }
}
</script>

<template>
  <BasicModal title="资源分配" class="w-[600px]">
    <BasicForm />
  </BasicModal>
</template>
