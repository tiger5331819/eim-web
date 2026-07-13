<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ApiLogVO } from '#/api/system/api-log/model';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { apiLogExport, apiLogList } from '#/api/system/api-log';
import { useBlobExport } from '#/utils/file/export';

import {
  fieldMappingTime,
  getMethodColor,
  platformColumns,
  platformQuerySchema,
} from './data';
import LogDetailDrawer from './log-detail-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 96,
    componentProps: { allowClear: true },
  },
  schema: platformQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  showCollapseButton: true,
  collapsedRows: 1,
  fieldMappingTime: [...fieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns: platformColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无接口日志记录',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await apiLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'eim-api-log-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

const [DetailDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: LogDetailDrawer,
});

const { exportBlob, exportLoading } = useBlobExport(apiLogExport);

function handleView(row: ApiLogVO) {
  drawerApi.setData({ id: row.id, row });
  drawerApi.open();
}

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `接口日志_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({ data: formValues, fileName });
  } catch {
    window.message.error('导出失败，请稍后重试');
  }
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="接口日志">
      <template #toolbar-tools>
        <a-button
          v-access:code="['eim:api:log:export']"
          :disabled="exportLoading"
          :loading="exportLoading"
          @click="handleExport"
        >
          <DownloadOutlined />
          导出
        </a-button>
      </template>
      <template #method="{ row }">
        <Tag :color="getMethodColor(row.requestMethod)">
          {{ row.requestMethod }}
        </Tag>
      </template>
      <template #success="{ row }">
        <Tag :color="row.success ? 'green' : 'red'">
          {{ row.success ? '成功' : '失败' }}
        </Tag>
      </template>
      <template #action="{ row }">
        <a-button type="link" size="small" @click="handleView(row)">
          详情
        </a-button>
      </template>
    </BasicTable>
    <DetailDrawer />
  </Page>
</template>
