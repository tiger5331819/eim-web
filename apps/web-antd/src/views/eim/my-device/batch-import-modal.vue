<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Table, Pagination, Upload, Alert, RadioGroup, RadioButton } from 'antdv-next';

import { useAccessStore } from '@vben/stores';

const emit = defineEmits<{ reload: [] }>();

const fileList = ref<any[]>([]);
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const uploadSuccess = ref(false);
const enable = ref(false);
const errorToken = ref('');

const tableColumns = [
  { title: 'EID', dataIndex: 'eid' },
  { title: '批次', dataIndex: 'productionBatch' },
  { title: '资源码号', dataIndex: 'iccidList' },
  { title: '数据校验', dataIndex: 'result' },
];

function sliceData() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
}

function handleUploadChange(info: any) {
  const res = info.file?.response;
  if (res) {
    if (res.code === 200) {
      uploadSuccess.value = true;
      errorToken.value = res.data?.errorToken || '';
      tableData.value = res.data?.importResultList || [];
      totalItems.value = tableData.value.length;
      sliceData();
      message.success('导入完成');
    } else {
      message.error('文件上传失败');
    }
  }
}

function handlePageChange(page: number) { currentPage.value = page; sliceData(); }
function handleSizeChange(current: number, size: number) { pageSize.value = size; currentPage.value = 1; sliceData(); }
function init() { tableData.value = []; paginatedData.value = []; totalItems.value = 0; fileList.value = []; uploadSuccess.value = false; enable.value = false; errorToken.value = ''; }

const uploadHeaders = { Authorization: `Bearer ${useAccessStore().accessToken}` };

const uploadAction = computed(() => `${import.meta.env.VITE_GLOB_API_URL}/manager/device/batch/profileDownload/import/${enable.value}`);

function handleDownloadFail() {
  if (errorToken.value) {
    window.open(`${import.meta.env.VITE_GLOB_API_URL}/manager/device/batch/importError/${errorToken.value}`);
  }
}

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  width: 1200,
  onConfirm: () => { if (uploadSuccess.value) emit('reload'); init(); modalApi.close(); },
  onOpenChange: async (isOpen) => { if (!isOpen) init(); },
});
</script>

<template>
  <BasicModal title="导入分配资源">
    <div class="mb-4">
      <span class="mr-2">资源立即启用：</span>
      <RadioGroup v-model:value="enable">
        <RadioButton :value="true">是</RadioButton>
        <RadioButton :value="false">否</RadioButton>
      </RadioGroup>
    </div>
    <Upload v-model:file-list="fileList" accept=".xlsx" :max-count="1"
      :action="uploadAction"
      :headers="uploadHeaders" @change="handleUploadChange">
      <a-button>上传文件</a-button>
    </Upload>
    <Alert class="mt-4" type="info" show-icon message="温馨提示：请按照模板格式输入信息，数据量不要超过10000条；只支持xlsx格式文件；默认每个设备分配1个资源码号" />
    <div v-if="paginatedData.length > 0" class="mt-4">
      <Table :columns="tableColumns" :data-source="paginatedData" :pagination="false" row-key="eid" />
      <Pagination class="mt-4" :current="currentPage" :page-size="pageSize" :total="totalItems"
        :page-size-options="['10', '20', '30', '50']" show-quick-jumper show-size-changer
        @change="handlePageChange" @showSizeChange="handleSizeChange" />
      <a-button v-if="errorToken" class="mt-4" type="primary" @click="handleDownloadFail">导出失败记录</a-button>
    </div>
  </BasicModal>
</template>
