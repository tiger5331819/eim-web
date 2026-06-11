<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Card,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  TabPane,
  Tabs,
  Tag,
} from 'antdv-next';
import { useRoute, useRouter } from 'vue-router';

import {
  batchAllocationAndDownload,
  dpDownload,
  eimProfile,
  idDownload,
  toDownload,
} from '#/api/system/device';

const route = useRoute();
const router = useRouter();

const eid = ref<string>('');
const activeTab = ref<string>('pool');

// =========== Tab 1: 租户资源池 ===========
const carrierList = ref<any[]>([]);
const carrierLoading = ref(false);
const selectedCarrierId = ref<number | undefined>(undefined);
const previewProfile = ref<any>(null);
const previewLoading = ref(false);

async function loadCarriers() {
  carrierLoading.value = true;
  try {
    const list = await eimProfile();
    carrierList.value = list || [];
  } finally {
    carrierLoading.value = false;
  }
}

async function previewFromPool() {
  if (!selectedCarrierId.value) {
    window.message.warning('请选择运营商');
    return;
  }
  previewLoading.value = true;
  try {
    const data = await idDownload(eid.value, selectedCarrierId.value);
    previewProfile.value = data;
  } catch (error) {
    console.error(error);
    previewProfile.value = null;
  } finally {
    previewLoading.value = false;
  }
}

function confirmDownloadFromPool() {
  if (!previewProfile.value) {
    window.message.warning('请先点击"预览码号"获取码号');
    return;
  }
  window.message.success('下载任务已创建，请前往任务列表查看进度');
  router.push({ path: '/system/task' });
}

// =========== Tab 2: DP+ 直连 ===========
const dpLoading = ref(false);
async function handleDpDownload() {
  dpLoading.value = true;
  try {
    await dpDownload(eid.value);
    window.message.success('已触发 DP+ 下载');
    router.push({ path: '/system/task' });
  } finally {
    dpLoading.value = false;
  }
}

// =========== Tab 3: 激活码 ===========
const activationCode = ref<string>('');
const codeLoading = ref(false);
async function handleCodeDownload() {
  if (!activationCode.value) {
    window.message.warning('请输入激活码');
    return;
  }
  codeLoading.value = true;
  try {
    await toDownload(eid.value, { trigger: activationCode.value });
    window.message.success('已触发下载');
    router.push({ path: '/system/task' });
  } finally {
    codeLoading.value = false;
  }
}

// =========== Tab 4: 指定批次 ===========
const batchForm = ref({
  projectId: '',
  productionBatch: '',
  count: 1,
});
const batchLoading = ref(false);
async function handleBatchDownload() {
  if (!batchForm.value.productionBatch) {
    window.message.warning('请输入批次');
    return;
  }
  batchLoading.value = true;
  try {
    await batchAllocationAndDownload({
      use: true,
      deviceList: [
        {
          eid: eid.value,
          productionBatch: batchForm.value.productionBatch,
          projectId: batchForm.value.projectId,
          count: String(batchForm.value.count),
        },
      ],
    } as any);
    window.message.success('已触发下载');
    router.push({ path: '/system/task' });
  } finally {
    batchLoading.value = false;
  }
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  eid.value = (route.query.id as string) || '';
  loadCarriers();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">← 返回</a-button>
    </div>

    <Card>
      <div class="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <span>当前设备 EID:</span>
        <Tag color="blue">{{ eid || '--' }}</Tag>
      </div>

      <Tabs v-model:active-key="activeTab" type="card">
        <!-- Tab 1: 租户资源池下载 -->
        <TabPane key="pool" tab="🎯 从租户资源池下载">
          <div class="space-y-4 p-2">
            <div
              class="rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
            >
              选择运营商后，系统将从租户码号资源池中随机选取一个可用码号供下载。
            </div>

            <div class="flex items-center gap-3">
              <span>运营商：</span>
              <Select
                v-model:value="selectedCarrierId"
                :loading="carrierLoading"
                placeholder="请选择运营商"
                style="width: 280px"
                :options="
                  carrierList.map((c) => ({
                    label: c.issuer,
                    value: c.id,
                  }))
                "
              />
              <a-button
                type="primary"
                :loading="previewLoading"
                @click="previewFromPool"
              >
                预览码号
              </a-button>
            </div>

            <Spin :spinning="previewLoading">
              <Card v-if="previewProfile" size="small" class="bg-emerald-50/40">
                <div class="space-y-2">
                  <div class="text-sm font-semibold">已获取以下码号：</div>
                  <div class="flex flex-wrap gap-3 text-sm">
                    <div>
                      <span class="text-gray-500">ICCID：</span>
                      <code>{{ previewProfile.iccid || '--' }}</code>
                    </div>
                    <div>
                      <span class="text-gray-500">运营商：</span>
                      <Tag color="blue">
                        {{
                          previewProfile.issue || previewProfile.issuer || '--'
                        }}
                      </Tag>
                    </div>
                    <div v-if="previewProfile.country">
                      <span class="text-gray-500">所属地：</span>
                      {{ previewProfile.country }}
                    </div>
                  </div>
                  <a-button type="primary" @click="confirmDownloadFromPool">
                    确认下载
                  </a-button>
                </div>
              </Card>
              <Empty
                v-else-if="!previewLoading"
                description="尚未预览码号"
                class="my-8"
              />
            </Spin>
          </div>
        </TabPane>

        <!-- Tab 2: DP+ -->
        <TabPane key="dp" tab="🔗 DP+ 直连下载">
          <div class="space-y-4 p-2">
            <div
              class="rounded bg-purple-50 px-3 py-2 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
            >
              从 SM-DP+ 直接获取 MatchingId 并触发下载。
            </div>
            <a-button
              type="primary"
              :loading="dpLoading"
              @click="handleDpDownload"
            >
              触发 DP+ 下载
            </a-button>
          </div>
        </TabPane>

        <!-- Tab 3: 激活码 -->
        <TabPane key="code" tab="🔑 激活码下载">
          <div class="space-y-4 p-2">
            <div
              class="rounded bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            >
              手动输入 SM-DP+ 激活码触发下载。
            </div>
            <Input
              v-model:value="activationCode"
              placeholder="请输入激活码（trigger string）"
              style="width: 480px"
            />
            <div>
              <a-button
                type="primary"
                :loading="codeLoading"
                @click="handleCodeDownload"
              >
                识别并下载
              </a-button>
            </div>
          </div>
        </TabPane>

        <!-- Tab 4: 指定批次 -->
        <TabPane key="batch" tab="📦 从指定批次下载">
          <div class="space-y-4 p-2">
            <div
              class="rounded bg-teal-50 px-3 py-2 text-xs text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
            >
              指定项目和批次，从该批次的资源池中分配并下载到当前设备。
            </div>
            <Space direction="vertical" style="width: 100%" :size="12">
              <div class="flex items-center gap-3">
                <span class="w-24 text-right">项目ID：</span>
                <Input
                  v-model:value="batchForm.projectId"
                  placeholder="请输入项目ID"
                  style="width: 320px"
                />
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-right">生产批次：</span>
                <Input
                  v-model:value="batchForm.productionBatch"
                  placeholder="请输入批次号"
                  style="width: 320px"
                />
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-right">数量：</span>
                <Input
                  v-model:value="batchForm.count"
                  type="number"
                  placeholder="分配数量"
                  style="width: 120px"
                />
              </div>
              <div>
                <a-button
                  type="primary"
                  :loading="batchLoading"
                  @click="handleBatchDownload"
                >
                  分配并下载
                </a-button>
              </div>
            </Space>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>
