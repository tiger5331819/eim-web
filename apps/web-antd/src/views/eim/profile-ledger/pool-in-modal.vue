<script setup lang="ts">
import { ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import {
  getLedgerEnabledTenantOptions,
  profileLedgerAvailableCount,
  profileLedgerPoolIn,
  profileLedgerPoolInOne,
} from '#/api/system/profile-ledger';
import { getOperatorOptions } from '#/api/system/operator';

const emit = defineEmits<{
  reload: [payload?: PoolInReloadPayload];
}>();

export type PoolInReloadPayload = {
  mode: 'batch' | 'row';
  profileId?: number | string;
  tenantId?: string;
  tenantName?: string;
};

const mode = ref<'batch' | 'row'>('batch');
const profileId = ref<number | string>('');
const availableCount = ref<number | null>(null);
const tenantOptions = ref<Array<{ label: string; value: string }>>([]);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Select',
      fieldName: 'tenantId',
      label: '目标租户',
      rules: 'required',
      componentProps: {
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择租户',
        options: [],
        style: { width: '100%' },
        onChange: () => loadAvailableCount(),
      },
    },
    {
      component: 'Select',
      fieldName: 'operatorId',
      label: '运营商',
      dependencies: {
        show: () => mode.value === 'batch',
        triggerFields: [''],
      },
      componentProps: {
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '全部运营商',
        options: [],
        style: { width: '100%' },
        popupMatchSelectWidth: false,
        styles: {
          popup: {
            root: { minWidth: '200px' },
          },
        },
        onChange: () => loadAvailableCount(),
      },
    },
    {
      component: 'Input',
      fieldName: 'availableDisplay',
      label: '可用数量',
      dependencies: {
        show: () => mode.value === 'batch',
        triggerFields: [''],
      },
      componentProps: { disabled: true },
    },
    {
      component: 'InputNumber',
      fieldName: 'size',
      label: '入池数量',
      rules: 'required',
      componentProps: {
        min: 1,
        precision: 0,
        style: 'width: 100%',
        placeholder: '请输入入池数量',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: mode.value === 'row' ? '入池备注' : '备注',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '记录入池原因或说明',
      },
    },
  ],
  showDefaultActions: false,
});

watch(availableCount, (value) => {
  formApi.setValues({
    availableDisplay: value === null ? '-' : String(value),
  });
});

async function loadAvailableCount() {
  if (mode.value !== 'batch') return;
  const values = await formApi.getValues();
  if (!values.tenantId) {
    availableCount.value = null;
    return;
  }
  try {
    const count = await profileLedgerAvailableCount({
      action: 'POOL_IN',
      tenantId: values.tenantId,
      operatorId: values.operatorId,
    });
    availableCount.value = Number(count ?? 0);
  } catch {
    availableCount.value = null;
  }
}

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: async () => {
    await formApi.resetForm();
    mode.value = 'batch';
    profileId.value = '';
    availableCount.value = null;
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    const data = modalApi.getData() as {
      mode?: 'batch' | 'row';
      profileId?: number | string;
    };
    mode.value = data?.mode ?? 'batch';
    profileId.value = data?.profileId ?? '';

    const [tenants, operators] = await Promise.all([
      getLedgerEnabledTenantOptions(),
      getOperatorOptions(),
    ]);
    tenantOptions.value = tenants;
    formApi.updateSchema([
      { fieldName: 'tenantId', componentProps: { options: tenants } },
      { fieldName: 'operatorId', componentProps: { options: operators } },
      {
        fieldName: 'size',
        componentProps: {
          disabled: mode.value === 'row',
          min: 1,
          precision: 0,
          style: 'width: 100%',
        },
        rules: mode.value === 'row' ? undefined : 'required',
      },
      {
        fieldName: 'remark',
        label: mode.value === 'row' ? '入池备注' : '备注',
        rules: mode.value === 'row' ? 'required' : undefined,
      },
    ]);

    await formApi.setValues({ size: 1 });
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());

    if (
      mode.value === 'batch' &&
      availableCount.value !== null &&
      values.size > availableCount.value
    ) {
      window.message.warning(`入池数量不能超过可用数量 ${availableCount.value}`);
      return;
    }

    const tenantName =
      tenantOptions.value.find((item) => item.value === values.tenantId)
        ?.label ?? values.tenantId;

    if (mode.value === 'row') {
      await profileLedgerPoolInOne(profileId.value, {
        tenantId: values.tenantId,
        remark: values.remark,
      });
      window.message.success('入池成功');
      emit('reload', {
        mode: 'row',
        profileId: profileId.value,
        tenantId: values.tenantId,
        tenantName,
      });
    } else {
      const count = await profileLedgerPoolIn({
        tenantId: values.tenantId,
        operatorId: values.operatorId,
        size: values.size,
        remark: values.remark,
      });
      window.message.success(
        `成功入池 ${count ?? values.size} 个码号至${tenantName}`,
      );
      emit('reload', {
        mode: 'batch',
        tenantId: values.tenantId,
        tenantName,
      });
    }

    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}
</script>

<template>
  <BasicModal title="入池" class="w-[520px]">
    <div
      class="mb-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    >
      优先入池创建时间较早的码号。
    </div>
    <BasicForm />
  </BasicModal>
</template>
