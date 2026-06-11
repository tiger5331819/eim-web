<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { licenseRecordList } from '#/api/system/license';
import { useTenantStore } from '#/store/tenant';

import { columns, getChangeTypeMeta, querySchema } from './data';

// 确保租户列表已加载（直接访问本页时 store 可能未初始化）
const tenantStore = useTenantStore();
onMounted(async () => {
  if (tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
});

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
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await licenseRecordList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'license-record-index',
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="License 变更流水">
      <template #changeType="{ row }">
        <Tag :color="getChangeTypeMeta(row.changeType).color">
          {{ getChangeTypeMeta(row.changeType).text }}
        </Tag>
      </template>
      <template #changeQuota="{ row }">
        <span
          :class="
            row.changeQuota > 0
              ? 'text-emerald-600 font-semibold'
              : 'text-rose-600 font-semibold'
          "
        >
          {{ row.changeQuota > 0 ? '+' : '' }}{{ row.changeQuota }}
        </span>
      </template>
    </BasicTable>
  </Page>
</template>
