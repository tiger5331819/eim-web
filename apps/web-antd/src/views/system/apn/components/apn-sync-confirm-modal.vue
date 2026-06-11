<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Checkbox, Select, Tag } from 'antdv-next';

import { apnByCarrier } from '#/api/system/apn';
import type { ApnVO } from '#/api/system/apn/model';

interface SyncConfirmData {
  /** 运营商编码（必填，用于拉取 APN 列表） */
  carrierCode: string;
  /** 运营商名称（仅用于展示，可选） */
  carrierName?: string;
  /** 默认 APN ID（可选，用作初始选中值） */
  defaultApnId?: string;
  /** 默认 APN 显示名（可选，用作头部展示） */
  defaultApnName?: string;
  /** 头部业务提示（如 "ICCID xxxxx 已启用"） */
  bizHint?: string;
}

const emit = defineEmits<{
  /** 用户确认：apnId 为选中的 APN ID；sync 表示是否同步下发到设备 */
  confirm: [payload: { apnId: string; sync: boolean }];
}>();

const data = ref<SyncConfirmData | null>(null);
const apnList = ref<ApnVO[]>([]);
const loading = ref(false);
const selectedApnId = ref<string>('');
const syncToDevice = ref<boolean>(true);

const apnOptions = computed(() =>
  apnList.value.map((a) => ({
    label: `${a.name}（${a.apn}）${a.isDefault === '1' ? ' ⭐默认' : ''}`,
    value: String(a.id),
  })),
);

const selectedApn = computed(() =>
  apnList.value.find((a) => String(a.id) === selectedApnId.value),
);

async function loadApnList() {
  if (!data.value?.carrierCode) return;
  loading.value = true;
  try {
    apnList.value = await apnByCarrier(data.value.carrierCode);
    // 默认选中：优先 setData 传入的 defaultApnId，否则取列表中的默认 APN，否则第一个
    if (
      data.value.defaultApnId &&
      apnList.value.some((a) => String(a.id) === String(data.value!.defaultApnId))
    ) {
      selectedApnId.value = String(data.value.defaultApnId);
    } else {
      const defaultOne = apnList.value.find((a) => a.isDefault === '1');
      selectedApnId.value = String(
        defaultOne?.id ?? apnList.value[0]?.id ?? '',
      );
    }
  } catch (error) {
    console.error(error);
    apnList.value = [];
    selectedApnId.value = '';
  } finally {
    loading.value = false;
  }
}

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => {
    apnList.value = [];
    selectedApnId.value = '';
    syncToDevice.value = true;
    data.value = null;
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    data.value = modalApi.getData() as SyncConfirmData;
    syncToDevice.value = true;
    await loadApnList();
  },
});

function handleConfirm() {
  if (!selectedApnId.value) {
    window.message.warning('请选择 APN');
    return;
  }
  emit('confirm', {
    apnId: selectedApnId.value,
    sync: syncToDevice.value,
  });
  modalApi.close();
}
</script>

<template>
  <BasicModal title="确认 APN 配置" class="w-[520px]">
    <div class="space-y-4">
      <!-- 业务提示横幅 -->
      <div
        v-if="data?.bizHint"
        class="rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
      >
        {{ data.bizHint }}
      </div>

      <!-- 当前运营商信息 -->
      <div class="rounded border border-gray-200 p-3 dark:border-gray-700">
        <div class="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <span>运营商：</span>
          <Tag color="blue">
            {{ data?.carrierName || data?.carrierCode || '--' }}
          </Tag>
        </div>
        <div class="text-xs text-gray-500">
          系统默认 APN：
          <span class="font-medium text-gray-700 dark:text-gray-200">
            {{ data?.defaultApnName || '尚未配置' }}
          </span>
        </div>
      </div>

      <!-- APN 选择 -->
      <div>
        <div class="mb-2 text-sm font-medium">选择要使用的 APN</div>
        <Select
          v-model:value="selectedApnId"
          :options="apnOptions"
          :loading="loading"
          placeholder="请选择 APN"
          style="width: 100%"
        />
        <div
          v-if="selectedApn"
          class="mt-2 rounded bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800/40"
        >
          {{ selectedApn.name }} · {{ selectedApn.apn }} ·
          适用地区 {{ selectedApn.local }}
        </div>
      </div>

      <!-- 是否同步开关 -->
      <div class="rounded bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
        <Checkbox v-model:checked="syncToDevice">
          <span class="text-sm">同步下发到设备</span>
        </Checkbox>
        <div class="mt-1 pl-6 text-xs text-amber-700 dark:text-amber-300">
          勾选后将向设备下发更换 APN 指令，由设备侧切换预置 APN
        </div>
      </div>
    </div>
  </BasicModal>
</template>
