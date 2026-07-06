<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { licenseRecordExport, licenseRecordList } from '#/api/system/license';
import { useBlobExport } from '#/utils/file/export';
import { getChangeTypeMeta, mapRecordQuery } from '#/utils/licenseStatus';

import { columns, querySchema } from './data';

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
  emptyText: '暂无流水记录',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await licenseRecordList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapRecordQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'license-record-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const { exportBlob, exportLoading } = useBlobExport(licenseRecordExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `License流水_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({ data: mapRecordQuery(formValues), fileName });
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
          :color="getChangeTypeMeta(row.changeType, row.changeTypeText).color"
        >
          {{ getChangeTypeMeta(row.changeType, row.changeTypeText).text }}
        </Tag>
      </template>
    </BasicTable>
  </Page>
</template>
