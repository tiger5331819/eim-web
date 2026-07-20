<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, nextTick, ref } from 'vue';

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
  createDetailQuerySchema,
  detailColumns,
  detailFieldMappingTime,
} from './data';

const baseInfo = ref<{ tenantId?: string; tenantName?: string }>({});

const drawerTitle = computed(
  () => `${formatTenantPoolName(baseInfo.value.tenantName)} - 码号明细`,
);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: createDetailQuerySchema(() => baseInfo.value.tenantId),
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
    autoLoad: false,
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await tenantPoolDetailList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          tenantId: baseInfo.value.tenantId,
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
  const name = formatTenantPoolName(baseInfo.value.tenantName);
  const fileName = `${name}_码号明细_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: {
        tenantId: baseInfo.value.tenantId,
        ...formValues,
      },
      fileName,
    });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}

async function handleClosed() {
  await tableApi.formApi.resetForm();
  baseInfo.value = {};
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  contentClass: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  onClosed: handleClosed,
  async onOpenChange(isOpen) {
    if (!isOpen) return null;
    drawerApi.drawerLoading(true);
    const row = drawerApi.getData() as {
      tenantId?: string;
      tenantName?: string;
    };
    if (row?.tenantId != null) {
      baseInfo.value = {
        tenantId: String(row.tenantId),
        tenantName: row.tenantName ?? '',
      };
    } else if (row) {
      baseInfo.value = { tenantName: row.tenantName ?? '' };
    }
    drawerApi.drawerLoading(false);
    await nextTick();
    await tableApi.reload();
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
