<script setup lang="ts">
import { ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import {
  getLedgerTenantOptions,
  profileLedgerAvailableCount,
  profileLedgerPoolOut,
} from '#/api/system/profile-ledger';
import { getOperatorOptions } from '#/api/system/operator';

const emit = defineEmits<{ reload: [] }>();

const availableCount = ref<number | null>(null);
const tenantOptions = ref<Array<{ label: string; value: string }>>([]);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Select',
      fieldName: 'tenantId',
      label: '源租户',
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
      componentProps: {
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '全部运营商',
        options: [],
        style: { width: '100%' },
        popupMatchSelectWidth: false,
        dropdownStyle: { minWidth: '200px' },
        onChange: () => loadAvailableCount(),
      },
    },
    {
      component: 'Input',
      fieldName: 'availableDisplay',
      label: '可出池数量',
      componentProps: { disabled: true },
    },
    {
      component: 'InputNumber',
      fieldName: 'size',
      label: '出池数量',
      rules: 'required',
      componentProps: {
        min: 1,
        precision: 0,
        style: 'width: 100%',
        placeholder: '请输入出池数量',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '记录出池原因或说明',
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
  const values = await formApi.getValues();
  if (!values.tenantId) {
    availableCount.value = null;
    return;
  }
  try {
    const count = await profileLedgerAvailableCount({
      action: 'POOL_OUT',
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
    availableCount.value = null;
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    const [tenants, operators] = await Promise.all([
      getLedgerTenantOptions(),
      getOperatorOptions(),
    ]);
    tenantOptions.value = tenants;
    formApi.updateSchema([
      { fieldName: 'tenantId', componentProps: { options: tenants } },
      { fieldName: 'operatorId', componentProps: { options: operators } },
    ]);
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
      availableCount.value !== null &&
      values.size > availableCount.value
    ) {
      window.message.warning(`出池数量不能超过可出池数量 ${availableCount.value}`);
      return;
    }

    const count = await profileLedgerPoolOut({
      tenantId: values.tenantId,
      operatorId: values.operatorId,
      size: values.size,
      remark: values.remark,
    });
    window.message.success(`成功出池 ${count ?? values.size} 个码号`);
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
  <BasicModal title="出池" class="w-[520px]">
    <div class="mb-3 space-y-1 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
      <div>出池后号码退回总池、清除租户归属，可再次入池。</div>
      <div>优先出池创建时间较晚的号码。</div>
    </div>
    <BasicForm />
  </BasicModal>
</template>
