<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import {
  Alert,
  Card,
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  message,
  Modal,
  Progress,
  Radio,
  RadioGroup,
  Select,
  Spin,
  TextArea,
  Upload,
} from 'antdv-next';
import { Page } from '@vben/common-ui';
import { useRouter } from 'vue-router';

import {
  dpDownload,
  eimDownload,
  eimProfile,
  idDownload,
  toDownload,
  toResult,
} from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { getDictOptions } from '#/utils/dict';

const router = useRouter();
const deviceStore = useDeviceStore();

const form = ref({ method: '0', code: undefined, issuer: undefined });
const progress = ref(0);
const errorCode = ref('');
const downloadData = ref<any>({});
const issuerList = ref<any[]>([]);
const fileList = ref<any[]>([]);
const trigger = ref('');
const previewVisible = ref(false);
const previewImage = ref('');
const loading = ref(false);

async function getIssuerList() {
  issuerList.value = (await eimProfile()) || [];
}

const radioOptions = getDictOptions('sys_code_method');

/** 按钮文案 */
const buttonText = computed(() => {
  if (form.value.method === '0' || form.value.method === '3')
    return '获取并下载资源';
  return '识别并下载资源';
});

/** 状态文案 */
const statusText = computed(() => {
  if (!errorCode.value) return '';
  if (errorCode.value === '200') return '资源下载中，请稍候...';
  return '下载失败，请重试或联系客服人员';
});

/** 是否下载中 */
const downloading = computed(() => errorCode.value === '200');

/** 解析二维码图片 */
async function getQrUrl(file: File) {
  const url = URL.createObjectURL(file);
  const mod = await import('qrcode-decoder');
  const QrCode = mod.default || mod.QrcodeDecoder;
  const qr = new QrCode();
  return qr.decodeFromImage(url);
}

/** 图片上传前校验并解析二维码 */
async function handleImageChange(info: any) {
  const file = info.file;
  if (file.status === 'removed') {
    fileList.value = [];
    trigger.value = '';
    previewImage.value = '';
    return;
  }
  const ext = file.name.substring(file.name.lastIndexOf('.'));
  if (!['.jpg', '.png', '.svg'].includes(ext.toLowerCase())) {
    message.error('文件格式错误，仅支持 .jpg .png .svg');
    fileList.value = [];
    return;
  }
  fileList.value = [file];
  previewImage.value = URL.createObjectURL(file.originFile || file);
  try {
    const res = await getQrUrl(file.originFile || file);
    trigger.value = res?.data || '';
    if (!trigger.value) {
      message.error('二维码识别失败，请重新上传');
    }
  } catch {
    message.error('二维码解析出错');
    trigger.value = '';
  }
}

/** 图片预览 */
function handlePreview() {
  previewVisible.value = true;
}

/** 移除图片 */
function handleImageRemove() {
  fileList.value = [];
  trigger.value = '';
  previewImage.value = '';
}

function getEid(): string {
  const route = router.currentRoute.value;
  return deviceStore.currentEid || (route.query.id as string) || '';
}

async function profileDownload() {
  const eid = getEid();
  if (!eid) {
    message.error('设备EID不存在');
    return;
  }
  progress.value = 0;
  errorCode.value = '';
  downloadData.value = {};
  loading.value = true;
  try {
    if (form.value.method === '0') {
      await dpDownload(eid);
    } else if (form.value.method === '3') {
      if (!form.value.issuer) {
        message.error('请先选择资源运营商');
        loading.value = false;
        return;
      }
      await idDownload(eid, form.value.issuer!);
    } else if (form.value.method === '2') {
      if (!trigger.value) {
        message.error('请先上传二维码图片');
        loading.value = false;
        return;
      }
      await toDownload(eid, { trigger: trigger.value });
    } else {
      if (!form.value.code) {
        message.error('请先输入QRcode');
        loading.value = false;
        return;
      }
      await toDownload(eid, { trigger: form.value.code });
    }
    errorCode.value = '200';
    message.success('开始下载资源，请稍等...');
    pollProgress(eid);
  } catch {
    errorCode.value = '500';
    loading.value = false;
  }
}

