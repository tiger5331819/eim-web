<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Space } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { cardImportList } from '#/api/system/cardImport';

import AllocationModal from './allocation-modal.vue';
import BatchImportModal from './batch-import-modal.vue';
import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 88,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [
    [
      'creationTime',
      ['startCreationTime', 'endCreationTime'],
      ['YYYY-MM-DDT00:00:00.000', 'YYYY-MM-DDT23:59:59.999'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await cardImportList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'eid' },
  id: 'system-cardImport-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [AllocationModalComp, allocationApi] = useVbenModal({ connectedComponent: AllocationModal });
const [BatchImportModalComp, importApi] = useVbenModal({ connectedComponent: BatchImportModal });

function handleAllocation() {
  allocationApi.open();
}

function handleBatchImport() {
  importApi.open();
}

function handleDownloadTemplate() {
  window.open(`${import.meta.env.VITE_GLOB_API_URL}/manager/seed/importTemplate`);
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="卡入库管理">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAllocation">卡数分配</a-button>
          <a-button type="primary" @click="handleBatchImport">批量导入</a-button>
          <a-button @click="handleDownloadTemplate">下载批量导入模板</a-button>
        </Space>
      </template>
    </BasicTable>
    <AllocationModalComp @reload="tableApi.query()" />
    <BatchImportModalComp @reload="tableApi.query()" />
  </Page>
</template>
