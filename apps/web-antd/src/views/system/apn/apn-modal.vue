<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { Tag } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { addApn, getApn, updateApn } from '#/api/system/apn';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const isDefault = ref<'0' | '1' | undefined>(undefined);

const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 100,
  },
  schema: modalSchema(),
  showDefaultActions: false,
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
      const record = await getApn(id);
      isDefault.value = record.isDefault;
      await formApi.setValues(record);
    } else {
      // 新增默认值
      isDefault.value = '0';
      await formApi.setValues({
        isDefault: '0',
        status: '0',
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
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? updateApn(data) : addApn(data));
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
  isDefault.value = undefined;
  resetInitialized();
}
</script>

<template>
  <BasicModal :title="title" class="w-[620px]">
    <div
      v-if="isUpdate && isDefault === '1'"
      class="mb-3 flex items-center gap-2 rounded bg-amber-50 px-3 py-2 text-xs dark:bg-amber-900/30"
    >
      <Tag color="gold" class="!mr-0">⭐ 默认</Tag>
      <span class="text-amber-700 dark:text-amber-300">
        当前 APN 是该运营商的默认 APN
      </span>
    </div>
    <BasicForm />
  </BasicModal>
</template>
