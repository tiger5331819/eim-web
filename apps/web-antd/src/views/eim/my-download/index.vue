<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  downloadTaskExport,
  downloadTaskList,
} from '#/api/system/task';
import { useBlobExport } from '#/utils/file/export';
import {
  formatDownloadProgress,
  getDownloadTaskStateMeta,
  mapDownloadTaskQuery,
} from '#/utils/downloadTaskStatus';

import { columns, fieldMappingTime, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [...fieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无下载任务数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await downloadTaskList({
          isAsc: 'desc',
          orderByColumn: 'creationTime',
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapDownloadTaskQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'system-download-task-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

const { exportBlob, exportLoading } = useBlobExport(downloadTaskExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `下载台账_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: mapDownloadTaskQuery(formValues),
      fileName,
    });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}
</script>

<template>
  <Page :auto-content-height="true">
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

      <template #progress="{ row }">
        {{ formatDownloadProgress(row.state, row.downloadRate) }}
      </template>

      <template #state="{ row }">
        <Tag :color="getDownloadTaskStateMeta(row.state, row.stateText).color">
          {{ getDownloadTaskStateMeta(row.state, row.stateText).text }}
        </Tag>
      </template>
    </BasicTable>
  </Page>
</template>
