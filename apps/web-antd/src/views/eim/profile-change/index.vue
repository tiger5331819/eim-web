<script setup lang="ts">
import { nextTick, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { TabPane, Tabs } from 'antdv-next';

import DetailTable from './detail-table.vue';
import LogTable from './log-table.vue';

const activeTab = ref('log');
const detailLoaded = ref(false);
const detailTableRef = ref<InstanceType<typeof DetailTable>>();

async function handleTabChange(key: number | string) {
  activeTab.value = String(key);
  if (key === 'detail' && !detailLoaded.value) {
    detailLoaded.value = true;
    await nextTick();
    detailTableRef.value?.query();
  }
}
</script>

<template>
  <Page
    :auto-content-height="true"
    content-class="flex flex-col overflow-hidden"
  >
    <Tabs
      v-model:active-key="activeTab"
      class="profile-change-tabs flex min-h-0 w-full flex-1 flex-col"
      @change="handleTabChange"
    >
      <TabPane key="log" tab="变动台账" class="h-full">
        <div class="h-full min-h-0 w-full">
          <LogTable />
        </div>
      </TabPane>
      <TabPane key="detail" tab="变动明细" class="h-full">
        <div v-if="detailLoaded" class="h-full min-h-0 w-full">
          <DetailTable ref="detailTableRef" />
        </div>
      </TabPane>
    </Tabs>
  </Page>
</template>

<style scoped>
.profile-change-tabs {
  width: 100%;
}

.profile-change-tabs :deep(.ant-tabs-nav) {
  flex-shrink: 0;
  width: 100%;
  margin-bottom: 8px;
}

.profile-change-tabs :deep(.ant-tabs-content-holder) {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.profile-change-tabs :deep(.ant-tabs-content),
.profile-change-tabs :deep(.ant-tabs-tabpane) {
  height: 100%;
  width: 100%;
}

.profile-change-tabs :deep(.ant-tabs-tabpane-active) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
