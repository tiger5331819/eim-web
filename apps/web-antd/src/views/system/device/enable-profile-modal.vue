<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { toEnable } from '#/api/system/device';

const emit = defineEmits<{ reload: [] }>();

const eid = ref('');
const iccid = ref('');

const [BasicModal, modalApi] = useVbenModal({
  cancelText: '取消',
  confirmText: '继续',
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { eid?: string; iccid?: string };
    eid.value = data.eid ?? '';
    iccid.value = data.iccid ?? '';
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    await toEnable(eid.value, iccid.value);
    window.message.success('操作成功');
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
  <BasicModal title="启用码号" class="w-[520px]">
    <div class="space-y-6 px-1 py-3">
      <div>
        <div class="mb-3 text-sm">ICCID</div>
        <div>{{ iccid || '--' }}</div>
      </div>
      <div>
        <div class="mb-3 text-sm">确认</div>
        <p class="text-red-500 text-sm">
          请确认此码号是否已更新APN，若未更新APN先启用，会导致设备无法联网，请问是否继续？
        </p>
      </div>
    </div>
  </BasicModal>
</template>
