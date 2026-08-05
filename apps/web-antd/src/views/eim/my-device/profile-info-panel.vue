<script setup lang="ts">
import type { DeviceDetailVo, DeviceProfileVo } from '#/api/system/device/model';

import { computed, ref, watch } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenModal } from '@vben/common-ui';

import { DownOutlined } from '@antdv-next/icons';
import { Dropdown, Popconfirm, Space, Switch, Table } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  toDelete,
  toDisable,
  updateDetail,
} from '#/api/system/device';
import { getProfileApn, getProfileOperatorName } from '#/utils/deviceLedgerStatus';

import { createProfileInfoFilterSchema } from './data';
import DownloadBusinessModal from './download-business-modal.vue';
import DownloadProfileModal from './download-profile-modal.vue';
import EnableProfileModal from './enable-profile-modal.vue';
import UpdateApnModal from './update-apn-modal.vue';

const props = defineProps<{
  detail?: DeviceDetailVo | null;
  eid: string;
  tenantId?: string;
}>();

const emit = defineEmits<{ reload: [] }>();

function resolveTenantId() {
  return props.tenantId ?? props.detail?.tenantId;
}

const profileList = ref<DeviceProfileVo[]>([]);
const filteredList = ref<DeviceProfileVo[]>([]);
const syncing = ref(false);

const { hasAccessByCodes } = useAccess();

const downloadMenuItems = computed(() => {
  const items = [];
  if (hasAccessByCodes(['eim:device:download'])) {
    items.push({ key: 'profile', label: '下载码号' });
  }
  if (hasAccessByCodes(['eim:device:downloadBiz'])) {
    items.push({ key: 'business', label: '下载业务号' });
  }
  return items;
});

const [FilterForm, filterFormApi] = useVbenForm({
  compact: true,
  layout: 'inline',
  commonConfig: {
    labelWidth: 72,
    componentProps: {
      allowClear: true,
      class: 'w-[180px]',
    },
    formItemClass: 'mb-0 items-center',
  },
  schema: createProfileInfoFilterSchema(resolveTenantId),
  wrapperClass: 'flex flex-wrap items-center gap-x-4 gap-y-2',
  actionLayout: 'inline',
  actionWrapperClass: 'ml-auto shrink-0',
  submitButtonOptions: { content: '查询' },
  resetButtonOptions: { content: '重置' },
  handleSubmit: applyFilter,
  handleReset: async () => {
    await filterFormApi.resetForm();
    await applyFilter();
  },
});

const [DownloadModalComp, downloadModalApi] = useVbenModal({
  connectedComponent: DownloadProfileModal,
});
const [DownloadBusinessModalComp, downloadBusinessModalApi] = useVbenModal({
  connectedComponent: DownloadBusinessModal,
});
const [EnableModalComp, enableModalApi] = useVbenModal({
  connectedComponent: EnableProfileModal,
});
const [UpdateApnModalComp, updateApnModalApi] = useVbenModal({
  connectedComponent: UpdateApnModal,
});

const tableColumns = computed(() => [
  {
    title: '运营商',
    key: 'operatorName',
    dataIndex: 'operatorName',
  },
  { title: 'ICCID', key: 'iccid', dataIndex: 'iccid' },
  {
    title: 'APN',
    key: 'apn',
    dataIndex: 'apn',
  },
  { title: '状态', key: 'state', width: 100 },
  { title: '操作', key: 'action', width: 160 },
]);

watch(
  () => props.detail?.profileList,
  async (list) => {
    profileList.value = list || [];
    await applyFilter();
  },
  { immediate: true },
);

async function applyFilter() {
  const values = await filterFormApi.getValues();
  filteredList.value = profileList.value.filter((item) => {
    const operatorMatch =
      !values.operatorId ||
      String(item.operatorId ?? '') === String(values.operatorId);
    const iccidMatch =
      !values.iccid ||
      String(item.iccid || '')
        .toLowerCase()
        .includes(String(values.iccid).toLowerCase());
    const apnMatch =
      !values.apn ||
      String(item.apn || item.apnName || '')
        .toLowerCase()
        .includes(String(values.apn).toLowerCase());
    return operatorMatch && iccidMatch && apnMatch;
  });
}

