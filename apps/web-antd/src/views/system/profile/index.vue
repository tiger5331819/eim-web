<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';
import { Space } from 'antdv-next';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { handleSync, profileList } from '#/api/system/profile';

import ApnModalComp from './apn-modal.vue';
import BatchImportModal from './batch-import-modal.vue';
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
  proxyConfig: { ajax: { query: async ({ page }, formValues = {}) => { return await profileList({ pageNum: page.currentPage, pageSize: page.pageSize, ...formValues }); } } },
  rowConfig: { keyField: 'iccid' },
  id: 'system-profile-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [BatchImportModalComp, importApi] = useVbenModal({ connectedComponent: BatchImportModal });
const [ApnModal, apnApi] = useVbenModal({ connectedComponent: ApnModalComp });

async function handleDataSync() { await handleSync(); await tableApi.query(); }
function handleBatchImport() { importApi.open(); }
function handleApnUpdate(row: any) { apnApi.setData({ row }); apnApi.open(); }
function handleDownloadTemplate() { window.open(`${import.meta.env.VITE_GLOB_API_URL}/manager/profile/import/template`); }
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="Profile来源管理">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleDataSync">同步数据</a-button>
          <a-button type="primary" @click="handleBatchImport">批量导入</a-button>
          <a-button @click="handleDownloadTemplate">下载批量导入模板</a-button>
          <a-button @click="$router.push('/profile-pool/total')">
            前往资源池管理 →
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <action-button @click.stop="handleApnUpdate(row)">更新</action-button>
        </Space>
      </template>
    </BasicTable>
    <BatchImportModalComp @reload="tableApi.query()" />
    <ApnModal @reload="tableApi.query()" />
  </Page>
</template>
