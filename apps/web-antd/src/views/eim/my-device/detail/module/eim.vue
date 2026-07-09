<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Card, Popconfirm, Space, Table, TableColumn, Upload } from 'antdv-next';
import { useRoute } from 'vue-router';

import { useVbenForm } from '#/adapter/form';
import { eimAdd, eimDelete, eimDetail, eimEdit, eimList, updateEim } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { getDictOptions } from '#/utils/dict';

const route = useRoute();
const deviceStore = useDeviceStore();
const loading = ref(true);
const tableData = ref<any[]>([]);
const isEdit = ref(false);
const eimId = ref('');
const fileData = ref<any>(null);
const fileList = ref<any[]>([]);

function getEid(): string {
  return deviceStore.currentEid || (route.query.id as string) || '';
}

async function getList() {
  const eid = getEid();
  if (!eid) return;
  loading.value = true;
  try { const res = await eimList(eid); tableData.value = res.rows || []; } finally { loading.value = false; }
}

async function handleSynchronize() { await updateEim(getEid()); await getList(); }

async function handleAdd() {
  isEdit.value = false; eimId.value = '';
  await formApi.resetForm(); modalApi.open();
}

async function handleUpdate(record: any) {
  isEdit.value = true; eimId.value = record.eimId;
  const eid = getEid();
  const res = await eimDetail(eid, record.eimId);
  const data = res.data;
  if (!data.counterValue) data.counterValue = '0';
  data.authenticationMethod = data.eimPublicKey ? '0' : '1';
  await formApi.setValues(data); modalApi.open();
}

async function handleDelete(record: any) { await eimDelete(getEid(), record.eimId); await getList(); }

const tableColumns = [
  { title: 'EIMId', dataIndex: 'eimId' },
  { title: 'EIMIdType', dataIndex: 'eimIdType' },
  { title: '操作', key: 'action', fixed: 'right' },
];

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 180 },
  schema: [
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
  fullscreenButton: false, class: 'w-[700px]',
  onClosed: async () => { await formApi.resetForm(); fileData.value = null; fileList.value = []; },
  onConfirm: handleConfirm,
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const eid = getEid();
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
    if (!isEdit.value) { await eimAdd(eid, param); } else { await eimEdit(eid, eimId.value, param); }
    await getList(); modalApi.close();
  } catch (error) { console.error(error); } finally { modalApi.lock(false); }
}

function handleFileChange(info: any) {
  const file = info.file;
  if (file) {
    const name = file.name || file.originFileObj?.name || '';
    const ext = name.substring(name.lastIndexOf('.'));
    if (ext !== '.der' && ext !== '.pem') {
      window.message.error('文件格式错误，仅支持 .der .pem');
      return;
    }
    fileData.value = file.originFileObj || file;
    formApi.setValues({ eimCertificate: name });
  }
}

onMounted(() => { getList(); });
</script>

<template>
  <Card>
    <template #extra>
      <Space>
        <a-button type="primary" @click="handleAdd">新增EIM</a-button>
        <a-button type="primary" @click="handleSynchronize">同步数据</a-button>
      </Space>
    </template>
    <Table :data-source="tableData" :loading="loading" row-key="eimId" :columns="tableColumns">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <Space>
            <a-button type="link" size="small" @click="handleUpdate(record)">更新</a-button>
            <Popconfirm title="确认删除？删除后无法撤回" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger>删除</a-button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>
  </Card>
  <BasicModal :title="isEdit ? '更新EIM' : '新增EIM'">
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
