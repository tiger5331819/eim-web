<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Input, Tag } from 'antdv-next';

import { poolTransfer } from '#/api/system/profile-pool';

interface TransferData {
  fromTenantId: string;
  fromTenantName: string;
  toTenantId: string;
  toTenantName: string;
  toProjectId?: string;
  rows: Array<{ id: string; iccid: string }>;
}

const emit = defineEmits<{ done: [] }>();

const data = ref<TransferData | null>(null);
const remark = ref<string>('');
const submitting = ref<boolean>(false);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => {
    data.value = null;
    remark.value = '';
    submitting.value = false;
  },
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    data.value = modalApi.getData() as TransferData;
  },
});

async function handleConfirm() {
  if (!data.value || data.value.rows.length === 0) return;
  try {
    modalApi.lock(true);
    submitting.value = true;
    for (const r of data.value.rows) {
      await poolTransfer({
        profileId: r.id,
        fromTenantId: data.value.fromTenantId,
        toTenantId: data.value.toTenantId,
        toProjectId: data.value.toProjectId,
        remark: remark.value,
      });
    }
    window.message.success(`成功调配 ${data.value.rows.length} 条`);
    emit('done');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
    submitting.value = false;
  }
}
</script>

<template>
  <BasicModal title="确认调配" class="w-[520px]">
    <div v-if="data" class="space-y-4">
      <div class="rounded border border-gray-200 p-3 dark:border-gray-700">
        <div class="grid grid-cols-[1fr_auto_1fr] gap-3">
          <div class="text-center">
            <div class="mb-1 text-xs text-gray-500">来源租户</div>
            <Tag color="orange">{{ data.fromTenantName }}</Tag>
          </div>
          <div class="flex items-center text-2xl text-gray-400">→</div>
          <div class="text-center">
            <div class="mb-1 text-xs text-gray-500">目标租户</div>
            <Tag color="blue">{{ data.toTenantName }}</Tag>
          </div>
        </div>
      </div>

      <div
        class="rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
      >
        共选择 <span class="font-semibold">{{ data.rows.length }}</span> 条码号进行调配
      </div>

      <div>
        <div class="mb-2 text-sm font-medium">备注（可选）</div>
        <Input.TextArea
          v-model:value="remark"
          :rows="3"
          :maxlength="200"
          show-count
          placeholder="可填写调配原因等说明"
        />
      </div>
    </div>
  </BasicModal>
</template>
