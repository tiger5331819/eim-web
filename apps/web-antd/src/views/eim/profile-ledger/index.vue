<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ProfileLedgerVo } from '#/api/system/profile-ledger/model';

import { computed, nextTick, ref, watch } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { DownloadOutlined, DownOutlined, HistoryOutlined, UploadOutlined } from '@antdv-next/icons';
import { Dropdown, Popconfirm, Space, Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  profileLedgerDelete,
  profileLedgerExport,
  profileLedgerList,
  profileLedgerPoolOutOne,
  profileLedgerPoolRecycleOne,
} from '#/api/system/profile-ledger';
import { useBlobExport } from '#/utils/file/export';
import {
  canDelete,
  canPoolIn,
  canPoolOut,
  canRecycle,
  formatTenantName,
  getCodeStatusMeta,
  getPoolEntryStatusMeta,
  mapLedgerQuery,
} from '#/utils/profileLedgerStatus';

import AddModal from './add-modal.vue';
import {
  columns as baseColumns,
  ledgerFieldMappingTime,
  querySchema,
} from './data';
import ImportLogDrawer from './import-log-drawer.vue';
import ImportModal from './import-modal.vue';
import PoolInModal from './pool-in-modal.vue';
import PoolOutModal from './pool-out-modal.vue';
import RecycleModal from './recycle-modal.vue';

const selectMode = ref(false);
const selectedCount = ref(0);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [...ledgerFieldMappingTime],
};

const gridOptions = computed<VxeGridProps>(() => {
  const dataColumns = (baseColumns ?? []).filter((col) => col.type !== 'checkbox');
  return {
    columns: selectMode.value
      ? [{ type: 'checkbox', width: 60 }, ...dataColumns]
      : dataColumns,
    checkboxConfig: selectMode.value
      ? {
          checkMethod: ({ row }: { row: ProfileLedgerVo }) => canRecycle(row),
          highlight: true,
          reserve: true,
          strict: true,
        }
      : undefined,
  gridEvents: {
    checkboxChange: updateSelectedCount,
    checkboxAll: updateSelectedCount,
  },
  height: 'auto',
  emptyText: '暂无总池数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await profileLedgerList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapLedgerQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-ledger-index',
  };
});

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions: gridOptions.value,
  separator: false,
});

watch(selectMode, async () => {
  await tableApi.setGridOptions(gridOptions.value);
  await nextTick();
  tableApi.grid?.clearCheckboxRow?.();
  updateSelectedCount();
});

