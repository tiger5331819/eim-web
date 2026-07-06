<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { myLicenseRecordExport, myLicenseRecordList } from '#/api/system/my-license';
import { useBlobExport } from '#/utils/file/export';
import { getChangeTypeMeta } from '#/utils/myLicenseStatus';

import { mapRecordQuery, recordColumns, recordQuerySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: recordQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [
    [
      'changeTime',
      ['beginChangeTime', 'endChangeTime'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  columns: recordColumns,
  height: 480,
  keepSource: true,
  emptyText: '暂无变动记录',
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
        return await myLicenseRecordList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapRecordQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'my-license-record',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const { exportBlob, exportLoading } = useBlobExport(myLicenseRecordExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `我的License_变动记录_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({ data: mapRecordQuery(formValues), fileName });
    window.message.success('导出成功');
  } catch {
    window.message.error('导出失败');
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
        导出
      </a-button>
    </template>

    <template #changeQuota="{ row }">
      <span
        :class="
          (row.changeQuota ?? 0) > 0
            ? 'font-semibold text-emerald-600'
            : 'font-semibold text-rose-600'
        "
      >
        {{ (row.changeQuota ?? 0) > 0 ? '+' : '' }}{{ row.changeQuota ?? '--' }}
      </span>
    </template>

    <template #changeType="{ row }">
      <Tag
        :color="
          getChangeTypeMeta(row.changeType, row.changeTypeText).color
        "
      >
        {{ getChangeTypeMeta(row.changeType, row.changeTypeText).text }}
      </Tag>
    </template>
  </BasicTable>
</template>
