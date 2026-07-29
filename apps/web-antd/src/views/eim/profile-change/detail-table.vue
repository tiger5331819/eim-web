<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { DownloadOutlined } from '@antdv-next/icons';
import { Alert, Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  profileChangeDetailExport,
  profileChangeDetailList,
} from '#/api/system/profile-change';
import { useBlobExport } from '#/utils/file/export';
import {
  getChangeTypeMeta,
  mapChangeDetailQuery,
} from '#/utils/profileChangeStatus';
import { getCodeStatusMeta } from '#/utils/profileLedgerStatus';

import { detailColumns, detailQuerySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: detailQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns: detailColumns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无变动明细数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await profileChangeDetailList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapChangeDetailQuery(formValues),
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
  id: 'profile-change-detail',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const { exportBlob, exportLoading } = useBlobExport(profileChangeDetailExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `码号变动明细_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: mapChangeDetailQuery(formValues),
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
  <div class="flex h-full min-h-0 flex-col gap-4">
    <Alert
      class="shrink-0"
      :closable="false"
      show-icon
      type="info"
      message="以下为全部变动操作对应的码号快照数据，展示的是变动发生时各码号的即时状态。"
    />

    <div class="min-h-0 flex-1 overflow-hidden">
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

        <template #changeType="{ row }">
          <Tag
            :color="
              getChangeTypeMeta(row.changeType, row.changeTypeText).color
            "
          >
            {{ getChangeTypeMeta(row.changeType, row.changeTypeText).text }}
          </Tag>
        </template>

        <template #codeStatus="{ row }">
          <Tag
            :color="getCodeStatusMeta(row.codeStatus, row.codeStatusText).color"
          >
            {{ getCodeStatusMeta(row.codeStatus, row.codeStatusText).text }}
          </Tag>
        </template>
      </BasicTable>
    </div>
  </div>
</template>
