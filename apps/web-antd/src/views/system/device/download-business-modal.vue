<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { deviceProfileDownload } from '#/api/system/device';

const emit = defineEmits<{ reload: [] }>();

const eid = ref('');

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 130 },
  schema: [
    {
      component: 'Textarea',
      fieldName: 'trigger',
      label: 'Profile下载参数',
      rules: 'required',
      componentProps: {
        allowClear: true,
        autoSize: { minRows: 4, maxRows: 8 },
        placeholder: '请输入 Profile下载参数',
      },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  confirmText: '识别并下载资源',
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: async () => {
    await formApi.resetForm();
    eid.value = '';
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { eid?: string };
    eid.value = data.eid ?? '';
    await formApi.resetForm();
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    if (!eid.value) {
      window.message.warning('缺少设备 EID');
      return;
    }
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const trigger = String(values.trigger || '').trim();
    if (!trigger) {
      window.message.warning('请输入 Profile下载参数');
      return;
    }
    await deviceProfileDownload(eid.value, { trigger });
    window.message.success('已触发下载');
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
  <BasicModal title="下载业务号" class="w-[520px]">
    <BasicForm />
  </BasicModal>
</template>
