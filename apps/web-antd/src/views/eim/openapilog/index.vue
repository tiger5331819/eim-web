<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { openApiLogList } from '#/api/system/openapi-log';
import type { OpenApiLogVO } from '#/api/system/openapi-log/model';

import { columns, getMethodColor, querySchema } from './data';
import LogDetailDrawer from './log-detail-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 88, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [
    [
      'createTime',
      ['startCreateTime', 'endCreateTime'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await openApiLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'openapi-log-index',
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });

const [DetailDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: LogDetailDrawer,
});

function handleView(row: OpenApiLogVO) {
  drawerApi.setData(row);
  drawerApi.open();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="OpenAPI 调用日志">
      <template #method="{ row }">
        <Tag :color="getMethodColor(row.requestMethod)">
          {{ row.requestMethod }}
        </Tag>
      </template>
      <template #success="{ row }">
        <Tag :color="row.success ? 'green' : 'red'">
          {{ row.success ? '成功' : '失败' }}
        </Tag>
      </template>
      <template #action="{ row }">
        <a-button type="link" size="small" @click="handleView(row)">
          详情
        </a-button>
      </template>
    </BasicTable>
    <DetailDrawer />
  </Page>
</template>
