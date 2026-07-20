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
  getCreateTime,
  getDeviceApn,
  getOnlineStatusMeta,
  getOperatorName,
  getTenantName,
} from '#/utils/deviceLedgerStatus';
import { useDeviceStore } from '#/store/device';

import EimPanel from './detail/module/eim.vue';
import OperationPanel from './detail/module/operation.vue';
import ProfileInfoPanel from './profile-info-panel.vue';
import ProfileRecordPanel from './profile-record-panel.vue';

const emit = defineEmits<{ reload: [] }>();

const eid = ref('');
const tenantId = ref<string | undefined>();
const loading = ref(false);
const detail = ref<DeviceDetailVo | null>(null);
const activeTab = ref('profile');
const recordLoaded = ref(false);
const operationLoaded = ref(false);
const eimLoaded = ref(false);
const recordPanelRef = ref<InstanceType<typeof ProfileRecordPanel>>();
const deviceStore = useDeviceStore();

const drawerTitle = computed(() => '设备详情');

const descriptionItems = computed(() => {
  const row = detail.value || {};
  return [
    { label: 'EID', value: formatEmpty(row.eid) },
    { label: '预制种子号', value: formatEmpty(row.seedNumber || row.iccid) },
    {
      label: '设备SN',
      value: formatActivationField(
        row.activationTime,
        // 兼容后端可能返回的 name 字段（DeviceDetailVo 未声明 name）
        row.deviceSn || (row as { name?: string }).name,
      ),
    },
    { label: '激活时间', value: formatEmpty(row.activationTime) },
    {
      label: '在线状态',
      value: getOnlineStatusMeta(row).text,
      tagColor: getOnlineStatusMeta(row).color,
    },
    { label: '所属租户', value: getTenantName(row) },
    { label: '运营商', value: getOperatorName(row) },
    { label: 'ICCID', value: formatEmpty(row.iccid) },
    { label: 'APN', value: getDeviceApn(row) },
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
  if (key === 'operation' && !operationLoaded.value) {
    operationLoaded.value = true;
  }
  if (key === 'eim' && !eimLoaded.value) {
    eimLoaded.value = true;
  }
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      eid.value = '';
      tenantId.value = undefined;
      detail.value = null;
      activeTab.value = 'profile';
      recordLoaded.value = false;
      operationLoaded.value = false;
      eimLoaded.value = false;
      deviceStore.setCurrentEid('');
      return;
    }
    const data = drawerApi.getData() as { eid?: string; tenantId?: string };
    eid.value = data.eid ?? '';
    deviceStore.setCurrentEid(eid.value);
    tenantId.value =
      data.tenantId != null ? String(data.tenantId) : undefined;
    await loadDetail();
    if (detail.value?.tenantId != null) {
      tenantId.value = String(detail.value.tenantId);
    }
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
            :tenant-id="tenantId"
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
        <TabPane key="operation" tab="运营信息">
          <OperationPanel v-if="operationLoaded" />
        </TabPane>
        <TabPane key="eim" tab="EIM LIST">
          <EimPanel v-if="eimLoaded" />
        </TabPane>
      </Tabs>
    </Spin>
  </BasicDrawer>
</template>
