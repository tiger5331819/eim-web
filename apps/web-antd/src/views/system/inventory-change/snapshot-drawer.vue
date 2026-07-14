<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Alert } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  inventoryChangeSnapshotExport,
  inventoryChangeSnapshotList,
} from '#/api/system/inventory-change';
import { useBlobExport } from '#/utils/file/export';

import { snapshotColumns, snapshotQuerySchema } from './data';

const changeNo = ref('');

const drawerTitle = computed(() => `${changeNo.value} - 明细`);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 90,
    componentProps: { allowClear: true },
  },
  schema: snapshotQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns: snapshotColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无变动明细数据',
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
        return await inventoryChangeSnapshotList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          changeNo: changeNo.value,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'inventory-change-snapshot-drawer',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const { exportBlob, exportLoading } = useBlobExport(
  inventoryChangeSnapshotExport,
);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `${changeNo.value}_变动明细_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: {
        changeNo: changeNo.value,
        ...formValues,
      },
      fileName,
    });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  contentClass: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData() as { changeNo?: string };
    changeNo.value = data?.changeNo ?? '';
  },
  onOpened() {
    void nextTick(async () => {
      await tableApi.formApi?.resetForm();
      await tableApi.reload();
    });
  },
  onClosed() {
    changeNo.value = '';
  },
});
</script>

<template>
  <BasicDrawer class="w-[1000px]" :title="drawerTitle">
    <div class="flex h-full min-h-0 flex-col gap-4">
      <Alert
        class="shrink-0"
        :closable="false"
        show-icon
        type="info"
        message="以下为本次变更操作对应的设备快照数据，展示的是变更发生时各设备的即时状态。"
      />

      <div class="flex min-h-0 flex-1 flex-col">
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
        </BasicTable>
      </div>
    </div>
  </BasicDrawer>
</template>
