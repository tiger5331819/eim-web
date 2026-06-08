<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DeviceVO } from '#/api/system/device/model';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Space } from 'antdv-next';
import { useRouter } from 'vue-router';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deviceList } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

import BatchImportModal from './batch-import-modal.vue';
import ChangeEimModal from './change-eim-modal.vue';
import { columns, querySchema } from './data';

const router = useRouter();
const deviceStore = useDeviceStore();
const showSelect = ref(false);
const selectType = ref('');
const selectArray = ref<DeviceVO[]>([]);

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 88, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    checkMethod: ({ row }) => {
      if (selectType.value !== 'download') return true;
      if (!selectArray.value.length) return true;
      const first = selectArray.value[0];
      return row.companyName === first.companyName && row.projectName === first.projectName;
    },
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: { ajax: { query: async ({ page }, formValues = {}) => await deviceList({ pageNum: page.currentPage, pageSize: page.pageSize, ...formValues }) } },
  rowConfig: { keyField: 'id' },
  id: 'system-device-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [BatchImportModalComp, importApi] = useVbenModal({ connectedComponent: BatchImportModal });
const [ChangeEimModalComp, eimApi] = useVbenModal({ connectedComponent: ChangeEimModal });

function handleSelect(type: string) { showSelect.value = true; selectType.value = type; }

async function handleConfirmSelect() {
  const rows = selectArray.value;
  if (selectType.value === 'download') {
    deviceStore.setDownloadList(rows);
    router.push({ path: '/system/device/download' });
  } else if (selectType.value === 'eim') {
    const eids = rows.map((row: DeviceVO) => row.eid);
    eimApi.setData({ eidList: eids });
    eimApi.open();
  }
}

function cancelSelect() { showSelect.value = false; selectType.value = ''; selectArray.value = []; tableApi.grid.clearCheckboxRow(); }
function handleView(row: DeviceVO) { deviceStore.setCurrentEid(row.eid); router.push({ path: '/system/device/detail', query: { id: row.eid } }); }
function handleDownloadTemplate() { window.open(`${import.meta.env.VITE_GLOB_API_URL}/manager/device/batch/profileDownload/importTemplate`); }
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="设备列表">
      <template #toolbar-tools>
        <Space v-if="!showSelect">
          <a-button type="primary" @click="handleSelect('eim')">替换EIM</a-button>
          <a-button type="primary" @click="handleSelect('download')">批量下载资源</a-button>
          <a-button type="primary" @click="importApi.open()">导入分配资源</a-button>
          <a-button @click="handleDownloadTemplate">下载批量导入模板</a-button>
        </Space>
        <Space v-else>
          <a-button type="primary" :disabled="!selectArray.length" @click="handleConfirmSelect">确认</a-button>
          <a-button @click="cancelSelect">取消</a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <action-button @click.stop="handleView(row)">详细</action-button>
        </Space>
      </template>
    </BasicTable>
    <BatchImportModalComp @reload="tableApi.query()" />
    <ChangeEimModalComp @reload="tableApi.query()" />
  </Page>
</template>
