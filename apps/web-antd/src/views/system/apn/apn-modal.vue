<script setup lang="ts">
import type { ApnForm } from '#/api/system/apn/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { addApn, getApn, updateApn } from '#/api/system/apn';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? '编辑APN配置' : '新增APN配置';
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 100,
    componentProps: {
      class: 'w-full',
    },
  },
  schema: modalSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await getApn(String(id));
      await formApi.setValues({
        id: String(record.id),
        name: record.name || record.apn,
        operatorId:
          record.operatorId != null
            ? String(record.operatorId)
            : record.operatorId,
        remark: record.remark,
      });
    }

    await markInitialized();
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const values = cloneDeep(await formApi.getValues()) as ApnForm;
    const payload: ApnForm = {
      id: values.id != null ? String(values.id) : values.id,
      name: values.name?.trim(),
      // apn: values.name?.trim(),
      operatorId:
        values.operatorId != null
          ? String(values.operatorId)
          : values.operatorId,
      remark: values.remark?.trim() || undefined,
    };

    if (isUpdate.value) {
      await updateApn(payload);
      window.message.success('APN配置编辑成功');
    } else {
      delete payload.id;
      await addApn(payload);
      window.message.success('APN配置新增成功');
    }
    resetInitialized();
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
</script>

<template>
  <BasicModal :title="title" class="w-[520px]">
    <BasicForm />
  </BasicModal>
</template>
