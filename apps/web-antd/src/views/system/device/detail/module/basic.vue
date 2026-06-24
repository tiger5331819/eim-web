<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Card, Popconfirm, Space, Switch, Table } from 'antdv-next';
import { useRoute, useRouter } from 'vue-router';

import {
  deviceDetail,
  toDelete,
  toDisable,
  toEnable,
  updateDetail,
  updateProfileApn,
} from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { renderDict } from '#/utils/render';
import ApnSyncConfirmModal from '#/views/system/apn/components/apn-sync-confirm-modal.vue';

import ApnModal from './apn-modal.vue';

const route = useRoute();
const router = useRouter();
const deviceStore = useDeviceStore();
const loading = ref(true);
const detailData = ref<any>({});
const tableData = ref<any[]>([]);
const lastEnabledIccid = ref<string>('');

function getEid(): string {
  return deviceStore.currentEid || (route.query.id as string) || '';
}

const [ApnModalComp, apnApi] = useVbenModal({ connectedComponent: ApnModal });

const [ApnSyncModalComp, apnSyncApi] = useVbenModal({
  connectedComponent: ApnSyncConfirmModal,
});

async function getList() {
  const eid = getEid();
  if (!eid) return;
  loading.value = true;
  try {
    const res = await deviceDetail(eid);
    detailData.value = res || {};
    tableData.value = (res?.profileList || []).map((item: any) => ({
      ...item,
      state: String(item.state),
    }));
  } finally {
    loading.value = false;
  }
}

async function handleSync() {
  const eid = getEid();
  await updateDetail(eid);
  await getList();
}

/**
 * 启用码号：先调启用接口，成功后弹 APN 同步确认弹窗
 * 用户选择 APN 与是否同步下发后，再调 updateProfileApn
 */
async function handleEnable(row: any) {
  const eid = getEid();
  await toEnable(eid, row.iccid);
  lastEnabledIccid.value = row.iccid;
  await getList();

  // 弹 APN 同步确认 — 需要 operatorId（后端 profile 暂未返回 operatorId 时，降级兜底）
  const operatorId = row.operatorId;
  if (operatorId) {
    apnSyncApi.setData({
      operatorId,
      operatorName: row.operatorName || row.operatorCode || row.providerName || row.issuer || '',
      defaultApnId: row.apnId,
      defaultApnName: row.apnName || row.apn,
      bizHint: `ICCID ${row.iccid} 已启用，请确认 APN 配置`,
    });
    apnSyncApi.open();
  }
  return true;
}

async function handleDisable(row: any) {
  await toDisable(getEid(), row.iccid);
  await getList();
  return true;
}

async function handleDelete(row: any) {
  await toDelete(getEid(), row.iccid);
  await getList();
}

function handleAdd() {
  const eid = getEid();
  router.push({ path: '/system/device/add', query: { id: eid } });
}

function handleEditApn(row: any) {
  apnApi.setData({ row });
  apnApi.open();
}

/**
 * 用户在 APN 同步确认弹窗中确认后回调
 * payload = { apnId, sync }
 */
async function handleApnSyncConfirm(payload: {
  apnId: string;
  sync: boolean;
}) {
  // 优先用刚启用的 ICCID，否则取当前启用状态的 profile
  const iccid =
    lastEnabledIccid.value ||
    tableData.value.find((p) => p.state === '1')?.iccid;
  if (!iccid) return;
  await updateProfileApn(getEid(), iccid, payload.apnId);
  await getList();
}

const tableColumns = [
  { title: '运营商', dataIndex: 'issuer' },
  { title: 'ICCID', dataIndex: 'iccid' },
  {
    title: '状态',
    key: 'state',
    customRender: ({ record }: any) =>
      renderDict(record.state ?? '', 'sys_profile_status'),
  },
  { title: 'APNID', dataIndex: 'apnId' },
  { title: 'APN名称', dataIndex: 'apnName' },
  { title: 'APN', dataIndex: 'apn' },
  { title: '操作', key: 'action', fixed: 'right' },
];

onMounted(() => {
  getList();
});
</script>

<template>
  <div>
    <div class="flex justify-around">
      <div class="ml-8 flex-1">
        <div class="mb-2">EID: {{ detailData.eid || '--' }}</div>
        <div class="mb-2">设备SN: {{ detailData.name || '--' }}</div>
        <div class="mb-2">预制种子号: {{ detailData.iccid || '--' }}</div>
        <div class="mb-2">
          创建时间: {{ detailData.creationTime || '--' }}
        </div>
      </div>
      <div class="flex-1">
        <div class="mb-2">EIM: {{ detailData.eimFqdn || '--' }}</div>
        <div class="mb-2">
          在线状态:
          <component
            :is="() => renderDict(detailData.online ?? '', 'sys_device_status')"
          />
        </div>
        <div class="mb-2">
          激活时间: {{ detailData.activationTime || '--' }}
        </div>
      </div>
    </div>
    <Card title="业务号信息" class="mt-4">
      <template #extra>
        <Space>
          <a-button type="primary" @click="handleAdd">下载业务号</a-button>
          <a-button type="primary" @click="handleSync">同步数据</a-button>
        </Space>
      </template>
      <Table
        :data-source="tableData"
        :loading="loading"
        row-key="iccid"
        :pagination="{ pageSize: 10 }"
        :columns="tableColumns"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Space>
              <Switch
                :checked="record.state === '1'"
                checked-children="启用"
                un-checked-children="停用"
                @change="
                  record.state === '1'
                    ? handleDisable(record)
                    : handleEnable(record)
                "
              />
              <a-button type="link" size="small" @click="handleEditApn(record)">
                APN更新
              </a-button>
              <Popconfirm title="确认删除？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger>删除</a-button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>
    <ApnModalComp @reload="getList()" />
    <ApnSyncModalComp @confirm="handleApnSyncConfirm" />
  </div>
</template>
