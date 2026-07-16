<script setup lang="ts">
import type { DeviceDetailVo } from '#/api/system/device/model';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Descriptions,
  DescriptionsItem,
  Spin,
  TabPane,
  Tabs,
  Tag,
} from 'antdv-next';

import { deviceDetail } from '#/api/system/device';
import {
  formatActivationField,
  formatEmpty,
  getBoundApn,
  getBoundIccid,
  getBoundOperatorName,
  getCreateTime,
  getOnlineStatusMeta,
  getSeedNumber,
} from '#/utils/deviceLedgerStatus';

import ProfileInfoPanel from './profile-info-panel.vue';
import ProfileRecordPanel from './profile-record-panel.vue';

const emit = defineEmits<{ reload: [] }>();

const eid = ref('');
const loading = ref(false);
const detail = ref<DeviceDetailVo | null>(null);
const activeTab = ref('profile');
const recordLoaded = ref(false);
const recordPanelRef = ref<InstanceType<typeof ProfileRecordPanel>>();

const drawerTitle = computed(() => '设备详情');

const descriptionItems = computed(() => {
  const row = detail.value || {};
  return [
    { label: 'EID', value: formatEmpty(row.eid) },
    { label: '预制种子号', value: getSeedNumber(row) },
    {
      label: 'IMEI',
      value: formatActivationField(row.activationTime, row.imei),
    },
    {
      label: '设备SN',
      value: formatActivationField(
        row.activationTime,
        row.deviceSn || row.name,
      ),
    },
    { label: '激活时间', value: formatEmpty(row.activationTime) },
    {
      label: '在线状态',
      value: getOnlineStatusMeta(row).text,
      tagColor: getOnlineStatusMeta(row).color,
    },
    { label: '运营商', value: getBoundOperatorName(row) },
    { label: 'ICCID', value: getBoundIccid(row) },
    { label: 'APN', value: getBoundApn(row) },
    { label: '创建人', value: formatEmpty(row.createByName) },
    { label: '创建时间', value: getCreateTime(row) },
  ];
});

async function loadDetail() {
  if (!eid.value) return;
  loading.value = true;
  try {
    detail.value = await deviceDetail(eid.value);
  } catch (error) {
    console.error(error);
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

async function handleReload() {
  await loadDetail();
  emit('reload');
  if (activeTab.value === 'record') {
    await nextTick();
    recordPanelRef.value?.query();
  }
}

async function handleTabChange(key: number | string) {
  activeTab.value = String(key);
  if (key === 'record' && !recordLoaded.value) {
    recordLoaded.value = true;
    await nextTick();
    recordPanelRef.value?.query();
  }
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      eid.value = '';
      detail.value = null;
      activeTab.value = 'profile';
      recordLoaded.value = false;
      return;
    }
    const data = drawerApi.getData() as { eid?: string };
    eid.value = data.eid ?? '';
    await loadDetail();
  },
});
</script>

<template>
  <BasicDrawer class="w-[1100px]" :title="drawerTitle">
    <Spin :spinning="loading">
      <Descriptions bordered :column="3" size="small" class="mb-4">
        <DescriptionsItem
          v-for="item in descriptionItems"
          :key="item.label"
          :label="item.label"
        >
          <Tag v-if="item.tagColor" :color="item.tagColor">
            {{ item.value }}
          </Tag>
          <span v-else>{{ item.value }}</span>
        </DescriptionsItem>
      </Descriptions>

      <Tabs v-model:active-key="activeTab" @change="handleTabChange">
        <TabPane key="profile" tab="码号信息">
          <ProfileInfoPanel
            :detail="detail"
            :eid="eid"
            @reload="handleReload"
          />
        </TabPane>
        <TabPane key="record" tab="码号记录">
          <ProfileRecordPanel
            v-if="recordLoaded"
            ref="recordPanelRef"
            :eid="eid"
          />
        </TabPane>
      </Tabs>
    </Spin>
  </BasicDrawer>
</template>