function updateSelectedCount() {
  selectedCount.value = tableApi.grid?.getCheckboxRecords?.()?.length ?? 0;
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
const [PoolInModalComp, poolInModalApi] = useVbenModal({
  connectedComponent: PoolInModal,
});
const [PoolOutModalComp, poolOutModalApi] = useVbenModal({
  connectedComponent: PoolOutModal,
});
const [RecycleModalComp, recycleModalApi] = useVbenModal({
  connectedComponent: RecycleModal,
});

const { exportBlob, exportLoading } = useBlobExport(profileLedgerExport);

const recycleMenuItems = [
  { key: 'selected', label: '按选中码号' },
  { key: 'batch', label: '按数量自动' },
];

async function handleReload() {
  await tableApi.reload();

  if (selectMode.value) {
    tableApi.grid?.clearCheckboxRow?.();
    updateSelectedCount();
  }
}

function handleAdd() {
  addModalApi.open();
}

function handleImport() {
  importModalApi.open();
}

function handleImportLog() {
  importLogDrawerApi.open();
}

function handleBatchPoolIn() {
  poolInModalApi.setData({ mode: 'batch' });
  poolInModalApi.open();
}

function handleBatchPoolOut() {
  poolOutModalApi.open();
}

function handleRecycleMenu(info: { key: string }) {
  if (info.key === 'selected') {
    selectMode.value = true;
    return;
  }
  recycleModalApi.setData({ mode: 'batch' });
  recycleModalApi.open();
}

function handleCancelSelect() {
  selectMode.value = false;
  tableApi.grid?.clearCheckboxRow?.();
  updateSelectedCount();
}

function handleConfirmSelect() {
  const rows = tableApi.grid?.getCheckboxRecords?.() ?? [];
  const recyclableRows = rows.filter((row: ProfileLedgerVo) => canRecycle(row));
  if (recyclableRows.length === 0) {
    window.message.warning('请先勾选可回收的码号');
    return;
  }
  recycleModalApi.setData({
    mode: 'selected',
    profileIds: recyclableRows.map((row: ProfileLedgerVo) => row.id),
  });
  recycleModalApi.open();
}

function handleRecycleModalReload() {
  selectMode.value = false;
  handleReload();
}

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `码号台账_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({ data: mapLedgerQuery(formValues), fileName });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}

function handleRowPoolIn(row: ProfileLedgerVo) {
  poolInModalApi.setData({ mode: 'row', profileId: row.id });
  poolInModalApi.open();
}

async function handleRowPoolOut(row: ProfileLedgerVo) {
  await profileLedgerPoolOutOne(row.id);
  window.message.success('出池成功');
  handleReload();
}

async function handleRowRecycle(row: ProfileLedgerVo) {
  await profileLedgerPoolRecycleOne(row.id);
  window.message.success('回收成功');
  handleReload();
}

async function handleRowDelete(row: ProfileLedgerVo) {
  await profileLedgerDelete(row.id);
  window.message.success('删除成功');
  handleReload();
}
</script>

<template>
  <Page :auto-content-height="true">
    <div
      v-if="selectMode"
      class="mb-3 flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-4 py-2.5"
    >
      <span class="text-sm">
        已选中 <span class="font-medium text-primary">{{ selectedCount }}</span> 条码号
      </span>
      <Space>
        <a-button type="primary" @click="handleConfirmSelect">确定</a-button>
        <a-button @click="handleCancelSelect">取消选择</a-button>
      </Space>
    </div>

    <BasicTable>
      <template #toolbar-actions>
        <Space v-if="!selectMode">
          <a-button type="primary" @click="handleAdd">新增</a-button>
          <a-button @click="handleImport">
            <UploadOutlined />
            批量导入
          </a-button>
          <a-button @click="handleImportLog">
            <HistoryOutlined />
            导入记录
          </a-button>
          <a-button @click="handleBatchPoolIn">批量入池</a-button>
          <a-button @click="handleBatchPoolOut">批量出池</a-button>
          <Dropdown
            :menu="{
              items: recycleMenuItems,
              onClick: handleRecycleMenu,
            }"
          >
            <a-button>
              批量回收
              <DownOutlined />
            </a-button>
          </Dropdown>
        </Space>
        <span v-else class="text-sm text-foreground/65">
          请勾选码号状态为「可回收」的行，完成后点击「确定」
        </span>
      </template>

      <template #toolbar-tools>
        <a-button
          v-if="!selectMode"
          :disabled="exportLoading"
          :loading="exportLoading"
          @click="handleExport"
        >
          <DownloadOutlined />
          导出
        </a-button>
      </template>

      <template #tenantName="{ row }">
        {{ formatTenantName(row.poolStatus, row.tenantName) }}
      </template>

      <template #codeStatus="{ row }">
        <Tag
          :color="getCodeStatusMeta(row.codeStatus, row.codeStatusText).color"
        >
          {{ getCodeStatusMeta(row.codeStatus, row.codeStatusText).text }}
        </Tag>
      </template>

      <template #poolStatus="{ row }">
        <Tag
          :color="
            getPoolEntryStatusMeta(row.poolStatus, row.poolStatusText).color
          "
        >
          {{ getPoolEntryStatusMeta(row.poolStatus, row.poolStatusText).text }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <action-button
            v-if="canPoolIn(row)"
            @click.stop="handleRowPoolIn(row)"
          >
            入池
          </action-button>
          <Popconfirm
            v-if="canPoolOut(row)"
            placement="left"
            title="确认将该码号出池吗？"
            :description="`码号：${row.accode} / ${row.iccid}，出池后将退回总池、清除租户归属，可再次入池。`"
            @confirm="handleRowPoolOut(row)"
          >
            <action-button @click.stop="">出池</action-button>
          </Popconfirm>
          <Popconfirm
            v-if="canRecycle(row)"
            placement="left"
            title="确认回收该码号吗？"
            :description="`码号：${row.accode} / ${row.iccid}，回收后将退回总池并转为空闲，可再次入池。`"
            @confirm="handleRowRecycle(row)"
          >
            <action-button @click.stop="">回收</action-button>
          </Popconfirm>
          <Popconfirm
            v-if="canDelete(row)"
            placement="left"
            title="确认删除该码号吗？"
            description="删除后不可恢复。"
            @confirm="handleRowDelete(row)"
          >
            <action-button danger @click.stop="">删除</action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>

    <AddModalComp @reload="handleReload" />
    <ImportModalComp @reload="handleReload" />
    <ImportLogDrawerComp />
    <PoolInModalComp @reload="handleReload" />
    <PoolOutModalComp @reload="handleReload" />
    <RecycleModalComp @reload="handleRecycleModalReload" />
  </Page>
</template>
