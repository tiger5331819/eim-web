<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { TenantPoolVo } from '#/api/system/tenant-pool/model';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { tenantPoolExport, tenantPoolList } from '#/api/system/tenant-pool';
import { useBlobExport } from '#/utils/file/export';
import { TENANT_POOL_COUNT_META } from '#/utils/tenantPoolStatus';

import { columns, querySchema } from './data';
import DetailDrawer from './detail-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无租户池数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await tenantPoolList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'tenantId' },
  id: 'tenant-pool-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const [DetailDrawerComp, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawer,
});

const { exportBlob, exportLoading } = useBlobExport(tenantPoolExport);

function formatCount(value?: number) {
  return value === undefined || value === null ? 0 : value;
}

function handleViewDetail(row: TenantPoolVo) {
  detailDrawerApi.setData({
    tenantId: row.tenantId,
    tenantName: row.tenantName,
  });
  detailDrawerApi.open();
}

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `租户池汇总_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({ data: formValues, fileName });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-tools>
        <a-button
          :disabled="exportLoading"
          :loading="exportLoading"
          v-access:code="['eim:tenantPool:export']"
          @click="handleExport"
        >
          <DownloadOutlined />
          导出
        </a-button>
      </template>

      <template #idle="{ row }">
        <Tag :color="TENANT_POOL_COUNT_META.idle.color">
          {{ formatCount(row.idle) }}
        </Tag>
      </template>

      <template #downloaded="{ row }">
        <Tag :color="TENANT_POOL_COUNT_META.downloaded.color">
          {{ formatCount(row.downloaded) }}
        </Tag>
      </template>

      <template #locked="{ row }">
        <Tag :color="TENANT_POOL_COUNT_META.locked.color">
          {{ formatCount(row.locked) }}
        </Tag>
      </template>

      <template #recyclable="{ row }">
        <Tag :color="TENANT_POOL_COUNT_META.recyclable.color">
          {{ formatCount(row.recyclable) }}
        </Tag>
      </template>

      <template #unrecyclable="{ row }">
        <Tag :color="TENANT_POOL_COUNT_META.unrecyclable.color">
          {{ formatCount(row.unrecyclable) }}
        </Tag>
      </template>

      <template #total="{ row }">
        <span class="font-semibold">{{ formatCount(row.total) }}</span>
      </template>

      <template #action="{ row }">
        <action-button
          v-access:code="['eim:tenantPool:detail']"
          @click.stop="handleViewDetail(row)"
        >
          查看明细
        </action-button>
      </template>
    </BasicTable>

    <DetailDrawerComp />
  </Page>
</template>
