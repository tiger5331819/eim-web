<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { updateProfileApn } from '#/api/system/profile';
import { listApn } from '#/api/system/apn';

const emit = defineEmits<{ reload: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 80 },
  schema: [
    { component: 'Input', fieldName: 'iccid', label: 'ICCID', componentProps: { disabled: true } },
    { component: 'ApiSelect', fieldName: 'apnId', label: 'APNID', rules: 'required', componentProps: { api: async () => { const res = await listApn(); return (res.rows || []).map((item: any) => ({ label: item.name, value: item.id })); }, placeholder: '请选择APN' } },
    { component: 'Input', dependencies: { show: () => false, triggerFields: [''] }, fieldName: 'id', label: 'ID' },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { row?: any };
    if (data?.row) {
      await formApi.setValues({ iccid: data.row.iccid, id: data.row.id, apnId: undefined });
    }
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    await updateProfileApn(values.id, values.apnId);
    emit('reload');
    modalApi.close();
  } catch (error) { console.error(error); } finally { modalApi.lock(false); }
}
</script>

<template>
  <BasicModal title="APN更新" class="w-[550px]">
    <BasicForm />
  </BasicModal>
</template>
