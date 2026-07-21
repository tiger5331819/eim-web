<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Table } from 'antdv-next';
import { useRoute } from 'vue-router';

import { eimDelete, eimList, updateEim } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

import EimFormModal from './eim-form-modal.vue';

const props = defineProps<{
  eid?: string;
}>();

const route = useRoute();
const deviceStore = useDeviceStore();
const loading = ref(false);
const tableData = ref<any[]>([]);

const [EimFormModalComp, eimFormModalApi] = useVbenModal({
  connectedComponent: EimFormModal,
});

function getEid(): string {
  return (
    props.eid ||
    deviceStore.currentEid ||
    (route.query.id as string) ||
    ''
  );
}

async function getList() {
  const eid = getEid();
  if (!eid) return;
  loading.value = true;
  try {
    const res = await eimList(eid);
    tableData.value = res.rows || [];
  } finally {
    loading.value = false;
  }
}

async function handleSynchronize() {
  await updateEim(getEid());
  await getList();
}

function handleAdd() {
  eimFormModalApi.setData({
    eid: getEid(),
    isEdit: false,
  });
  eimFormModalApi.open();
}

function handleUpdate(record: any) {
  eimFormModalApi.setData({
    eid: getEid(),
    eimId: record.eimId,
    isEdit: true,
  });
  eimFormModalApi.open();
}

async function handleDelete(record: any) {
  await eimDelete(getEid(), record.eimId);
  await getList();
}

const tableColumns = [
  { title: 'EIMId', dataIndex: 'eimId' },
  { title: 'EIMIdType', dataIndex: 'eimIdType' },
  { title: '操作', key: 'action', fixed: 'right' as const, width: 140 },
];

watch(
  () => props.eid,
  () => {
    getList();
  },
);

onMounted(() => {
  getList();
});
</script>

<template>
  <div>
    <div class="mb-3 flex items-center gap-2">
      <a-button type="primary" @click="handleAdd">新增EIM</a-button>
      <a-button type="primary" @click="handleSynchronize">同步数据</a-button>
    </div>
    <Table
      :data-source="tableData"
      :loading="loading"
      row-key="eimId"
      :columns="tableColumns"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <Space>
            <a-button type="link" size="small" @click="handleUpdate(record)">
              更新
            </a-button>
            <Popconfirm
              title="确认删除？删除后无法撤回"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" size="small" danger>删除</a-button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>
    <EimFormModalComp @reload="getList" />
  </div>
</template>
