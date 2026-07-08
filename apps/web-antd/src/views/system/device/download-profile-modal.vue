<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { apnByOperator } from '#/api/system/apn';
import { deviceSimpleDownload } from '#/api/system/device';
import { getEnabledOperatorOptions } from '#/api/system/operator';

const emit = defineEmits<{ reload: [] }>();

const eid = ref('');
const apnOptions = ref<Array<{ label: string; value: string }>>([]);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 90 },
  schema: [
    {
      component: 'Select',
      fieldName: 'operatorId',
      label: '运营商',
      rules: 'required',
      componentProps: {
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择运营商',
        options: [],
        style: { width: '100%' },
        onChange: (value: number | string) => loadApnOptions(value),
      },
    },
    {
      component: 'Select',
      fieldName: 'apnId',
      label: 'APN',
      rules: 'required',
      componentProps: {
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择APN',
        options: apnOptions,
        style: { width: '100%' },
      },
    },
  ],
  showDefaultActions: false,
});

async function loadApnOptions(operatorId?: number | string) {
  if (!operatorId) {
    apnOptions.value = [];
    await formApi.setValues({ apnId: undefined });
    return;
  }
  const list = await apnByOperator(operatorId);
  apnOptions.value = (list || []).map((item) => ({
    label: item.name || item.apn || String(item.id),
    value: String(item.id),
  }));
  const defaultApn = list?.find((item) => item.isDefault === '1');
  await formApi.setValues({
    apnId: defaultApn ? String(defaultApn.id) : apnOptions.value[0]?.value,
  });
}

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { eid?: string };
    eid.value = data.eid ?? '';
    modalApi.modalLoading(true);
    const operatorOptions = await getEnabledOperatorOptions();
    formApi.updateSchema([
      {
        fieldName: 'operatorId',
        componentProps: {
          options: operatorOptions,
          onChange: (value: number | string) => loadApnOptions(value),
        },
      },
    ]);
    await formApi.resetForm();
    apnOptions.value = [];
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    await deviceSimpleDownload(eid.value, {
      eid: eid.value,
      operatorId: values.operatorId,
      apnId: values.apnId,
    });
    window.message.success(
      '已发起下载码号任务，可在下载码号任务中查询下载进度',
    );
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
  <BasicModal title="下载码号" class="w-[520px]">
    <BasicForm />
  </BasicModal>
</template>
