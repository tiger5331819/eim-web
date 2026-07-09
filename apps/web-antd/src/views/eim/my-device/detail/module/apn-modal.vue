<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { updateProfileApn } from '#/api/system/device';
import { listApn } from '#/api/system/apn';
import { useDeviceStore } from '#/store/device';

const emit = defineEmits<{ reload: [] }>();
const deviceStore = useDeviceStore();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 80 },
  schema: [
    { component: 'Input', fieldName: 'iccid', label: 'ICCID', componentProps: { disabled: true } },
    { component: 'ApiSelect', fieldName: 'apnId', label: 'APNID', rules: 'required',
      componentProps: { api: async () => { const res = await listApn(); return (res.rows || []).map((item: any) => ({ label: item.name, value: item.id })); }, placeholder: '请选择APN' } },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { row?: any };
    if (data?.row) { await formApi.setValues({ iccid: data.row.iccid, apnId: undefined }); }
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const eid = deviceStore.currentEid;
    await updateProfileApn(eid, values.iccid, values.apnId);
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
