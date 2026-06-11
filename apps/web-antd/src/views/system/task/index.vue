<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { commonExport } from '#/api/helper';
import { cancelTask, taskList } from '#/api/system/task';
import { useBlobExport } from '#/utils/file/export';

import { columns, getTaskSourceMeta, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [
    [
      'creationTime',
      ['startCreationTime', 'endCreationTime'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    checkMethod: ({ row }) => row.state === 0 || row.state === '0',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await taskList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'system-task-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

async function handleCancelTask() {
  const rows = tableApi.grid.getCheckboxRecords();
  if (!rows.length) {
    window.message.warning('请选择要取消的任务');
    return;
  }
  const ids = rows.map((row: any) => row.id);
  await cancelTask(ids);
  await tableApi.query();
}

// 导出
function taskExport(data: Record<string, any>) {
  return commonExport('/manager/device/task/export', data);
}
const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(taskExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('任务列表');
  exportBlob({ data: formValues, fileName });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="任务列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :loading="exportLoading"
            :disabled="exportLoading"
            @click="handleExport"
          >
            导出
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            type="primary"
            danger
            @click="handleCancelTask"
          >
            取消任务
          </a-button>
        </Space>
      </template>
      <template #source="{ row }">
        <Tag :color="getTaskSourceMeta(row.source).color">
          {{ getTaskSourceMeta(row.source).text }}
        </Tag>
      </template>
    </BasicTable>
  </Page>
</template>
