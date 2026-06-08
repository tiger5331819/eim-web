<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Button as AButton, Card, InputNumber, RadioGroup, RadioButton, Select, Table, TableColumn, Pagination } from 'antdv-next';
import { Page } from '@vben/common-ui';
import { useRouter } from 'vue-router';

import { batchAllocationAndDownload, batchListByProjectId } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

const router = useRouter();
const deviceStore = useDeviceStore();

const form = ref({ count: 0, productionBatch: undefined, use: false });
const batchDict = ref<any[]>([]);
const batchCountSum = ref(0);
const companyAndProject = ref('');
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

function sliceData() { const start = (currentPage.value - 1) * pageSize.value; const end = start + pageSize.value; paginatedData.value = tableData.value.slice(start, end); }

async function getData() {
  const list = deviceStore.downloadList;
  tableData.value = [...list];
  if (!list.length) return;
  const firstItem = list[0];
  const projectId = firstItem.projectId || '';
  companyAndProject.value = `当前企业${firstItem.companyName}的项目${firstItem.projectName}`;
  const res = await batchListByProjectId(projectId);
  const batches = res.data || [];
  batchCountSum.value = 0;
  batchDict.value = batches.map((item: any) => { batchCountSum.value += item.canBeInstalledCount || 0; return { label: item.productionBatch, value: item.productionBatch }; });
  sliceData();
}

function allocation() { tableData.value.forEach((item: any) => { item.productionBatch = form.value.productionBatch; item.count = form.value.count; }); sliceData(); }

async function handleDownload() {
  allocation();
  const data = { use: form.value.use, deviceList: tableData.value.map((item: any) => ({ eid: item.eid, productionBatch: item.productionBatch, projectId: item.projectId, count: item.count })) };
  await batchAllocationAndDownload(data);
  deviceStore.clearDownloadList();
  router.push({ path: '/system/task' });
}

function handlePageChange(page: number) { currentPage.value = page; sliceData(); }
function handleSizeChange(current: number, size: number) { pageSize.value = size; currentPage.value = 1; sliceData(); }
function backTo() { router.go(-1); }

onMounted(() => { getData(); });
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2"><AButton type="link" @click="backTo">返回</AButton></div>
    <Card>
      <p class="mb-4">{{ companyAndProject }}，共有{{ batchCountSum }}个可分配资源</p>
      <div class="mb-4 flex items-center gap-4">
        <span>单个设备分配资源数：</span>
        <InputNumber v-model:value="form.count" :min="0" />
        <span>批次：</span>
        <Select v-model:value="form.productionBatch" :options="batchDict" placeholder="请选择批次" class="w-48" />
        <AButton type="primary" @click="allocation">分配适用</AButton>
        <span>资源立即启用：</span>
        <RadioGroup v-model:value="form.use"><RadioButton :value="true">是</RadioButton><RadioButton :value="false">否</RadioButton></RadioGroup>
      </div>
      <AButton type="primary" class="mb-4" @click="handleDownload">资源分配并执行下载工作</AButton>
      <Table :data-source="paginatedData" row-key="eid" :pagination="false">
        <TableColumn title="EID" data-index="eid" />
        <TableColumn title="预制种子号" data-index="iccid" />
        <TableColumn title="归属企业" data-index="companyName" />
        <TableColumn title="归属项目" data-index="projectName" />
        <TableColumn title="设备名称" data-index="name" />
        <TableColumn title="批次">
          <template #default="{ record }"><Select v-model:value="record.productionBatch" :options="batchDict" class="w-32" /></template>
        </TableColumn>
        <TableColumn title="分配资源数量">
          <template #default="{ record }"><InputNumber v-model:value="record.count" :min="0" /></template>
        </TableColumn>
        <TableColumn title="ICCID" data-index="iccidList" />
      </Table>
      <Pagination v-if="totalItems > 0" class="mt-4" :current="currentPage" :page-size="pageSize" :total="totalItems"
        :page-size-options="['10', '20', '30', '50']" show-quick-jumper show-size-changer
        @change="handlePageChange" @showSizeChange="handleSizeChange" />
    </Card>
  </Page>
</template>
