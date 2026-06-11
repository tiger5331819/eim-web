<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { cardImportList } from '#/api/system/cardImport';

import AllocationModal from './allocation-modal.vue';
import BatchImportModal from './batch-import-modal.vue';
import { columns, querySchema } from './data';
import SingleAddModal from './single-add-modal.vue';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 88, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [
    [
      'creationTime',
      ['startCreationTime', 'endCreationTime'],
      ['YYYY-MM-DDT00:00:00.000', 'YYYY-MM-DDT23:59:59.999'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  checkboxConfig: { highlight: true, reserve: true },
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
const [AllocationModalComp, allocationApi] = useVbenModal({
  connectedComponent: AllocationModal,
});
const [BatchImportModalComp, importApi] = useVbenModal({
  connectedComponent: BatchImportModal,
});
const [SingleAddModalComp, singleAddApi] = useVbenModal({
  connectedComponent: SingleAddModal,
});

function handleAllocation(row?: any) {
  allocationApi.setData({ productionBatch: row?.productionBatch });
  allocationApi.open();
}

function handleBatchAllocation() {
  const rows = tableApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    window.message.warning('请先勾选要分配的卡');
    return;
  }
  const firstBatch = rows[0].productionBatch;
  const allSameBatch = rows.every(
    (r: any) => r.productionBatch === firstBatch,
  );
  if (!allSameBatch) {
    window.message.warning('批量分配的卡必须属于同一生产批次');
    return;
  }
  allocationApi.setData({ productionBatch: firstBatch });
  allocationApi.open();
}

function handleBatchImport() {
  importApi.open();
}

function handleSingleAdd() {
  singleAddApi.open();
}

function handleDownloadTemplate() {
  window.open(
    `${import.meta.env.VITE_GLOB_API_URL}/manager/seed/importTemplate`,
  );
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="库存管理">
      <template #toolbar-tools>
        <Space>
          <a-button @click="handleDownloadTemplate">下载导入模板</a-button>
          <a-button type="primary" @click="handleBatchImport">
            批量导入
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            @click="handleBatchAllocation"
          >
            批量分配
          </a-button>
          <a-button type="primary" @click="handleAllocation()">
            按批次分配
          </a-button>
          <a-button type="primary" @click="handleSingleAdd">单卡添加</a-button>
        </Space>
      </template>

      <template #companyName="{ row }">
        <Tag v-if="row.companyName" color="blue">{{ row.companyName }}</Tag>
        <span v-else class="text-gray-400">未分配</span>
      </template>

      <template #action="{ row }">
        <Space>
          <a-button
            v-if="!row.companyName"
            type="link"
            size="small"
            @click.stop="handleAllocation(row)"
          >
            分配
          </a-button>
        </Space>
      </template>
    </BasicTable>
    <AllocationModalComp @reload="tableApi.query()" />
    <BatchImportModalComp @reload="tableApi.query()" />
    <SingleAddModalComp @reload="tableApi.query()" />
  </Page>
</template>
