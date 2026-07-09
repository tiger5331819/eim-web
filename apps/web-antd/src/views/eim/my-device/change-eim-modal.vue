<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Upload } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { eimChange, eimList } from '#/api/system/device';
import { useAccessStore } from '@vben/stores';
import { getDictOptions } from '#/utils/dict';

const emit = defineEmits<{ reload: [] }>();

const eidList = ref<string[]>([]);
const eimIdList = ref<any[]>([]);
const fileData = ref<any>(null);
const fileList = ref<any[]>([]);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 180 },
  schema: [
    { component: 'Select', fieldName: 'eimIdOriginal', label: '原EIMId', rules: 'required', componentProps: { options: [], placeholder: '请选择原EIMId' } },
    { component: 'Input', fieldName: 'eimId', label: 'EIMId', rules: [
      { required: true, message: 'EIMId不能为空' },
      { pattern: /^\d+(\.{1}\d+)+$/, message: '输入不合法' },
    ] },
    { component: 'Input', fieldName: 'eimFqdn', label: 'EIM地址', rules: [
      { required: true, message: 'EIM地址不能为空' },
      { pattern: /^\d+(\.{1}\d+)+(\:{1}\d+){1}$/, message: '输入不合法' },
    ] },
    { component: 'Select', fieldName: 'eimIdType', label: 'EIMIdType', rules: 'required', componentProps: { options: getDictOptions('sys_eim_id'), placeholder: '请选择' } },
    { component: 'Input', fieldName: 'counterValue', label: 'counterValue', rules: [
      { pattern: /^[A-Za-z0-9]*$/, message: '输入不合法' },
    ] },
    { component: 'Input', fieldName: 'associationToken', label: 'associationToken', componentProps: { disabled: true } },
    { component: 'RadioGroup', fieldName: 'authenticationMethod', label: 'authenticationMethod', rules: 'required', defaultValue: '0', componentProps: { options: getDictOptions('sye_eim_method') } },
    { component: 'Input', fieldName: 'eimPublicKey', label: 'eimPublicKey', dependencies: { show(values) { return values.authenticationMethod === '0'; }, triggerFields: ['authenticationMethod'] }, rules: [
      { required: true, message: 'eimPublicKey不能为空' },
      { pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>/?]*$/, message: '输入不合法' },
    ] },
    { component: 'Input', fieldName: 'eimCertificate', label: 'eimCertificate', dependencies: { show(values) { return values.authenticationMethod === '1'; }, triggerFields: ['authenticationMethod'] }, componentProps: { disabled: true, placeholder: '请上传证书文件' } },
    { component: 'Input', fieldName: 'trustedEimPkTls', label: 'trustedPublicKeyDataTls', rules: [
      { pattern: /^[A-Za-z0-9]*$/, message: '输入不合法' },
    ] },
    { component: 'Select', fieldName: 'eimSupportedProtocol', label: 'eimSupportedProtocol', rules: 'required', componentProps: { options: getDictOptions('sys_eim_sp'), placeholder: '请选择' } },
    { component: 'Input', fieldName: 'euiccCipkId', label: 'euiccCiPKld', rules: [
      { pattern: /^[A-Za-z0-9]*$/, message: '输入不合法' },
    ] },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  class: 'w-[700px]',
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    fileData.value = null;
    fileList.value = [];
    const data = modalApi.getData() as { eidList?: string[] };
    eidList.value = data?.eidList || [];
    eimIdList.value = [];
    for (const eid of eidList.value) {
      const res = await eimList(eid);
      (res.rows || []).forEach((val: any) => { eimIdList.value.push({ label: val.eimId, value: val.eimId }); });
    }
    formApi.updateSchema([{ fieldName: 'eimIdOriginal', componentProps: { options: eimIdList.value } }]);
    await formApi.resetForm();
    modalApi.modalLoading(false);
  },
});

function handleFileChange(info: any) {
  const file = info.file;
  if (file) {
    const name = file.name || file.originFileObj?.name || '';
    const ext = name.substring(name.lastIndexOf('.'));
    if (ext !== '.der' && ext !== '.pem') {
      window.message.error('文件格式错误，仅支持 .der .pem');
      return;
    }
    const raw = file.originFileObj || file;
    fileData.value = raw;
    formApi.setValues({ eimCertificate: name });
  }
}

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    for (const eid of eidList.value) {
      // 使用 FormData 提交以支持证书上传
      const param = new FormData();
      const json = JSON.stringify(values);
      const req = new Blob([json], { type: 'application/json' });
      if (fileData.value && values.authenticationMethod === '1') {
        param.append('eimCertificate', fileData.value);
      } else {
        param.append('eimCertificate', '');
      }
      param.append('req', req);
      await eimChange(eid, values.eimIdOriginal, param);
    }
    emit('reload');
    modalApi.close();
  } catch (error) { console.error(error); } finally { modalApi.lock(false); }
}
</script>

<template>
  <BasicModal title="替换EIM">
    <BasicForm />
    <div v-if="(() => { const v = formApi.getValues(); return v.authenticationMethod === '1'; })()" class="ml-[180px] mt-2">
      <Upload
        :file-list="fileList"
        accept=".der,.pem"
        :max-count="1"
        :before-upload="() => false"
        @change="handleFileChange"
      >
        <a-button size="small">上传证书文件</a-button>
      </Upload>
      <span class="ml-2 text-gray-400 text-xs">支持扩展名：.der .pem</span>
    </div>
  </BasicModal>
</template>
