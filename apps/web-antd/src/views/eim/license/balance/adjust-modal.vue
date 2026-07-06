<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { adjustLicense } from '#/api/system/license';
import { ADJUST_TYPE_OPTIONS } from '#/utils/licenseStatus';

import { ADJUST_REASON_OPTIONS } from './data';

const emit = defineEmits<{ reload: [] }>();

const tenantId = ref('');
const tenantName = ref('');
const currentQuota = ref(0);
const adjustType = ref<'DEDUCT' | 'RECHARGE'>('RECHARGE');
const quotaValue = ref<number | undefined>();

const previewQuota = computed(() => {
  if (!quotaValue.value || quotaValue.value <= 0) return null;
  return adjustType.value === 'RECHARGE'
    ? currentQuota.value + quotaValue.value
    : currentQuota.value - quotaValue.value;
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 90,
  },
  schema: [
    {
      component: 'RadioGroup',
      componentProps: {
        options: ADJUST_TYPE_OPTIONS,
        onChange: (value: 'DEDUCT' | 'RECHARGE') => {
          adjustType.value = value;
        },
      },
      defaultValue: 'RECHARGE',
      fieldName: 'adjustType',
      label: '调整类型',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
        precision: 0,
        style: 'width: 100%',
        placeholder: '请输入变动数量',
        onChange: (value: number) => {
          quotaValue.value = value;
        },
      },
      fieldName: 'quota',
      label: '变动数量',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: ADJUST_REASON_OPTIONS,
        placeholder: '请选择',
        style: { width: '100%' },
        popupMatchSelectWidth: false,
        dropdownStyle: { minWidth: '200px' },
      },
      fieldName: 'reason',
      label: '变动原因',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '请输入操作备注',
      },
      fieldName: 'remark',
      label: '操作备注',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => {
    formApi.resetForm();
    adjustType.value = 'RECHARGE';
    quotaValue.value = undefined;
  },
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as {
      tenantId: string;
      tenantName?: string;
      current: number;
    };
    tenantId.value = data.tenantId;
    tenantName.value = data.tenantName ?? '';
    currentQuota.value = data.current;
    adjustType.value = 'RECHARGE';
    quotaValue.value = undefined;
    formApi.setValues({ adjustType: 'RECHARGE' });
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    const type = values.adjustType as 'DEDUCT' | 'RECHARGE';
    const quota = values.quota as number;

    if (type === 'DEDUCT' && quota > currentQuota.value) {
      window.message.error('扣减数量不能超过当前可用剩余额度');
      return;
    }

    await adjustLicense({
      tenantId: tenantId.value,
      adjustType: type,
      quota,
      reason: values.reason,
      remark: values.remark,
    });
    window.message.success('额度调整成功');
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
  <BasicModal title="额度调整" class="w-[520px]">
    <div class="mb-4 rounded-md bg-muted/40 px-4 py-3 text-sm">
      <div class="text-foreground/65">当前租户</div>
      <div class="font-medium">{{ tenantName || tenantId }}</div>
      <div class="mt-2 flex items-baseline gap-6">
        <div>
          <span class="text-foreground/65">当前余额 </span>
          <span class="text-lg font-semibold">{{ currentQuota }}</span>
        </div>
        <div v-if="previewQuota !== null">
          <span class="text-foreground/65">调整后 </span>
          <span
            class="text-lg font-semibold"
            :class="
              previewQuota < currentQuota
                ? 'text-rose-600'
                : 'text-emerald-600'
            "
          >
            {{ previewQuota }}
          </span>
        </div>
      </div>
    </div>
    <BasicForm />
  </BasicModal>
</template>
