<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { profileLedgerAdd } from '#/api/system/profile-ledger';
import type { ProfileCreateBo } from '#/api/system/profile-ledger/model';
import { getEnabledOperatorOptions } from '#/api/system/operator';

const emit = defineEmits<{ reload: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Input',
      componentProps: { maxlength: 32, placeholder: '最长32字符' },
      fieldName: 'accode',
      label: 'ACcode',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 20, placeholder: '19-20字符' },
      fieldName: 'iccid',
      label: 'ICCID',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 15, placeholder: '最长15字符' },
      fieldName: 'msisdn',
      label: 'MSISDN',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 15, placeholder: '最长15字符' },
      fieldName: 'imsi',
      label: 'IMSI',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getEnabledOperatorOptions,
        placeholder: '请选择运营商',
        showSearch: true,
        optionFilterProp: 'label',
        style: { width: '100%' },
        popupMatchSelectWidth: false,
        dropdownStyle: { minWidth: '200px' },
      },
      fieldName: 'operatorId',
      label: '运营商',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 50,
        placeholder: '如：自有SMDP+、东信SMDP+',
      },
      fieldName: 'resourceSource',
      label: '资源来源',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => formApi.resetForm(),
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    await profileLedgerAdd(values as ProfileCreateBo);
    window.message.success('新增成功，共导入1条');
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
  <BasicModal title="新增码号" class="w-[520px]">
    <BasicForm />
  </BasicModal>
</template>
