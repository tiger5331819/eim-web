<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  myProfileExport,
  myProfileList,
  myProfileStats,
} from '#/api/system/my-profile';
import type { MyProfileStatsVo } from '#/api/system/my-profile/model';
import { useBlobExport } from '#/utils/file/export';
import {
  formatBoundEid,
  formatDownloadTime,
  getMyProfileStatusMeta,
} from '#/utils/myProfileStatus';

import StatsCard from './stats-card.vue';
import { buildStatsItems, columns, querySchema } from './data';
import DeleteLogDrawer from './delete-log-drawer.vue';

const stats = ref<MyProfileStatsVo | null>(null);
const statsLoading = ref(false);

async function loadStats() {
  statsLoading.value = true;
  try {
    stats.value = await myProfileStats();
  } catch {
    stats.value = null;
  } finally {
    statsLoading.value = false;
  }
}

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无码号数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await myProfileList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'my-profile-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

const [DeleteLogDrawerComp, deleteLogDrawerApi] = useVbenDrawer({
  connectedComponent: DeleteLogDrawer,
});

function handleOpenDeleteLog() {
  deleteLogDrawerApi.open();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(myProfileExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('我的码号');
  try {
    await exportBlob({ data: formValues, fileName });
    window.message.success('导出成功');
  } catch {
    window.message.error('导出失败');
  }
}

onMounted(() => {
  loadStats();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-4">
      <StatsCard :loading="statsLoading" :items="buildStatsItems(stats)" />
    </div>

    <BasicTable>
      <template #toolbar-actions>
        <a-button
          v-access:code="['eim:myProfile:delete']"
          @click="handleOpenDeleteLog"
        >
          删除记录
        </a-button>
      </template>
      <template #toolbar-tools>
        <a-button
          :disabled="exportLoading"
          :loading="exportLoading"
          v-access:code="['eim:myProfile:export']"
          @click="handleExport"
        >
          导出
        </a-button>
      </template>

      <template #status="{ row }">
        <Tag
          :color="getMyProfileStatusMeta(row.status, row.statusText).color"
        >
          {{ getMyProfileStatusMeta(row.status, row.statusText).text }}
        </Tag>
      </template>

      <template #eid="{ row }">
        {{ formatBoundEid(row.status, row.eid) }}
      </template>

      <template #downloadedTime="{ row }">
        {{ formatDownloadTime(row.status, row.downloadedTime) }}
      </template>
    </BasicTable>

    <DeleteLogDrawerComp />
  </Page>
</template>
