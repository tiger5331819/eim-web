<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { myLicenseFreezeExport, myLicenseFreezeList } from '#/api/system/my-license';
import { useBlobExport } from '#/utils/file/export';
import { getDownloadResultMeta } from '#/utils/myLicenseStatus';

import { freezeColumns, freezeQuerySchema, mapFreezeQuery } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 90,
    componentProps: { allowClear: true },
  },
  schema: freezeQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [
    [
      'operateTime',
      ['beginOperateTime', 'endOperateTime'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  columns: freezeColumns,
  height: 480,
  keepSource: true,
  emptyText: '暂无消耗记录',
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
        return await myLicenseFreezeList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapFreezeQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'my-license-freeze',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const { exportBlob, exportLoading } = useBlobExport(myLicenseFreezeExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `我的License_消耗记录_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({ data: mapFreezeQuery(formValues), fileName });
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

    <template #downloadResult="{ row }">
      <Tag :color="getDownloadResultMeta(row.downloadResult).color">
        {{ getDownloadResultMeta(row.downloadResult).text }}
      </Tag>
    </template>
  </BasicTable>
</template>
