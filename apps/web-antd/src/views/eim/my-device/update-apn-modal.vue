<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
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
const typedApn = ref('');
const selectedApnId = ref<string>();
const apnSource = ref<'empty' | 'selected' | 'typed'>('empty');

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
      rules: z.string().min(1, '请选择或输入APN').max(50, 'APN不能超过50个字符'),
      componentProps: {
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择或输入APN',
        options: apnOptions,
        notFoundContent: null,
        allowClear: true,
        style: { width: '100%' },
        onSearch: (val: string) => {
          typedApn.value = val;
          apnSource.value = val ? 'typed' : 'empty';
          formApi.setFieldValue('apnId', val);
        },
        onSelect: (val: string) => {
          selectedApnId.value = String(val);
          typedApn.value = '';
          apnSource.value = 'selected';
          formApi.setFieldValue('apnId', val);
        },
        onChange: (val?: string) => {
          if (val == null || val === '') {
            selectedApnId.value = undefined;
            typedApn.value = '';
            apnSource.value = 'empty';
            formApi.setFieldValue('apnId', '');
          }
        },
        onClear: () => {
          selectedApnId.value = undefined;
          typedApn.value = '';
          apnSource.value = 'empty';
          formApi.setFieldValue('apnId', '');
        },
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
    typedApn.value = '';
    selectedApnId.value = undefined;
    apnSource.value = 'empty';
    try {
      await formApi.resetForm();
      if (data.operatorId) {
        const list = await apnByOperator(data.operatorId);
        apnOptions.value = mapApnSelectOptions(list);
        const defaultId = resolveDefaultApnId(list, data);
        await formApi.setValues({ apnId: defaultId });
        selectedApnId.value = defaultId;
        apnSource.value = defaultId ? 'selected' : 'empty';
      } else {
        await formApi.setValues({ apnId: '' });
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
    const apnValue =
      apnSource.value === 'typed'
        ? typedApn.value
        : (selectedApnId.value ?? values.apnId);
    await updateProfileApn(eid.value, iccid.value, apnValue);
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
