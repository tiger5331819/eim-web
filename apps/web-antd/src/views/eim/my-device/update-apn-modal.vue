<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { apnByOperator } from '#/api/system/apn';
import { updateProfileApn } from '#/api/system/device';

import {
  mapApnSelectOptions,
  resolveDefaultApnId,
} from './profile-modal-utils';

const emit = defineEmits<{ reload: [] }>();

const eid = ref('');
const iccid = ref('');
const apnOptions = ref<Array<{ label: string; value: string }>>([]);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 130,
    componentProps: { class: 'w-full' },
  },
  schema: [
    {
      component: 'Select',
      fieldName: 'apnId',
      label: '当前运营商可用APN',
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
  wrapperClass: 'grid-cols-1',
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as {
      eid?: string;
      iccid?: string;
      operatorId?: number | string;
      apnId?: string;
      apn?: string;
      apnName?: string;
    };
    eid.value = data.eid ?? '';
    iccid.value = data.iccid ?? '';
    modalApi.modalLoading(true);
    apnOptions.value = [];
    try {
      await formApi.resetForm();
      if (data.operatorId) {
        const list = await apnByOperator(data.operatorId);
        apnOptions.value = mapApnSelectOptions(list);
        await formApi.setValues({
          apnId: resolveDefaultApnId(list, data),
        });
      }
    } catch (error) {
      console.error(error);
      modalApi.close();
    } finally {
      modalApi.modalLoading(false);
    }
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    await updateProfileApn(eid.value, iccid.value, values.apnId);
    window.message.success('APN更新成功');
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
  <BasicModal title="更新APN" class="w-[520px]">
    <BasicForm />
  </BasicModal>
</template>
