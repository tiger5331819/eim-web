<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { apnByOperator } from '#/api/system/apn';
import { toEnable, updateProfileApn } from '#/api/system/device';

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
    labelWidth: 90,
    componentProps: { class: 'w-full' },
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'iccid',
      label: 'ICCID',
      componentProps: {
        disabled: true,
        placeholder: '--',
      },
    },
    {
      component: 'Select',
      fieldName: 'apnId',
      label: '选择APN',
      rules: 'required',
      componentProps: {
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择或输入APN',
        options: apnOptions,
        notFoundContent: null,
        mode: 'combobox',
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
  onClosed: () => emit('reload'),
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as {
      apn?: string;
      apnId?: string;
      apnName?: string;
      eid?: string;
      iccid?: string;
      operatorId?: number | string;
    };
    eid.value = data.eid ?? '';
    iccid.value = data.iccid ?? '';
    modalApi.modalLoading(true);
    apnOptions.value = [];
    try {
      await formApi.resetForm();
      await formApi.setValues({ iccid: data.iccid || '--' });
      if (data.operatorId) {
        const list = await apnByOperator(data.operatorId);
        apnOptions.value = mapApnSelectOptions(list);
        await formApi.setValues({
          iccid: data.iccid || '--',
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
    await toEnable(eid.value, iccid.value);
    await updateProfileApn(eid.value, iccid.value, values.apnId);
    window.message.success('操作成功');
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
  <BasicModal title="启用码号" class="w-[520px]">
    <BasicForm />
  </BasicModal>
</template>
