<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref, watch } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Card, Empty, Select, Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { profileList } from '#/api/system/profile';
import { useTenantStore } from '#/store/tenant';
import { getProjectDict } from '#/views/system/cardImport/hooks/useGetDict';

import TransferModal from './transfer-modal.vue';

const tenantStore = useTenantStore();

const sourceTenantId = ref<string>('');
const targetTenantId = ref<string>('');
const targetProjectId = ref<string | undefined>(undefined);
const targetProjectOptions = ref<Array<{ label: string; value: string }>>([]);

const tenantOptions = computed(() =>
  tenantStore.tenantList.map((t) => ({
    label: t.companyName,
    value: t.tenantId,
  })),
);

const sourceTenantName = computed(() => {
  const t = tenantStore.tenantList.find(
    (x) => x.tenantId === sourceTenantId.value,
  );
  return t?.companyName ?? '';
});

const targetTenantName = computed(() => {
  const t = tenantStore.tenantList.find(
    (x) => x.tenantId === targetTenantId.value,
  );
  return t?.companyName ?? '';
});

const canTransfer = computed(
  () =>
    sourceTenantId.value &&
    targetTenantId.value &&
    sourceTenantId.value !== targetTenantId.value,
);

const sourceColumns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'ICCID', field: 'iccid', minWidth: 160 },
  { title: '运营商', field: 'carrierName', width: 120 },
  { title: '批次', field: 'productionBatch', width: 120 },
  { title: '项目', field: 'projectName', width: 140 },
];

const sourceGridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: false,
    checkMethod: ({ row }) => row.poolStatus === 'ASSIGNED',
  },
  columns: sourceColumns,
  height: 480,
  keepSource: true,
  pagerConfig: { pageSize: 20 },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        if (!sourceTenantId.value) {
          return { rows: [], total: 0 };
        }
        return await profileList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          assignedTenantId: sourceTenantId.value,
          poolStatus: 'ASSIGNED',
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-pool-transfer-source',
  showOverflow: 'tooltip',
};

const [SourceTable, sourceTableApi] = useVbenVxeGrid({
  gridOptions: sourceGridOptions,
});

watch(sourceTenantId, () => sourceTableApi.query());

watch(targetTenantId, async (newId) => {
  targetProjectId.value = undefined;
  if (newId) {
    targetProjectOptions.value = await getProjectDict(newId);
  } else {
    targetProjectOptions.value = [];
  }
});

const [TransferModalComp, transferApi] = useVbenModal({
  connectedComponent: TransferModal,
});

function handleTransfer() {
  const rows = sourceTableApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    window.message.warning('请先在左侧勾选要调配的码号');
    return;
  }
  transferApi.setData({
    fromTenantId: sourceTenantId.value,
    fromTenantName: sourceTenantName.value,
    toTenantId: targetTenantId.value,
    toTenantName: targetTenantName.value,
    toProjectId: targetProjectId.value,
    rows: rows.map((r: any) => ({ id: String(r.id), iccid: r.iccid })),
  });
  transferApi.open();
}

async function onTransferDone() {
  await sourceTableApi.query();
}

onMounted(async () => {
  if (tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
});
</script>

<template>
  <Page :auto-content-height="false">
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_120px_1fr]">
      <!-- 左：源租户 -->
      <Card
        :body-style="{ padding: '16px' }"
        title="📤 源租户（选择要转出的码号）"
        :head-style="{
          background:
            'linear-gradient(90deg, rgba(250,173,20,0.08) 0%, transparent 100%)',
        }"
        class="shadow-sm"
      >
        <div class="mb-3">
          <Select
            v-model:value="sourceTenantId"
            :options="tenantOptions"
            show-search
            option-filter-prop="label"
            placeholder="选择源租户"
            style="width: 100%"
          />
        </div>
        <SourceTable v-if="sourceTenantId" />
        <Empty v-else description="请先选择源租户" />
      </Card>

      <!-- 中：调配按钮 -->
      <div class="flex flex-col items-center justify-center gap-4 py-12">
        <div class="text-5xl text-gray-300">→</div>
        <Button
          type="primary"
          size="large"
          :disabled="!canTransfer"
          @click="handleTransfer"
        >
          调配选中
        </Button>
        <div
          v-if="
            sourceTenantId &&
            targetTenantId &&
            sourceTenantId === targetTenantId
          "
          class="text-center text-xs text-rose-500"
        >
          源与目标不能相同
        </div>
      </div>

      <!-- 右：目标租户 -->
      <Card
        :body-style="{ padding: '16px' }"
        title="📥 目标租户（选择接收方）"
        :head-style="{
          background:
            'linear-gradient(90deg, rgba(24,144,255,0.08) 0%, transparent 100%)',
        }"
        class="shadow-sm"
      >
        <div class="space-y-3">
          <div>
            <div class="mb-2 text-sm font-medium">目标租户</div>
            <Select
              v-model:value="targetTenantId"
              :options="tenantOptions"
              show-search
              option-filter-prop="label"
              placeholder="选择目标租户"
              style="width: 100%"
            />
          </div>
          <div>
            <div class="mb-2 text-sm font-medium">目标项目（可选）</div>
            <Select
              v-model:value="targetProjectId"
              :options="targetProjectOptions"
              allow-clear
              placeholder="不选则保留原项目归属"
              style="width: 100%"
              :disabled="!targetTenantId"
            />
          </div>

          <div
            v-if="canTransfer"
            class="mt-4 rounded bg-emerald-50 px-3 py-2 text-xs dark:bg-emerald-900/20"
          >
            <div class="flex items-center gap-2">
              <Tag color="orange">{{ sourceTenantName }}</Tag>
              <span>→</span>
              <Tag color="blue">{{ targetTenantName }}</Tag>
            </div>
            <div class="mt-1 text-emerald-700 dark:text-emerald-300">
              确认调配前请先在左侧勾选码号
            </div>
          </div>
        </div>
      </Card>
    </div>

    <TransferModalComp @done="onTransferDone" />
  </Page>
</template>
