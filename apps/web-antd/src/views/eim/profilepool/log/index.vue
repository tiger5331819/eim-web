<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { allocationLogList } from '#/api/system/profile-pool';
import { getAllocationActionMeta, getPoolStatusMeta } from '#/utils/poolStatus';

import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 88, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await allocationLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-pool-log-index',
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="资源调配日志">
      <template #actionType="{ row }">
        <Tag :color="getAllocationActionMeta(row.actionType).color">
          {{ getAllocationActionMeta(row.actionType).text }}
        </Tag>
      </template>
      <template #statusChange="{ row }">
        <div class="flex items-center gap-1">
          <Tag :color="getPoolStatusMeta(row.beforeStatus).color">
            {{ getPoolStatusMeta(row.beforeStatus).text }}
          </Tag>
          <span class="text-gray-400">→</span>
          <Tag :color="getPoolStatusMeta(row.afterStatus).color">
            {{ getPoolStatusMeta(row.afterStatus).text }}
          </Tag>
        </div>
      </template>
    </BasicTable>
  </Page>
</template>
