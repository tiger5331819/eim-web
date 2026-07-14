<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Alert, Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  profileChangeSnapshotExport,
  profileChangeSnapshotList,
} from '#/api/system/profile-change';
import { useBlobExport } from '#/utils/file/export';
import { getCodeStatusMeta } from '#/utils/profileLedgerStatus';

import { snapshotColumns, snapshotQuerySchema } from './data';

const changeNo = ref('');

const drawerTitle = computed(() => `${changeNo.value} - 变动快照`);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: snapshotQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  columns: snapshotColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无码号数据',
  toolbarConfig: {
    refresh: false,
    zoom: false,
    custom: false,
  },
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await profileChangeSnapshotList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          changeNo: changeNo.value,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-change-snapshot-drawer',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const { exportBlob, exportLoading } = useBlobExport(profileChangeSnapshotExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `${changeNo.value}_变动快照_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: {
        changeNo: changeNo.value,
        ...formValues,
      },
      fileName,
    });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  contentClass: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData() as { changeNo?: string };
    changeNo.value = data?.changeNo ?? '';
    void nextTick(() => tableApi.reload());
  },
  onClosed() {
    changeNo.value = '';
  },
});
</script>

<template>
  <BasicDrawer class="w-[1100px]" :title="drawerTitle">
    <div class="flex h-full min-h-0 flex-col gap-4">
      <Alert
        class="shrink-0"
        :closable="false"
        show-icon
        type="info"
        message="以下为本次变动操作前的码号快照数据，展示的是变动发生时各码号的即时状态。"
      />

      <div class="flex min-h-0 flex-1 flex-col">
        <BasicTable>
        <template #toolbar-tools>
          <a-button
            :disabled="exportLoading"
            :loading="exportLoading"
            @click="handleExport"
          >
            <DownloadOutlined />
            导出
          </a-button>
        </template>

        <template #codeStatus="{ row }">
          <Tag
            :color="getCodeStatusMeta(row.codeStatus, row.codeStatusText).color"
          >
            {{ getCodeStatusMeta(row.codeStatus, row.codeStatusText).text }}
          </Tag>
        </template>
        </BasicTable>
      </div>
    </div>
  </BasicDrawer>
</template>
