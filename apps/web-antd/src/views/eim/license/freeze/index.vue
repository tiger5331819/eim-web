<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { licenseFreezeList } from '#/api/system/license';
import { useTenantStore } from '#/store/tenant';

import { columns, getFreezeStatusMeta, querySchema } from './data';

const { hasAccessByRoles } = useAccess();
const isAdmin = computed(() => hasAccessByRoles(['superadmin']));

// 确保租户列表已加载（直接访问本页时 store 可能未初始化）
const tenantStore = useTenantStore();
onMounted(async () => {
  if (isAdmin.value && tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
});

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: querySchema(isAdmin.value),
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
        return await licenseFreezeList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'license-freeze-index',
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="License 冻结记录">
      <template #status="{ row }">
        <Tag :color="getFreezeStatusMeta(row.status).color">
          {{ getFreezeStatusMeta(row.status).text }}
        </Tag>
      </template>
    </BasicTable>
  </Page>
</template>
