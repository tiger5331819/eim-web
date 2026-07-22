<script setup lang="ts">
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { message, Table, Pagination, Upload, Alert } from 'antdv-next';
import { useAccessStore } from '@vben/stores';

import { beforeAutoImportUpload } from '#/utils/file/uploadLimit';

const emit = defineEmits<{ reload: [] }>();
const fileList = ref<any[]>([]);
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const uploadSuccess = ref(false);
const errorToken = ref('');

const tableColumns = [
  { title: 'ICCID', dataIndex: 'iccid' },
  { title: '运营商', dataIndex: 'carrierName' },
  { title: '批次', dataIndex: 'productionBatch' },
  { title: 'DP+来源', dataIndex: 'dpSource' },
  { title: '数据校验', dataIndex: 'result' },
];

function sliceData() { const start = (currentPage.value - 1) * pageSize.value; const end = start + pageSize.value; paginatedData.value = tableData.value.slice(start, end); }
function handleUploadChange(info: any) { const res = info.file?.response; if (res) { if (res.code === 200) { uploadSuccess.value = true; errorToken.value = res.data?.errorToken || ''; tableData.value = res.data?.importResultList || []; totalItems.value = tableData.value.length; sliceData(); message.success('导入完成'); } else { message.error('文件上传失败'); } } }
function handlePageChange(page: number) { currentPage.value = page; sliceData(); }
function handleSizeChange(current: number, size: number) { pageSize.value = size; currentPage.value = 1; sliceData(); }
function init() { tableData.value = []; paginatedData.value = []; totalItems.value = 0; fileList.value = []; uploadSuccess.value = false; errorToken.value = ''; }

const uploadUrl = `${import.meta.env.VITE_GLOB_API_URL}/manager/profile/import`;
const uploadHeaders = { Authorization: `Bearer ${useAccessStore().accessToken}` };

function handleDownloadFail() {
  if (errorToken.value) {
    window.open(`${import.meta.env.VITE_GLOB_API_URL}/manager/profile/importError/${errorToken.value}`);
  }
}

const [BasicModal, modalApi] = useVbenModal({ fullscreenButton: false, width: 1200, onConfirm: () => { if (uploadSuccess.value) emit('reload'); init(); modalApi.close(); }, onOpenChange: async (isOpen) => { if (!isOpen) init(); } });
</script>

<template>
  <BasicModal title="批量导入">
    <Upload
      v-model:file-list="fileList"
      accept=".xlsx"
      :max-count="1"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :before-upload="beforeAutoImportUpload"
      @change="handleUploadChange"
    >
      <a-button>上传文件</a-button>
    </Upload>
    <Alert
      class="mt-4"
      type="info"
      show-icon
      message="温馨提示：请按照模板格式输入信息，数据量不要超过10000条；只支持xlsx格式文件；文件大小不超过50MB"
    />
    <div v-if="paginatedData.length > 0" class="mt-4">
      <p>导入失败记录</p>
      <Table :columns="tableColumns" :data-source="paginatedData" :pagination="false" row-key="iccid" />
      <Pagination class="mt-4" :current="currentPage" :page-size="pageSize" :total="totalItems" :page-size-options="['10', '20', '30', '50']" show-quick-jumper show-size-changer @change="handlePageChange" @showSizeChange="handleSizeChange" />
      <a-button v-if="errorToken" class="mt-4" type="primary" @click="handleDownloadFail">导出失败记录</a-button>
    </div>
  </BasicModal>
</template>
