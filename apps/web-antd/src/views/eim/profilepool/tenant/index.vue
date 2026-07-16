<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import { Card, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { profileList } from '#/api/system/profile';
import { poolRecycle, poolStats } from '#/api/system/profile-pool';
import type { ProfilePoolStatsVO } from '#/api/system/profile-pool/model';
import { useTenantStore } from '#/store/tenant';
import { confirmActionModal } from '#/utils/modal';
import { getTenantPoolStatusMeta } from '#/utils/poolStatus';

import StatsCard from './stats-card.vue';
import { columns, querySchema } from './data';

// ============ 租户选择 ============
const tenantStore = useTenantStore();
const selectedTenantId = ref<string>('');

const tenantOptions = computed(() =>
  tenantStore.tenantList.map((t) => ({
    label: t.companyName,
    value: t.tenantId,
  })),
);

// ============ 统计 ============
const stats = ref<ProfilePoolStatsVO | null>(null);
const statsLoading = ref(false);

async function loadStats() {
  if (!selectedTenantId.value) return;
  statsLoading.value = true;
  try {
    stats.value = await poolStats(selectedTenantId.value);
  } catch (error) {
    console.error(error);
  } finally {
    statsLoading.value = false;
  }
}

const statItems = () => [
  {
    title: '空闲',
    value: stats.value?.assignedCount ?? 0,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    title: '已下载',
    value: stats.value?.downloadedCount ?? 0,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    title: '已删除',
    value: stats.value?.recycleableCount ?? 0,
    gradient: 'linear-gradient(135deg, #ff6a88 0%, #ff99ac 100%)',
  },
];

// ============ 表格 ============
const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await profileList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          assignedTenantId: selectedTenantId.value,
          ...formValues,
        });
        const rows = (result?.rows ?? []).map((row: any) => ({
          ...row,
          id: String(row.id),
        }));
        return { ...result, rows };
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-pool-tenant-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

function handleRecycleClick(row: any) {
  confirmActionModal({
    title: '回收确认',
    content: '确认回收？',
    onOk: () => handleRecycle(row),
  });
}

async function handleRecycle(row: any) {
  await poolRecycle(String(row.id));
  await Promise.all([tableApi.query(), loadStats()]);
}

watch(selectedTenantId, async () => {
  await Promise.all([tableApi.query(), loadStats()]);
});

onMounted(async () => {
  if (tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
  const first = tenantStore.tenantList[0];
  if (first) selectedTenantId.value = first.tenantId;
});
</script>

<template>
  <Page :auto-content-height="false">
    <!-- 租户选择 -->
    <Card
      :body-style="{ padding: '14px 18px' }"
      class="mb-4 shadow-sm transition hover:shadow-md"
    >
      <div class="flex items-center gap-3">
        <span class="text-base font-semibold">租户：</span>
        <a-select
          v-model:value="selectedTenantId"
          :options="tenantOptions"
          show-search
          option-filter-prop="label"
          placeholder="请选择租户"
          style="width: 280px"
        />
      </div>
    </Card>

    <!-- 统计卡片 -->
    <div class="mb-4">
      <StatsCard :loading="statsLoading" :items="statItems()" />
    </div>

    <!-- 表格 -->
    <BasicTable table-title="租户资源池">
      <template #poolStatus="{ row }">
        <Tag :color="getTenantPoolStatusMeta(row.poolStatus).color">
          {{ getTenantPoolStatusMeta(row.poolStatus).text }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <action-button
            v-if="
              row.poolStatus === 'DOWNLOADED' ||
              row.poolStatus === 'RECYCLEABLE'
            "
            danger
            @click.stop="handleRecycleClick(row)"
          >
            回收
          </action-button>
        </Space>
      </template>
    </BasicTable>
  </Page>
</template>
