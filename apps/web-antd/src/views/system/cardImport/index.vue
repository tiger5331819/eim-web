<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EuiccInventoryVo } from '#/api/system/inventory/model';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  DownloadOutlined,
  HistoryOutlined,
  UploadOutlined,
} from '@antdv-next/icons';
import { Space, Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  inventoryDelete,
  inventoryExport,
  inventoryList,
  inventoryRecycleOne,
} from '#/api/system/inventory';
import { useBlobExport } from '#/utils/file/export';
import {
  canAssign,
  canRecycle,
  getAssignedMeta,
  mapInventoryQuery,
} from '#/utils/inventoryStatus';
import { confirmActionModal, confirmDeleteActionModal } from '#/utils/modal';

import AddModal from './add-modal.vue';
import AssignImportModal from './assign-import-modal.vue';
import AssignModal from './assign-modal.vue';
import {
  columns as baseColumns,
  inventoryFieldMappingTime,
  querySchema,
} from './data';
import DeleteImportModal from './delete-import-modal.vue';
import ImportLogDrawer from './import-log-drawer.vue';
import ImportModal from './import-modal.vue';
import RecycleBatchModal from './recycle-batch-modal.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 88,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [...inventoryFieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns: baseColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无库存数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await inventoryList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapInventoryQuery(formValues),
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
  id: 'system-inventory-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

function handleReload() {
  tableApi.query();
}

const [AddModalComp, addModalApi] = useVbenModal({
  connectedComponent: AddModal,
});
const [ImportModalComp, importModalApi] = useVbenModal({
  connectedComponent: ImportModal,
});
const [ImportLogDrawerComp, importLogDrawerApi] = useVbenDrawer({
  connectedComponent: ImportLogDrawer,
});
const [AssignModalComp, assignModalApi] = useVbenModal({
  connectedComponent: AssignModal,
});
const [AssignImportModalComp, assignImportModalApi] = useVbenModal({
  connectedComponent: AssignImportModal,
});
const [DeleteImportModalComp, deleteImportModalApi] = useVbenModal({
  connectedComponent: DeleteImportModal,
});
const [RecycleBatchModalComp, recycleBatchModalApi] = useVbenModal({
  connectedComponent: RecycleBatchModal,
});

const { exportBlob, exportLoading } = useBlobExport(inventoryExport);

function handleAdd() {
  addModalApi.open();
}

function handleImport() {
  importModalApi.open();
}

function handleImportLog() {
  importLogDrawerApi.open();
}

function handleBatchAssign() {
  assignImportModalApi.open();
}

function handleBatchRecycle() {
  recycleBatchModalApi.open();
}

function handleBatchDelete() {
  deleteImportModalApi.open();
}

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `库存台账_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: mapInventoryQuery(formValues),
      fileName,
    });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}

function handleRowAssign(row: EuiccInventoryVo) {
  assignModalApi.setData({ inventoryId: String(row.id) });
  assignModalApi.open();
}

function handleRowDeleteClick(row: EuiccInventoryVo) {
  confirmDeleteActionModal({
    content: '确认删除该库存记录？删除后不可恢复。',
    onOk: () => handleRowDelete(row),
  });
}

async function handleRowDelete(row: EuiccInventoryVo) {
  await inventoryDelete(String(row.id!));
  window.message.success('删除成功');
  handleReload();
}

function handleRowRecycleClick(row: EuiccInventoryVo) {
  confirmActionModal({
    title: '回收确认',
    content: '确认回收该设备吗？回收后将清除租户归属，可重新分配。',
    onOk: () => handleRowRecycle(row),
  });
}

async function handleRowRecycle(row: EuiccInventoryVo) {
  await inventoryRecycleOne(String(row.id!));
  window.message.success('回收成功');
  handleReload();
}

</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <Space>
          <a-button type="primary" @click="handleAdd">新增</a-button>
          <a-button @click="handleImport">
            <UploadOutlined />
            批量导入
          </a-button>
          <a-button @click="handleImportLog">
            <HistoryOutlined />
            入库记录
          </a-button>
          <a-button @click="handleBatchAssign">批量分配</a-button>
          <a-button @click="handleBatchRecycle">批量回收</a-button>
          <a-button @click="handleBatchDelete">批量删除</a-button>
        </Space>
      </template>

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

      <template #assigned="{ row }">
        <Tag :color="getAssignedMeta(row.assigned, row.assignedText).color">
          {{ getAssignedMeta(row.assigned, row.assignedText).text }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space v-if="canAssign(row)">
          <action-button danger @click.stop="handleRowDeleteClick(row)">
            删除
          </action-button>
          <action-button @click.stop="handleRowAssign(row)">分配</action-button>
        </Space>
        <action-button
          v-else-if="canRecycle(row)"
          @click.stop="handleRowRecycleClick(row)"
        >
          回收
        </action-button>
      </template>
    </BasicTable>

    <AddModalComp @reload="handleReload" />
    <ImportModalComp @reload="handleReload" />
    <ImportLogDrawerComp />
    <AssignModalComp @reload="handleReload" />
    <AssignImportModalComp @reload="handleReload" />
    <DeleteImportModalComp @reload="handleReload" />
    <RecycleBatchModalComp @reload="handleReload" />
  </Page>
</template>