async function pollProgress(eid: string) {
  const res = await eimDownload(eid);
  progress.value = res.data ?? 0;
  if (progress.value < 100) {
    setTimeout(() => pollProgress(eid), 500);
  } else {
    const result = await toResult(eid);
    downloadData.value = result.data || {};
    loading.value = false;
  }
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  getIssuerList();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="p-4">
      <!-- 顶部导航栏 -->
      <div class="mb-4 flex items-center">
        <AButton type="text" class="mr-2 flex items-center" @click="backTo">
          ← 返回
        </AButton>
      </div>

      <!-- 主体卡片 -->
      <Card class="shadow-sm">
        <template #title>
          <span class="text-base font-medium">下载业务号</span>
        </template>

        <Spin :spinning="loading">
          <Form layout="vertical" class="max-w-2xl">
            <!-- 请求方式 -->
            <FormItem label="请求方式">
              <RadioGroup v-model:value="form.method" class="flex flex-wrap gap-2">
                <Radio
                  v-for="item in radioOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </Radio>
              </RadioGroup>
            </FormItem>

            <!-- 方式1：输入QRcode文本 -->
            <FormItem v-if="form.method === '1'" label="输入 QRcode">
              <TextArea
                v-model:value="form.code"
                placeholder="请输入 QRcode 文本内容"
                :rows="4"
                class="w-full"
              />
            </FormItem>

            <!-- 方式2：上传QRcode图片 -->
            <FormItem v-if="form.method === '2'" label="上传 QRcode 图片">
              <Upload
                :file-list="fileList"
                :max-count="1"
                accept=".jpg,.png,.svg"
                list-type="picture-card"
                :custom-request="() => {}"
                @change="handleImageChange"
                @preview="handlePreview"
                @remove="handleImageRemove"
              >
                <div
                  v-if="fileList.length === 0"
                  class="flex flex-col items-center justify-center"
                >
                  <span class="text-2xl text-gray-400">+</span>
                  <span class="mt-1 text-xs text-gray-400">上传图片</span>
                </div>
              </Upload>
              <div class="mt-2 text-xs text-gray-400">
                支持扩展名：.jpg .png .svg
              </div>
            </FormItem>

            <!-- 方式3：选择资源运营商 -->
            <FormItem v-if="form.method === '3'" label="资源运营商">
              <Select
                v-model:value="form.issuer"
                placeholder="请选择资源运营商"
                class="w-full"
                :options="
                  issuerList.map((i: any) => ({
                    label: i.issuer,
                    value: i.id,
                  }))
                "
              />
            </FormItem>

            <!-- 操作按钮 -->
            <FormItem class="mt-2">
              <AButton
                type="primary"
                :loading="downloading"
                @click="profileDownload"
              >
                {{ downloading ? '下载中...' : buttonText }}
              </AButton>
            </FormItem>

            <!-- 状态提示 -->
            <Alert
              v-if="errorCode === '500'"
              type="error"
              show-icon
              message="下载失败"
              description="请重新操作或联系客服人员"
              class="mb-4"
            />

            <!-- 进度条 -->
            <FormItem v-if="downloading" label="下载进度">
              <Progress
                :percent="progress"
                :stroke-color="{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }"
                :status="progress < 100 ? 'active' : 'success'"
              />
            </FormItem>

            <!-- 下载结果 -->
            <Card
              v-if="progress >= 100 && downloadData && downloadData.iccid"
              class="mt-4 bg-gray-50"
              :bordered="false"
            >
              <template #title>
                <span class="text-base font-medium">
                  {{ downloadData.iccid }}
                </span>
                <span class="ml-2 text-sm text-gray-400">详细信息</span>
              </template>
              <Descriptions :column="1" size="small" bordered>
                <DescriptionsItem label="运营商">
                  {{ downloadData.issue || '--' }}
                </DescriptionsItem>
                <DescriptionsItem label="所属地">
                  {{ downloadData.country || '--' }}
                </DescriptionsItem>
                <DescriptionsItem label="ICCID">
                  {{ downloadData.iccid || '--' }}
                </DescriptionsItem>
              </Descriptions>
            </Card>
          </Form>
        </Spin>
      </Card>

      <!-- 图片预览弹窗 -->
      <Modal
        :open="previewVisible"
        :footer="null"
        title="图片预览"
        @cancel="previewVisible = false"
      >
        <img
          style="width: 100%"
          :src="previewImage"
          alt="预览"
        />
      </Modal>
    </div>
  </Page>
</template>
