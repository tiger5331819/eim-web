<script setup lang="ts">
import type { EimTenantVo } from '#/api/system/tenant/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';
import { eimTenantResetPassword } from '#/api/system/tenant';

const passwordPattern = /^(?![0-9]+$)(?![a-zA-Z]+$)[A-Za-z0-9]{8,20}$/;

const emit = defineEmits<{ reload: [] }>();

const currentTenant = ref<EimTenantVo | null>(null);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 90,
  },
  schema: [
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      fieldName: 'id',
      label: 'id',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'companyName',
      label: '租户名称',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入新密码（8-20位，含字母和数字）',
      },
      fieldName: 'newPassword',
      label: '新密码',
      rules: z.string().regex(passwordPattern, {
        message: '密码需8-20位，且同时包含字母和数字',
      }),
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请再次输入新密码',
      },
      dependencies: {
        rules(values) {
          return z
            .string({ message: '请再次输入新密码' })
            .min(1, { message: '请再次输入新密码' })
            .refine((value) => value === values.newPassword, {
              message: '两次输入的密码不一致',
            });
        },
        triggerFields: ['newPassword', 'confirmPassword'],
      },
      fieldName: 'confirmPassword',
      label: '确认密码',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onClosed: handleClosed,
  onConfirm: handleSubmit,
  onOpenChange: handleOpenChange,
});

async function handleOpenChange(open: boolean) {
  if (!open) {
    return null;
  }
  modalApi.modalLoading(true);
  const { record } = modalApi.getData() as { record: EimTenantVo };
  currentTenant.value = record;
  await formApi.setValues({
    id: String(record.id),
    companyName: record.companyName,
  });
  modalApi.modalLoading(false);
}

async function handleSubmit() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const { id, newPassword } = await formApi.getValues();
    await eimTenantResetPassword({ id: String(id), newPassword });
    window.message.success('密码重置成功');
    emit('reload');
    handleClosed();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleClosed() {
  modalApi.close();
  await formApi.resetForm();
  currentTenant.value = null;
}
</script>

<template>
  <BasicModal :close-on-click-modal="false" title="重置密码" class="w-[480px]">
    <BasicForm />
  </BasicModal>
</template>
