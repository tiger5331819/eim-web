<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { DownloadOutlined } from '@antdv-next/icons';
import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  inventoryChangeDetailExport,
  inventoryChangeDetailList,
} from '#/api/system/inventory-change';
import { useBlobExport } from '#/utils/file/export';
import {
  getInventoryChangeTypeMeta,
  mapInventoryChangeDetailQuery,
} from '#/utils/inventoryChangeStatus';

import {
  detailColumns,
  detailFieldMappingTime,
  detailQuerySchema,
} from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: detailQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [...detailFieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns: detailColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无变动明细数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await inventoryChangeDetailList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapInventoryChangeDetailQuery(formValues),
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
  id: 'inventory-change-detail',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const { exportBlob, exportLoading } = useBlobExport(
  inventoryChangeDetailExport,
);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `库存变动明细_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: mapInventoryChangeDetailQuery(formValues),
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
        v-access:code="['eim:inventoryChange:export']"
        @click="handleExport"
      >
        <DownloadOutlined />
        导出
      </a-button>
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
  </BasicTable>
</template>
