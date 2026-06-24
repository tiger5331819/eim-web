<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Alert, Pagination, Table, Upload } from 'antdv-next';

import type { OperatorImportFailItem } from '#/api/system/operator/model';

import { operatorImport } from '#/api/system/operator';

const emit = defineEmits<{ reload: [] }>();

const fileList = ref<any[]>([]);
const tableData = ref<OperatorImportFailItem[]>([]);
const paginatedData = ref<OperatorImportFailItem[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const uploadSuccess = ref(false);
const importResult = ref<{
  successCount: number;
  failCount: number;
} | null>(null);
const uploading = ref(false);

const tableColumns = [
  { title: '运营商名称', dataIndex: 'operatorName' },
  { title: '运营商编码', dataIndex: 'operatorCode', customRender: ({ text }: any) => text || '--' },
  { title: '失败原因', dataIndex: 'failReason' },
];

function sliceData() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
}

function handlePageChange(page: number) {
  currentPage.value = page;
  sliceData();
}

function handleSizeChange(_current: number, size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  sliceData();
}

async function customRequest(options: any) {
  const { file, onSuccess, onError } = options;
  uploading.value = true;
  try {
    const result = await operatorImport(file as File);
    uploadSuccess.value = true;
    importResult.value = {
      successCount: result.successCount,
      failCount: result.failCount,
    };
    tableData.value = result.failList || [];
    totalItems.value = tableData.value.length;
    currentPage.value = 1;
    sliceData();
    onSuccess?.(result, file);
    if (result.failCount > 0) {
      window.message.warning(`导入完成：成功 ${result.successCount} 条，失败 ${result.failCount} 条`);
    } else {
      window.message.success(`导入完成：成功 ${result.successCount} 条`);
    }
  } catch (error) {
    console.error(error);
    onError?.(error);
  } finally {
    uploading.value = false;
  }
}

function init() {
  tableData.value = [];
  paginatedData.value = [];
  totalItems.value = 0;
  fileList.value = [];
  uploadSuccess.value = false;
  importResult.value = null;
}

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  class: 'w-[900px]',
  onConfirm: () => {
    if (uploadSuccess.value) emit('reload');
    init();
    modalApi.close();
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) init();
  },
});
</script>

<template>
  <BasicModal title="批量导入运营商">
    <Upload
      v-model:file-list="fileList"
      accept=".xlsx"
      :max-count="1"
      :custom-request="customRequest"
      :disabled="uploading"
    >
      <a-button :loading="uploading">上传文件</a-button>
    </Upload>
    <Alert
      class="mt-4"
      type="info"
      show-icon
      message="温馨提示：请按照模板格式输入信息；只支持 xlsx 格式文件"
    />
    <div v-if="importResult" class="mt-4 flex gap-6">
      <span class="text-emerald-600">成功：{{ importResult.successCount }} 条</span>
      <span class="text-rose-600">失败：{{ importResult.failCount }} 条</span>
    </div>
    <div v-if="paginatedData.length > 0" class="mt-4">
      <p>导入失败记录</p>
      <Table
        :columns="tableColumns"
        :data-source="paginatedData"
        :pagination="false"
        row-key="operatorName"
        size="small"
      />
      <Pagination
        class="mt-4"
        :current="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        :page-size-options="['10', '20', '30', '50']"
        show-quick-jumper
        show-size-changer
        @change="handlePageChange"
        @show-size-change="handleSizeChange"
      />
    </div>
  </BasicModal>
</template>
