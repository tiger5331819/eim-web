<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Upload } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { eimAdd, eimDetail, eimEdit } from '#/api/system/device';
import { getDictOptions } from '#/utils/dict';

const emit = defineEmits<{ reload: [] }>();

const isEdit = ref(false);
const eid = ref('');
const eimId = ref('');
const fileData = ref<any>(null);
const fileList = ref<any[]>([]);
const authMethod = ref('0');

const modalTitle = computed(() => (isEdit.value ? '更新EIM' : '新增EIM'));

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 180 },
  schema: [
    {
      component: 'Input',
      fieldName: 'eimId',
      label: 'EIMId',
      rules: [
        { required: true, message: 'EIMId不能为空' },
        { pattern: /^\d+(\.{1}\d+)+$/, message: '输入不合法' },
      ],
    },
    {
      component: 'Input',
      fieldName: 'eimFqdn',
      label: 'EIM地址',
      rules: [
        { required: true, message: 'EIM地址不能为空' },
        {
          pattern: /^\d+(\.{1}\d+)+(\:{1}\d+){1}$/,
          message: '输入不合法',
        },
      ],
    },
    {
      component: 'Select',
      fieldName: 'eimIdType',
      label: 'EIMIdType',
      rules: 'required',
      componentProps: {
        options: getDictOptions('sys_eim_id'),
        placeholder: '请选择',
      },
    },
    {
      component: 'Input',
      fieldName: 'counterValue',
      label: 'counterValue',
      rules: [{ pattern: /^[A-Za-z0-9]*$/, message: '输入不合法' }],
    },
    {
      component: 'Input',
      fieldName: 'associationToken',
      label: 'associationToken',
      componentProps: { disabled: true },
    },
    {
      component: 'RadioGroup',
      fieldName: 'authenticationMethod',
      label: 'authenticationMethod',
      rules: 'required',
      defaultValue: '0',
      componentProps: {
        options: getDictOptions('sye_eim_method'),
        onChange: (value: string) => {
          authMethod.value = String(value ?? '0');
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'eimPublicKey',
      label: 'eimPublicKey',
      dependencies: {
        show(values) {
          return values.authenticationMethod === '0';
        },
        triggerFields: ['authenticationMethod'],
      },
      rules: [
        { required: true, message: 'eimPublicKey不能为空' },
        {
          pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>/?]*$/,
          message: '输入不合法',
        },
      ],
    },
    {
      component: 'Input',
      fieldName: 'eimCertificate',
      label: 'eimCertificate',
      dependencies: {
        show(values) {
          return values.authenticationMethod === '1';
        },
        triggerFields: ['authenticationMethod'],
      },
      componentProps: {
        disabled: true,
        placeholder: '请上传证书文件',
      },
    },
    {
      component: 'Input',
      fieldName: 'trustedEimPkTls',
      label: 'trustedPublicKeyDataTls',
      rules: [{ pattern: /^[A-Za-z0-9]*$/, message: '输入不合法' }],
    },
    {
      component: 'Select',
      fieldName: 'eimSupportedProtocol',
      label: 'eimSupportedProtocol',
      rules: 'required',
      componentProps: {
        options: getDictOptions('sys_eim_sp'),
        placeholder: '请选择',
      },
    },
    {
      component: 'Input',
      fieldName: 'euiccCipkId',
      label: 'euiccCiPKld',
      rules: [{ pattern: /^[A-Za-z0-9]*$/, message: '输入不合法' }],
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  class: 'w-[700px]',
  zIndex: 2000,
  onConfirm: handleConfirm,
  onClosed: async () => {
    await formApi.resetForm();
    fileData.value = null;
    fileList.value = [];
    authMethod.value = '0';
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    try {
      const data = modalApi.getData() as {
        eid?: string;
        eimId?: string;
        isEdit?: boolean;
      };
      eid.value = data.eid ?? '';
      isEdit.value = !!data.isEdit;
      eimId.value = data.eimId ?? '';
      fileData.value = null;
      fileList.value = [];
      await formApi.resetForm();
      authMethod.value = '0';

      if (isEdit.value && eid.value && eimId.value) {
        const res = await eimDetail(eid.value, eimId.value);
        const detail = (res as any)?.data ?? res ?? {};
        if (!detail.counterValue) detail.counterValue = '0';
        detail.authenticationMethod = detail.eimPublicKey ? '0' : '1';
        authMethod.value = String(detail.authenticationMethod);
        await formApi.setValues(detail);
      } else {
        await formApi.setValues({ authenticationMethod: '0' });
      }
    } finally {
      modalApi.modalLoading(false);
    }
  },
});

function handleFileChange(info: any) {
  const file = info.file;
  if (!file) return;
  const name = file.name || file.originFileObj?.name || '';
  const ext = name.substring(name.lastIndexOf('.'));
  if (ext !== '.der' && ext !== '.pem') {
    window.message.error('文件格式错误，仅支持 .der .pem');
    return;
  }
  fileData.value = file.originFileObj || file;
  fileList.value = info.fileList?.slice(-1) || [];
  formApi.setValues({ eimCertificate: name });
}

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const param = new FormData();
    const req = new Blob([JSON.stringify(values)], {
      type: 'application/json',
    });
    if (fileData.value && values.authenticationMethod === '1') {
      param.append('eimCertificate', fileData.value);
    } else {
      param.append('eimCertificate', '');
    }
    param.append('req', req);
    if (!isEdit.value) {
      await eimAdd(eid.value, param);
    } else {
      await eimEdit(eid.value, eimId.value, param);
    }
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
  <BasicModal :title="modalTitle">
    <BasicForm />
    <div v-if="authMethod === '1'" class="ml-[180px] mt-2">
      <Upload
        :file-list="fileList"
        accept=".der,.pem"
        :max-count="1"
        :before-upload="() => false"
        @change="handleFileChange"
      >
        <a-button size="small">上传证书文件</a-button>
      </Upload>
      <span class="ml-2 text-xs text-gray-400">支持扩展名：.der .pem</span>
    </div>
  </BasicModal>
</template>
