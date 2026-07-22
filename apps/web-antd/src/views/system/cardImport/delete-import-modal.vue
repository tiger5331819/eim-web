<script setup lang="ts">
import type { UploadFile } from 'antdv-next';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { DownloadOutlined, InboxOutlined } from '@antdv-next/icons';
import { Alert, Upload } from 'antdv-next';

import {
  inventoryDeleteImport,
  inventoryDeleteImportTemplate,
} from '#/api/system/inventory';
import { useBlobExport } from '#/utils/file/export';
import { beforeManualImportUpload } from '#/utils/file/uploadLimit';

const emit = defineEmits<{ reload: [] }>();

const UploadDragger = Upload.Dragger;
const fileList = ref<UploadFile[]>([]);

const { exportBlob, exportLoading } = useBlobExport(
  inventoryDeleteImportTemplate,
);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleSubmit,
  onClosed: () => {
    fileList.value = [];
  },
});

async function handleDownloadTemplate() {
  await exportBlob({ data: {}, fileName: 'eUICC批量删除模板.xlsx' });
}

async function handleSubmit() {
  try {
    modalApi.lock(true);
    if (fileList.value.length !== 1) {
      window.message.warning('请先上传文件');
      return;
    }
    const file = fileList.value[0]!.originFileObj as File;
    await inventoryDeleteImport(file);
    window.message.success('已发起批量删除');
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}
</script>

<template>
  <BasicModal title="批量删除" class="w-[520px]">
    <Alert class="mb-3 py-2" type="info" show-icon>
      <template #message>
        <span class="text-sm">删除注意事项</span>
      </template>
      <template #description>
        <ul class="list-disc space-y-0.5 pl-4 text-xs leading-5 text-foreground/70">
          <li>支持 .xlsx / .xls / .csv，不超过 50MB、50,000 条</li>
          <li>模板仅含 EID 列；仅可删除未分配记录</li>
          <li>删除后不可恢复，请谨慎操作</li>
        </ul>
      </template>
    </Alert>
    <div class="mb-2">
      <a-button
        type="link"
        class="h-auto px-0"
        :loading="exportLoading"
        :disabled="exportLoading"
        @click="handleDownloadTemplate"
      >
        <DownloadOutlined />
        下载模板
      </a-button>
    </div>
    <UploadDragger
      v-model:file-list="fileList"
      class="import-upload-dragger"
      :before-upload="beforeManualImportUpload"
      :max-count="1"
      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
    >
      <p class="ant-upload-drag-icon flex items-center justify-center">
        <InboxOutlined class="size-8 text-primary" />
      </p>
      <p class="ant-upload-text text-sm">单击或拖拽文件到此区域</p>
      <p class="ant-upload-hint text-xs text-foreground/45">
        支持 .xlsx / .xls / .csv 格式
      </p>
    </UploadDragger>
  </BasicModal>
</template>

<style scoped>
.import-upload-dragger :deep(.ant-upload-drag) {
  padding: 16px 12px;
}
</style>
