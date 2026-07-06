<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { TenantLicenseVo } from '#/api/system/license/model';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Space, Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { licenseTenantExport, licenseTenantList } from '#/api/system/license';
import { useBlobExport } from '#/utils/file/export';
import {
  getAvailableQuotaClass,
  getTenantStatusMeta,
  getWarnLevelMeta,
  mapTenantQuery,
} from '#/utils/licenseStatus';

import AdjustModal from './adjust-modal.vue';
import { columns, querySchema } from './data';
import RecordDrawer from './record-drawer.vue';

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
  emptyText: '暂无租户License数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await licenseTenantList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapTenantQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'tenantId' },
  id: 'license-tenant-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const [AdjustModalComp, adjustModalApi] = useVbenModal({
  connectedComponent: AdjustModal,
});

const [RecordDrawerComp, recordDrawerApi] = useVbenDrawer({
  connectedComponent: RecordDrawer,
});

const { exportBlob, exportLoading } = useBlobExport(licenseTenantExport);

function handleAdjust(record: TenantLicenseVo) {
  adjustModalApi.setData({
    tenantId: record.tenantId,
    tenantName: record.tenantName,
    current: record.availableQuota ?? 0,
  });
  adjustModalApi.open();
}

function handleViewRecord(record: TenantLicenseVo) {
  recordDrawerApi.setData({
    tenantId: record.tenantId,
    tenantName: record.tenantName,
  });
  recordDrawerApi.open();
}

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `License管理_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({ data: mapTenantQuery(formValues), fileName });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}

function handleReload() {
  tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
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

      <template #tenantStatus="{ row }">
        <Tag :color="getTenantStatusMeta(row.tenantStatus).color">
          {{ getTenantStatusMeta(row.tenantStatus).text }}
        </Tag>
      </template>

      <template #availableQuota="{ row }">
        <span :class="getAvailableQuotaClass(row.availableQuota)">
          {{ row.availableQuota ?? '--' }}
        </span>
      </template>

      <template #warnLevel="{ row }">
        <Tag :color="getWarnLevelMeta(row.warnLevel).color">
          {{ getWarnLevelMeta(row.warnLevel).text }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <action-button @click.stop="handleAdjust(row)">
            额度调整
          </action-button>
          <action-button @click.stop="handleViewRecord(row)">
            查看流水
          </action-button>
        </Space>
      </template>
    </BasicTable>

    <AdjustModalComp @reload="handleReload" />
    <RecordDrawerComp />
  </Page>
</template>
