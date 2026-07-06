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
  <Page :auto-content-height="true">
    <Tabs v-model:active-key="activeTab" @change="handleTabChange">
      <TabPane key="log" tab="变动台账">
        <LogTable />
      </TabPane>
      <TabPane key="detail" tab="变动明细">
        <DetailTable v-if="detailLoaded" ref="detailTableRef" />
      </TabPane>
    </Tabs>
  </Page>
</template>