async function handleSync() {
  if (!props.eid) return;
  syncing.value = true;
  try {
    await updateDetail(props.eid);
    emit('reload');
    window.message.success('同步成功');
  } catch (error) {
    console.error(error);
  } finally {
    syncing.value = false;
  }
}

function handleDownload() {
  downloadModalApi.setData({
    eid: props.eid,
    tenantId: resolveTenantId(),
  });
  downloadModalApi.open();
}

function handleDownloadMenu({ key }: { key: number | string }) {
  if (key === 'profile') {
    handleDownload();
    return;
  }
  if (key === 'business') {
    if (!props.eid) {
      window.message.warning('缺少设备 EID');
      return;
    }
    downloadBusinessModalApi.setData({ eid: props.eid });
    downloadBusinessModalApi.open();
  }
}

function buildProfileModalData(row: DeviceProfileVo) {
  return {
    eid: props.eid,
    iccid: row.iccid,
    operatorId: row.operatorId,
    apnId: row.apnId,
    apn: row.apn,
    apnName: row.apnName,
  };
}

function handleProfileSwitch(checked: boolean, row: DeviceProfileVo) {
  if (checked) {
    enableModalApi.setData({
      eid: props.eid,
      iccid: row.iccid,
    });
    enableModalApi.open();
    return;
  }
  window.modal.confirm({
    title: '提示',
    content: '确定禁用该码号？',
    centered: true,
    onOk: async () => {
      await toDisable(props.eid, row.iccid!);
      window.message.success('操作成功');
      emit('reload');
    },
    onCancel: () => emit('reload'),
  });
}

function handleUpdateApn(row: DeviceProfileVo) {
  updateApnModalApi.setData(buildProfileModalData(row));
  updateApnModalApi.open();
}

async function handleDelete(row: DeviceProfileVo) {
  if (String(row.state) === '1') {
    window.message.warning('启用状态的码号不可删除，请先停用');
    return;
  }
  await toDelete(props.eid, row.iccid!);
  window.message.success('删除成功');
  emit('reload');
}

function handleChildReload() {
  emit('reload');
}
</script>

<template>
  <div>
    <div class="device-profile-filter mb-3">
      <FilterForm />
    </div>

    <div class="mb-3 flex items-center">
      <Space>
        <Dropdown
          v-if="downloadMenuItems.length > 0"
          :menu="{
            items: downloadMenuItems,
            onClick: handleDownloadMenu,
          }"
        >
          <a-button type="primary">
            下载码号
            <DownOutlined />
          </a-button>
        </Dropdown>
        <a-button
          :loading="syncing"
          v-access:code="['eim:device:sync']"
          @click="handleSync"
        >
          同步数据
        </a-button>
      </Space>
    </div>

    <Table
      :columns="tableColumns"
      :data-source="filteredList"
      :pagination="false"
      :locale="{ emptyText: '暂无已绑定的码号数据' }"
      row-key="iccid"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operatorName'">
          {{ getProfileOperatorName(record) }}
        </template>
        <template v-else-if="column.key === 'apn'">
          {{ getProfileApn(record) }}
        </template>
        <template v-else-if="column.key === 'state'">
          <Switch
            :checked="String(record.state) === '1'"
            checked-children="启用"
            un-checked-children="停用"
            @change="(checked) => handleProfileSwitch(!!checked, record)"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <action-button
              v-access:code="['eim:device:update']"
              @click.stop="handleUpdateApn(record)"
            >
              更新APN
            </action-button>
            <Popconfirm
              placement="left"
              title="确认删除该码号？删除后将从设备中移除，且码号不可恢复。"
              @confirm="handleDelete(record)"
            >
              <action-button
                danger
                v-access:code="['eim:device:delete']"
                @click.stop=""
              >
                删除
              </action-button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <DownloadModalComp @reload="handleChildReload" />
    <DownloadBusinessModalComp @reload="handleChildReload" />
    <EnableModalComp @reload="handleChildReload" />
    <UpdateApnModalComp @reload="handleChildReload" />
  </div>
</template>

<style scoped>
.device-profile-filter :deep(.pb-2),
.device-profile-filter :deep(.pb-4) {
  padding-bottom: 0;
}

.device-profile-filter :deep(.flex-auto) {
  width: auto;
}
</style>
