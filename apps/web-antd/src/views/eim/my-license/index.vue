<script setup lang="ts">
import type { MyLicenseVo } from '#/api/system/my-license/model';

import { nextTick, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Alert, TabPane, Tabs } from 'antdv-next';

import { myLicenseBalance } from '#/api/system/my-license';
import { shouldShowLicenseWarning } from '#/utils/myLicenseStatus';

import { buildOverviewItems } from './data';
import FreezeTable from './freeze-table.vue';
import OverviewPanel from './overview-panel.vue';
import RecordTable from './record-table.vue';

const license = ref<MyLicenseVo | null>(null);
const overviewLoading = ref(false);
const loadFailed = ref(false);
const activeTab = ref('freeze');
const recordLoaded = ref(false);

const freezeTableRef = ref<InstanceType<typeof FreezeTable>>();
const recordTableRef = ref<InstanceType<typeof RecordTable>>();

async function loadBalance() {
  overviewLoading.value = true;
  loadFailed.value = false;
  try {
    license.value = await myLicenseBalance();
  } catch {
    license.value = null;
    loadFailed.value = true;
  } finally {
    overviewLoading.value = false;
  }
}

async function handleTabChange(key: number | string) {
  activeTab.value = String(key);
  if (key === 'record' && !recordLoaded.value) {
    recordLoaded.value = true;
    await nextTick();
    recordTableRef.value?.query();
  }
}

onMounted(() => {
  loadBalance();
});
</script>

<template>
  <Page :auto-content-height="true">
    <Alert
      v-if="loadFailed"
      class="mb-4"
      :closable="false"
      show-icon
      type="error"
      message="数据加载失败，请稍后刷新重试"
    />

    <Alert
      v-if="shouldShowLicenseWarning(license?.availableQuota)"
      class="mb-4"
      :closable="false"
      show-icon
      type="warning"
      message="当前License剩余额度不足，请及时联系管理员充值。"
    />

    <div class="mb-4 mt-4">
      <OverviewPanel
        :loading="overviewLoading"
        :items="buildOverviewItems(license)"
      />
    </div>

    <Tabs v-model:active-key="activeTab" @change="handleTabChange">
      <TabPane key="freeze" tab="消耗记录">
        <FreezeTable ref="freezeTableRef" />
      </TabPane>
      <TabPane key="record" tab="变动记录">
        <RecordTable v-if="recordLoaded" ref="recordTableRef" />
      </TabPane>
    </Tabs>
  </Page>
</template>
