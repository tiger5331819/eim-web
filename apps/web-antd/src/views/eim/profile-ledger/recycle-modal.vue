<script setup lang="ts">
import { ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import {
  getLedgerTenantOptions,
  profileLedgerAvailableCount,
  profileLedgerPoolRecycle,
  profileLedgerPoolRecycleSelected,
} from '#/api/system/profile-ledger';
import { getOperatorOptions } from '#/api/system/operator';

const emit = defineEmits<{ reload: [] }>();

const mode = ref<'batch' | 'selected'>('batch');
const selectedIds = ref<Array<number | string>>([]);
const availableCount = ref<number | null>(null);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Select',
      fieldName: 'tenantId',
      label: '源租户',
      rules: 'required',
      dependencies: {
        show: () => mode.value === 'batch',
        triggerFields: [''],
      },
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
      label: '可回收数量',
      dependencies: {
        show: () => mode.value === 'batch',
        triggerFields: [''],
      },
      componentProps: { disabled: true },
    },
    {
      component: 'InputNumber',
      fieldName: 'size',
      label: '回收数量',
      rules: 'required',
      componentProps: {
        min: 1,
        precision: 0,
        style: 'width: 100%',
        placeholder: '请输入回收数量',
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
        placeholder: '记录回收原因或说明',
      },
    },
  ],
  showDefaultActions: false,
});

watch(availableCount, (value) => {
  if (mode.value !== 'batch') return;
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
      action: 'RECYCLE',
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
    selectedIds.value = [];
    availableCount.value = null;
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    const data = modalApi.getData() as {
      mode?: 'batch' | 'selected';
      profileIds?: Array<number | string>;
    };
    mode.value = data?.mode ?? 'batch';
    selectedIds.value = data?.profileIds ?? [];

    const [tenants, operators] = await Promise.all([
      getLedgerTenantOptions(),
      getOperatorOptions(),
    ]);
    formApi.updateSchema([
      { fieldName: 'tenantId', componentProps: { options: tenants } },
      { fieldName: 'operatorId', componentProps: { options: operators } },
      {
        fieldName: 'size',
        componentProps: {
          disabled: mode.value === 'selected',
          min: 1,
          precision: 0,
          style: 'width: 100%',
          placeholder:
            mode.value === 'selected' ? undefined : '请输入回收数量',
        },
        rules: mode.value === 'batch' ? 'required' : undefined,
      },
    ]);

    if (mode.value === 'selected') {
      await formApi.setValues({ size: selectedIds.value.length });
    }

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());

    if (mode.value === 'selected') {
      await profileLedgerPoolRecycleSelected({
        profileIds: selectedIds.value,
        remark: values.remark,
      });
      window.message.success(`成功回收 ${selectedIds.value.length} 个码号`);
    } else {
      if (
        availableCount.value !== null &&
        values.size > availableCount.value
      ) {
        window.message.warning(
          `回收数量不能超过可回收数量 ${availableCount.value}`,
        );
        return;
      }
      const count = await profileLedgerPoolRecycle({
        tenantId: values.tenantId,
        operatorId: values.operatorId,
        size: values.size,
        remark: values.remark,
      });
      window.message.success(`成功回收 ${count ?? values.size} 个码号`);
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
  <BasicModal title="回收" class="w-[520px]">
    <div
      class="mb-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    >
      回收后号码退回总池并转为空闲，可再次入池。
    </div>
    <BasicForm />
  </BasicModal>
</template>
