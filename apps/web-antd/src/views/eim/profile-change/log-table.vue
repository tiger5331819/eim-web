<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ProfileChangeLogVo } from '#/api/system/profile-change/model';

import { useVbenDrawer } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  profileChangeLogExport,
  profileChangeLogList,
} from '#/api/system/profile-change';
import { useBlobExport } from '#/utils/file/export';
import { getChangeTypeMeta, mapChangeLogQuery } from '#/utils/profileChangeStatus';

import { logColumns, logFieldMappingTime, logQuerySchema } from './data';
import SnapshotDrawer from './snapshot-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: logQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [...logFieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns: logColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无变动记录',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await profileChangeLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapChangeLogQuery(formValues),
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
  id: 'profile-change-log',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [SnapshotDrawerComp, snapshotDrawerApi] = useVbenDrawer({
  connectedComponent: SnapshotDrawer,
});

const { exportBlob, exportLoading } = useBlobExport(profileChangeLogExport);

function handleViewSnapshot(row: ProfileChangeLogVo) {
  if (!row.changeNo) return;
  snapshotDrawerApi.setData({
    changeNo: row.changeNo,
  });
  snapshotDrawerApi.open();
}

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `码号变动台账_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: mapChangeLogQuery(formValues),
      fileName,
    });
    window.message.success('导出成功');
  } catch {
    window.message.error('当前筛选条件下无数据可导出');
  }
}

defineExpose({ query: () => tableApi.query() });
</script>

<template>
  <BasicTable>
    <template #toolbar-tools>
      <a-button
        :disabled="exportLoading"
        :loading="exportLoading"
        v-access:code="['eim:profileChange:export']"
        @click="handleExport"
      >
        <DownloadOutlined />
        导出
      </a-button>
    </template>

    <template #changeCount="{ row }">
      <span class="font-semibold">{{ row.changeCount ?? 0 }}</span>
    </template>

    <template #changeType="{ row }">
      <Tag
        :color="getChangeTypeMeta(row.changeType, row.changeTypeText).color"
      >
        {{ getChangeTypeMeta(row.changeType, row.changeTypeText).text }}
      </Tag>
    </template>

    <template #action="{ row }">
      <action-button
        v-access:code="['eim:profileChange:detail']"
        @click.stop="handleViewSnapshot(row)"
      >
        变动明细
      </action-button>
    </template>
  </BasicTable>

  <SnapshotDrawerComp />
</template>
