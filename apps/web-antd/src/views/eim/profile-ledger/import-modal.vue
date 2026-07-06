<script setup lang="ts">
import type { UploadFile } from 'antdv-next';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { DownloadOutlined, InboxOutlined } from '@antdv-next/icons';
import { Alert, Upload } from 'antdv-next';

import {
  profileLedgerImport,
  profileLedgerImportTemplate,
} from '#/api/system/profile-ledger';
import { useBlobExport } from '#/utils/file/export';

const emit = defineEmits<{ reload: [] }>();

const UploadDragger = Upload.Dragger;
const fileList = ref<UploadFile[]>([]);

const { exportBlob, exportLoading } = useBlobExport(profileLedgerImportTemplate);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleSubmit,
  onClosed: () => {
    fileList.value = [];
  },
});

async function handleDownloadTemplate() {
  await exportBlob({ data: {}, fileName: '码号导入模板.xlsx' });
}

async function handleSubmit() {
  try {
    modalApi.lock(true);
    if (fileList.value.length !== 1) {
      window.message.warning('请先上传导入文件');
      return;
    }
    const file = fileList.value[0]!.originFileObj as File;
    await profileLedgerImport(file);
    window.message.success('导入任务已提交，完成后将通知您');
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
  <BasicModal title="批量导入码号" class="w-[520px]">
    <Alert class="mb-3 py-2" type="info" show-icon>
      <template #message>
        <span class="text-sm">导入注意事项</span>
      </template>
      <template #description>
        <ul class="list-disc space-y-0.5 pl-4 text-xs leading-5 text-foreground/70">
          <li>支持 .xlsx / .xls / .csv，不超过 50MB、50,000 条</li>
          <li>请使用模板，列顺序固定，全部字段必填</li>
          <li>运营商名称须与已启用运营商一致，码号须全局唯一</li>
        </ul>
      </template>
    </Alert>
    <div class="mt-2">
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
      :before-upload="() => false"
      :max-count="1"
      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
    >
      <p class="ant-upload-drag-icon flex items-center justify-center">
        <InboxOutlined class="size-8 text-primary" />
      </p>
      <p class="ant-upload-text text-sm">点击或拖拽文件到此区域上传</p>
      <p class="ant-upload-hint text-xs text-foreground/45">
        支持 .xlsx / .xls / .csv
      </p>
    </UploadDragger>
</BasicModal>
</template>

<style scoped>
.import-upload-dragger :deep(.ant-upload-drag) {
  padding: 16px 12px;
}
</style>
