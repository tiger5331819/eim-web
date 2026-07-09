<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Card, Table, TableColumn } from 'antdv-next';
import { useRoute } from 'vue-router';

import { operationLog } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

const route = useRoute();
const deviceStore = useDeviceStore();
const loading = ref(true);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = ref({ pageNum: 1, pageSize: 10 });

function getEid(): string {
  return deviceStore.currentEid || (route.query.id as string) || '';
}

const tableColumns = [
  { title: '创建时间', dataIndex: 'creationTime', width: 300 },
  { title: '动作', dataIndex: 'name', width: 200 },
  { title: '描述', dataIndex: 'message' },
];

async function getList() {
  const eid = getEid();
  if (!eid) return;
  loading.value = true;
  try {
    const res = await operationLog(eid, queryParams.value);
    tableData.value = res.rows || [];
    total.value = res.total || 0;
  } finally { loading.value = false; }
}

onMounted(() => { getList(); });
</script>

<template>
  <Card>
    <template #extra><a-button type="primary" @click="getList">同步数据</a-button></template>
    <Table :data-source="tableData" :loading="loading" row-key="creationTime" :columns="tableColumns"
      :pagination="{ current: queryParams.pageNum, pageSize: queryParams.pageSize, total }"
      @change="(pag: any) => { queryParams.pageNum = pag.current; queryParams.pageSize = pag.pageSize; getList(); }" />
  </Card>
</template>
