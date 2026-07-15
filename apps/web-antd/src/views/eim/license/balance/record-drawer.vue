<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { licenseRecordExport, licenseRecordList } from '#/api/system/license';
import { useBlobExport } from '#/utils/file/export';
import { getChangeTypeMeta, mapRecordQuery } from '#/utils/licenseStatus';

import { drawerRecordColumns, drawerRecordQuerySchema } from './data';

const tenantId = ref('');
const tenantName = ref('');

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: drawerRecordQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  columns: drawerRecordColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无流水记录',
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
        return await licenseRecordList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          tenantId: tenantId.value,
          ...mapRecordQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'license-tenant-record-drawer',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const { exportBlob, exportLoading } = useBlobExport(licenseRecordExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  try {
    await exportBlob({
      data: {
        tenantId: tenantId.value,
        ...mapRecordQuery(formValues),
      },
      fileName: `${tenantName.value || '租户'}_额度变动流水_${dayjs().format('YYYYMMDD')}.xlsx`,
    });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前无流水记录可导出');
  }
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  contentClass: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    const data = drawerApi.getData() as {
      tenantId?: string;
      tenantName?: string;
    };
    tenantId.value = data.tenantId ?? '';
    tenantName.value = data.tenantName ?? '';
  },
  onOpened() {
    void tableApi.reload();
  },
  onClosed: () => {
    tenantId.value = '';
    tenantName.value = '';
  },
});
</script>

<template>
  <BasicDrawer
    class="w-[960px]"
    :title="`${tenantName || ''} - 额度变动流水`"
  >
    <div class="flex h-full min-h-0 flex-col">
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
    </div>
  </BasicDrawer>
</template>
