<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  tenantPoolDetailExport,
  tenantPoolDetailList,
} from '#/api/system/tenant-pool';
import { useBlobExport } from '#/utils/file/export';
import { getCodeStatusMeta, formatDownloadField } from '#/utils/profileLedgerStatus';
import { formatTenantPoolName } from '#/utils/tenantPoolStatus';

import {
  detailColumns,
  detailFieldMappingTime,
  detailQuerySchema,
} from './data';

const tenantId = ref('');
const tenantName = ref('');

const drawerTitle = computed(
  () => `${formatTenantPoolName(tenantName.value)} - 码号明细`,
);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: detailQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [...detailFieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns: detailColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无码号数据',
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
    // 由 onOpened 触发加载，避免与全局 autoLoad 重复请求
    autoLoad: false,
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await tenantPoolDetailList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          tenantId: tenantId.value,
          ...formValues,
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
  id: 'tenant-pool-detail-drawer',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const { exportBlob, exportLoading } = useBlobExport(tenantPoolDetailExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const name = formatTenantPoolName(tenantName.value);
  const fileName = `${name}_码号明细_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: {
        tenantId: tenantId.value,
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
    const data = drawerApi.getData() as {
      tenantId?: string;
      tenantName?: string;
    };
    tenantId.value = data?.tenantId != null ? String(data.tenantId) : '';
    tenantName.value = data?.tenantName ?? '';
  },
  onOpened() {
    void tableApi.reload();
  },
});
</script>

<template>
  <BasicDrawer class="w-[1100px]" :title="drawerTitle">
    <div class="flex h-full min-h-0 flex-col">
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

      <template #codeStatus="{ row }">
        <Tag
          :color="getCodeStatusMeta(row.codeStatus, row.codeStatusText).color"
        >
          {{ getCodeStatusMeta(row.codeStatus, row.codeStatusText).text }}
        </Tag>
      </template>

      <template #downloadedTime="{ row }">
        {{ formatDownloadField(row.codeStatus, row.downloadedTime) }}
      </template>
      </BasicTable>
    </div>
  </BasicDrawer>
</template>
