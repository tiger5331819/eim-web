<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Tabs, TabPane } from 'antdv-next';
import { useRouter } from 'vue-router';

import Basic from './module/basic.vue';
import Operation from './module/operation.vue';
import Eim from './module/eim.vue';

const router = useRouter();
const activeKey = ref('basic');

function backTo() { router.go(-1); }
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">返回</a-button>
    </div>
    <Tabs v-model:activeKey="activeKey">
      <TabPane key="basic" tab="基本信息"><Basic /></TabPane>
      <TabPane key="operation" tab="运营信息"><Operation /></TabPane>
      <TabPane key="eim" tab="EIM LIST"><Eim /></TabPane>
    </Tabs>
  </Page>
</template>
