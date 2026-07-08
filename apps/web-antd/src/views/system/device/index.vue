<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DeviceLedgerVo } from '#/api/system/device/model';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { DownloadOutlined } from '@antdv-next/icons';
import { Space, Tag } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deviceExport, deviceList } from '#/api/system/device';
import { useBlobExport } from '#/utils/file/export';
import {
  getOnlineStatusMeta,
  mapDeviceLedgerQuery,
} from '#/utils/deviceLedgerStatus';

import { columns, ledgerFieldMappingTime, querySchema } from './data';
import DetailDrawer from './detail-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 88,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [...ledgerFieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无设备数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await deviceList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...mapDeviceLedgerQuery(formValues),
        });
      },
    },
  },
  rowConfig: { keyField: 'eid' },
  id: 'system-device-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const [DetailDrawerComp, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawer,
});

const { exportBlob, exportLoading } = useBlobExport(deviceExport);

function handleReload() {
  tableApi.query();
}

function handleDetail(row: DeviceLedgerVo) {
  detailDrawerApi.setData({ eid: row.eid });
  detailDrawerApi.open();
}

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = `设备台账_${dayjs().format('YYYYMMDD')}.xlsx`;
  try {
    await exportBlob({
      data: mapDeviceLedgerQuery(formValues),
      fileName,
    });
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
          @click="handleExport"
        >
          <DownloadOutlined />
          导出
        </a-button>
      </template>

      <template #onlineStatus="{ row }">
        <Tag :color="getOnlineStatusMeta(row).color">
          {{ getOnlineStatusMeta(row).text }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <action-button @click.stop="handleDetail(row)">详情</action-button>
        </Space>
      </template>
    </BasicTable>

    <DetailDrawerComp @reload="handleReload" />
  </Page>
</template>
