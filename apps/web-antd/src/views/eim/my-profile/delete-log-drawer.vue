<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  myProfileDeletedExport,
  myProfileDeletedList,
} from '#/api/system/my-profile';
import { useBlobExport } from '#/utils/file/export';

import { deletedColumns, deletedQuerySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: deletedQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  columns: deletedColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无删除记录',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await myProfileDeletedList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'my-profile-deleted-log',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

const { exportBlob, exportLoading, buildExportFileName } = useBlobExport(
  myProfileDeletedExport,
);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('删除记录');
  try {
    await exportBlob({ data: formValues, fileName });
    window.message.success('导出成功');
  } catch {
    window.message.error('导出失败');
  }
}

const [BasicDrawer] = useVbenDrawer({
  title: '删除记录',
  contentClass: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  onOpened() {
    void tableApi.reload();
  },
});
</script>

<template>
  <BasicDrawer class="w-[960px]">
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
      </BasicTable>
    </div>
  </BasicDrawer>
</template>
