<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { InventoryChangeLogVo } from '#/api/system/inventory-change/model';

import { useVbenDrawer } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  inventoryChangeLogExport,
  inventoryChangeLogList,
} from '#/api/system/inventory-change';
import { useBlobExport } from '#/utils/file/export';
import {
  getInventoryChangeTypeMeta,
  mapInventoryChangeLogQuery,
} from '#/utils/inventoryChangeStatus';

import { logColumns, logFieldMappingTime, logQuerySchema } from './data';
import SnapshotDrawer from './snapshot-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: logQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [...logFieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns: logColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无库存变更记录',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await inventoryChangeLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapInventoryChangeLogQuery(formValues),
        });
        const rows = (result?.rows ?? []).map((row) => ({
          ...row,
          id: String(row.id),
        }));
        return { ...result, rows };
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'inventory-change-log',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [SnapshotDrawerComp, snapshotDrawerApi] = useVbenDrawer({
  connectedComponent: SnapshotDrawer,
});

const { exportBlob, exportLoading } = useBlobExport(inventoryChangeLogExport);

function handleViewSnapshot(row: InventoryChangeLogVo) {
  if (!row.changeNo) return;
  snapshotDrawerApi.setData({
    changeNo: row.changeNo,
  });
  snapshotDrawerApi.open();
}

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `库存变更台账_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: mapInventoryChangeLogQuery(formValues),
      fileName,
    });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}

defineExpose({ query: () => tableApi.query() });
</script>

<template>
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

    <template #changeCount="{ row }">
      <span class="font-semibold">{{ row.changeCount ?? 0 }}</span>
    </template>

    <template #changeType="{ row }">
      <Tag
        :color="
          getInventoryChangeTypeMeta(row.changeType, row.changeTypeText).color
        "
      >
        {{
          getInventoryChangeTypeMeta(row.changeType, row.changeTypeText).text
        }}
      </Tag>
    </template>

    <template #action="{ row }">
      <action-button @click.stop="handleViewSnapshot(row)">明细</action-button>
    </template>
  </BasicTable>

  <SnapshotDrawerComp />
</template>
