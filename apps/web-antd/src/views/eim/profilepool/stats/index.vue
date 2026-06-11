<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { profileList } from '#/api/system/profile';
import {
  poolBatchRecycle,
  poolRecycle,
  poolStats,
} from '#/api/system/profile-pool';
import type { ProfilePoolStatsVO } from '#/api/system/profile-pool/model';
import { getPoolStatusMeta } from '#/utils/poolStatus';

import AllocateModal from './allocate-modal.vue';
import StatsCard from './stats-card.vue';
import { columns, querySchema } from './data';

// ============ 统计卡片 ============
const stats = ref<ProfilePoolStatsVO | null>(null);
const statsLoading = ref(false);

async function loadStats() {
  statsLoading.value = true;
  try {
    stats.value = await poolStats('');
  } catch (error) {
    console.error(error);
  } finally {
    statsLoading.value = false;
  }
}

const statItems = () => [
  {
    title: '未分配',
    value: stats.value?.unassignedCount ?? 0,
    gradient: 'linear-gradient(135deg, #a8a8a8 0%, #d0d0d0 100%)',
  },
  {
    title: '已分配',
    value: stats.value?.assignedCount ?? 0,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    title: '已下载',
    value: stats.value?.downloadedCount ?? 0,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    title: '可回收',
    value: stats.value?.recycleableCount ?? 0,
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
];

// ============ 表格 ============
const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    checkMethod: ({ row }) =>
      row.poolStatus === 'DOWNLOADED' || row.poolStatus === 'RECYCLEABLE',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await profileList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-pool-total-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [AllocateModalComp, allocateApi] = useVbenModal({
  connectedComponent: AllocateModal,
});

async function handleAllocate(row?: any) {
  allocateApi.setData({ productionBatch: row?.productionBatch });
  allocateApi.open();
}

async function handleRecycle(row: any) {
  await poolRecycle(row.id);
  await Promise.all([tableApi.query(), loadStats()]);
}

async function handleBatchRecycle() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((r: any) => String(r.id));
  if (ids.length === 0) {
    window.message.warning('请先选择要回收的码号');
    return;
  }
  window.modal.confirm({
    title: '批量回收',
    content: `确认回收选中的 ${ids.length} 条码号？回收后将变为"可回收"状态。`,
    onOk: async () => {
      await poolBatchRecycle({ profileIds: ids });
      await Promise.all([tableApi.query(), loadStats()]);
    },
  });
}

async function refreshAll() {
  await Promise.all([tableApi.query(), loadStats()]);
}

onMounted(() => loadStats());
</script>

<template>
  <Page :auto-content-height="false">
    <!-- 统计卡片 -->
    <div class="mb-4">
      <StatsCard :loading="statsLoading" :items="statItems()" />
    </div>

    <!-- 表格 -->
    <BasicTable table-title="资源总池">
      <template #toolbar-tools>
        <Space>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            @click="handleBatchRecycle"
          >
            批量回收
          </a-button>
          <a-button type="primary" @click="handleAllocate()">分配到租户</a-button>
        </Space>
      </template>

      <template #poolStatus="{ row }">
        <Tag :color="getPoolStatusMeta(row.poolStatus).color">
          {{ getPoolStatusMeta(row.poolStatus).text }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <action-button
            v-if="row.poolStatus === 'UNASSIGNED'"
            variant="link"
            color="blue"
            @click.stop="handleAllocate(row)"
          >
            分配
          </action-button>
          <Popconfirm
            v-if="
              row.poolStatus === 'DOWNLOADED' ||
              row.poolStatus === 'RECYCLEABLE'
            "
            placement="left"
            title="确认回收？"
            @confirm="handleRecycle(row)"
          >
            <action-button danger @click.stop="">回收</action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <AllocateModalComp @reload="refreshAll" />
  </Page>
</template>
