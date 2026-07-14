<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  inventoryImportDetail,
  inventoryImportLogList,
} from '#/api/system/inventory';
import { downloadByData } from '#/utils/file/download';
import {
  canDownloadImportDetail,
  mapImportLogQuery,
} from '#/utils/inventoryStatus';
import { getImportStatusMeta } from '#/utils/profileLedgerStatus';

import {
  importLogColumns,
  importLogFieldMappingTime,
  importLogQuerySchema,
} from './data';

const detailLoading = ref(false);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 90,
    componentProps: { allowClear: true },
  },
  schema: importLogQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [...importLogFieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns: importLogColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无导入记录',
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
        return await inventoryImportLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapImportLogQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'inventory-import-log-drawer',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

async function handleDownloadDetail(row: {
  id: number | string;
  importBatch?: string;
}) {
  detailLoading.value = true;
  try {
    const blob = await inventoryImportDetail(row.id);
    const batch = row.importBatch || row.id;
    downloadByData(
      blob,
      `入库明细_${batch}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`,
    );
  } catch (error) {
    console.error(error);
    window.message.error('下载失败');
  } finally {
    detailLoading.value = false;
  }
}

const [BasicDrawer] = useVbenDrawer({
  title: '入库记录',
  contentClass: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  onOpenChange(isOpen) {
    if (isOpen) {
      void nextTick(() => tableApi.reload());
    }
  },
});
</script>

<template>
  <BasicDrawer class="w-[960px]">
    <div class="flex h-full min-h-0 flex-col">
      <BasicTable>
        <template #importStatus="{ row }">
          <Tag :color="getImportStatusMeta(row.status, row.statusText).color">
            {{ getImportStatusMeta(row.status, row.statusText).text }}
          </Tag>
        </template>

        <template #action="{ row }">
          <action-button
            v-if="canDownloadImportDetail(row.status)"
            :disabled="detailLoading"
            @click.stop="handleDownloadDetail(row)"
          >
            下载明细
          </action-button>
          <span v-else class="text-foreground/45">--</span>
        </template>
      </BasicTable>
    </div>
  </BasicDrawer>
</template>
