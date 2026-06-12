<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { eimTenantLicenseAdjust } from '#/api/system/tenant';

const emit = defineEmits<{ reload: [] }>();

const tenantId = ref<number>(0);
const currentQuota = ref<number>(0);
const previewDelta = ref<number | undefined>(undefined);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 100,
  },
  schema: [
    {
      component: 'InputNumber',
      componentProps: {
        step: 100,
        precision: 0,
        style: 'width: 100%',
        placeholder: '正数为增加，负数为扣减',
        onChange: (val: number) => {
          previewDelta.value = val;
        },
      },
      fieldName: 'delta',
      label: '调整数量',
      rules: 'required',
      help: '正数为增加，负数为扣减（如：-100 表示扣减 100 次）',
    },
    {
      component: 'Textarea',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '请说明调整原因',
      },
      fieldName: 'remark',
      label: '备注',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => {
    formApi.resetForm();
    previewDelta.value = undefined;
  },
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { tenantId: number; current: number };
    tenantId.value = data.tenantId;
    currentQuota.value = data.current;
  },
});

const previewResult = computed(() => {
  if (previewDelta.value === undefined || previewDelta.value === null) {
    return null;
  }
  return currentQuota.value + previewDelta.value;
});

const previewClass = computed(() => {
  if (previewDelta.value === undefined || previewDelta.value === null) {
    return 'text-gray-500';
  }
  return previewDelta.value > 0 ? 'text-emerald-600' : 'text-rose-600';
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    await eimTenantLicenseAdjust({
      tenantId: tenantId.value,
      delta: values.delta,
      remark: values.remark,
    });
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
  <BasicModal title="调整 License 次数" class="w-[480px]">
    <div class="mb-3 grid grid-cols-3 gap-2 rounded bg-gray-50 p-3 dark:bg-gray-800/40">
      <div class="text-center">
        <div class="text-xs text-gray-500">当前可用</div>
        <div class="text-lg font-semibold">{{ currentQuota }}</div>
      </div>
      <div class="flex items-center justify-center text-2xl text-gray-400">→</div>
      <div class="text-center">
        <div class="text-xs text-gray-500">调整后</div>
        <div :class="['text-lg', 'font-semibold', previewClass]">
          {{ previewResult ?? '--' }}
        </div>
      </div>
    </div>
    <BasicForm />
  </BasicModal>
</template>
