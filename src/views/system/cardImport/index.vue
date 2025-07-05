<template>
  <div class="p-2">
    <div class="search">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="88px">
        <el-row>
          <el-col :span="18">
            <el-form-item v-for="(item, index) in queryFormItem.slice(0, 3)" :key="index" :label="item.label" :prop="item.prop">
              <el-input v-if="item.type == 'input'" v-model="queryParams[item.prop]" :placeholder="item.placeholder"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              <el-button v-if="!showExtra" link icon="ArrowDown" @click="showExtra = true">展开</el-button>
              <el-button v-else link icon="ArrowUp" @click="showExtra = false">收起</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="showExtra">
          <el-form-item v-for="(item, index) in queryFormItem.slice(3)" :key="index" :label="item.label" :prop="item.prop">
            <el-input v-if="item.type == 'input'" v-model="queryParams[item.prop]" :placeholder="item.placeholder"></el-input>
            <el-select
              v-if="item.type == 'select'"
              v-model="queryParams[item.prop]"
              :placeholder="item.placeholder"
              clearable
              :disabled="item.prop == 'projectId' && !queryParams.companyId"
              @change="selectChange(item.prop)"
            >
              <el-option v-for="dict in item.dict" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
            <el-date-picker
              v-if="item.type == 'date'"
              v-model="queryParams.dateRange"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
        </el-row>
      </el-form>
    </div>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleAllocation">卡数分配</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" @click="handleUpdate">批量导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button class="mr-2" type="default" @click="handleDownload">下载批量导入模板</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="cardData">
        <el-table-column
          v-for="(item, index) in tableColumn"
          :key="index"
          :label="item.label"
          :width="item.width"
          :align="item.align"
          :prop="item.prop"
        >
          <!-- 插槽预留 -->
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 卡数分配 -->
    <AllocationCard :dialog="allocationDialog" @close="close('allocation')" @submit="close('allocation', true)" />
    <!-- 批量导入 -->
    <BatchImport :dialog="importDialog" @close="close('import')" @submit="close('import', true)" />
  </div>
</template>

<script setup name="cardImport" lang="ts">
import { cardImportList } from '@/api/system/cardImport';
import { CardImportTable } from '@/api/system/cardImport/types';
import { getproviderDict, getCardProviderDict,getCompanyDict, getProjectDict } from './hooks/useGetDict';
import AllocationCard from './comp/AllocationCard.vue';
import BatchImport from './comp/BatchImport.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_allocate_status } = toRefs<any>(proxy?.useDict('sys_allocate_status'));

// 字典
const providerDict = ref();
const companyDict = ref();
const projectDict = ref();

// 搜索
const queryParams = reactive<{ [key: string]: any }>({
  pageNum: 1,
  pageSize: 10,
  eid: undefined,
  iccid: undefined,
  eimFqdn: undefined,
  cardProviderName: undefined,
  projectId: undefined,
  tenantId: undefined,
  operator: undefined,
  dateRange: undefined,
  startCreationTime: undefined,
  endCreationTime: undefined
});
const queryFormRef = ref();
const showExtra = ref(false);
const queryFormItem = reactive<any>([
  { label: 'EID', placeholder: '请输入', prop: 'eid', type: 'input' },
  { label: '预制种子号', placeholder: '请输入', prop: 'iccid', type: 'input' },
  { label: '预制EIM', placeholder: '请输入', prop: 'eimFqdn', type: 'input' },
  { label: '制卡商', placeholder: '请选择', prop: 'cardProviderName', type: 'select', dict: providerDict },
  { label: '所属项目', placeholder: '请选择', prop: 'projectName', type: 'input' },
  { label: '所属租户', placeholder: '请选择', prop: 'tenantName', type: 'input' },
  { label: '操作人', placeholder: '请选择', prop: 'operator', type: 'input' },
  { label: '入库时间', placeholder: '请选择', prop: 'dateRange', type: 'date' },
]);

// 表格
const loading = ref(true);
const total = ref(0);
const cardData = ref<CardImportTable[]>([]);
const tableColumn = reactive([
  { label: 'EID', width: '', align: 'center', prop: 'eid' },
  { label: '预制种子号ICCID', width: '', align: 'center', prop: 'iccid' },
  { label: '预制EIM', width: '', align: 'center', prop: 'eimFqdn' },
  { label: '制卡商', width: '', align: 'center', prop: 'cardProviderName' },
  { label: '运营商', width: '', align: 'center', prop: 'providerName' },
  { label: '生产批次', width: '', align: 'center', prop: 'productionBatch' },
  { label: '所属项目', width: '', align: 'center', prop: 'projectName' },
  { label: '所属租户', width: '', align: 'center', prop: 'companyName' },
  { label: '操作人', width: '', align: 'center', prop: 'operator' },
  { label: '入库时间', width: '', align: 'center', prop: 'creationTime' },
]);

// 弹窗
const allocationDialog = reactive<DialogOption>({
  title: '卡数分配',
  visible: false
});
const importDialog = reactive<DialogOption>({
  title: '批量导入',
  visible: false
});


/** 更新字典 */
const updateDict = async () => {
 // providerDict.value = await getproviderDict();
 providerDict.value = await getCardProviderDict();
  // companyDict.value = await getCompanyDict();
};

/** 归属企业变化影响归属项目 */
const selectChange = async (type: string) => {
  if (type == 'companyId' && queryParams.companyId) {
    projectDict.value = await getProjectDict(queryParams.companyId);
  }
}

/** 查询卡信息列表 */
const getList = async () => {
  loading.value = true;
  const params = JSON.parse(JSON.stringify(queryParams))
  if (Array.isArray(params.dateRange)) {
    params.startCreationTime = toISOStringFormat(params.dateRange[0]);
    params.endCreationTime = toISOStringFormat(params.dateRange[1], false);
    delete params.dateRange;
  }
  const res = await cardImportList(params);
  cardData.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 卡数分配 */
const handleAllocation = () => {
  allocationDialog.visible = true;
};

/** 批量导入 */
const handleUpdate = () => {
  importDialog.visible = true;
};

/** 下载模板 */
const handleDownload = async () => {
  proxy?.download('/manager/seed/importTemplate', {}, `卡信息管理批量导入模板.xlsx`);
};

/** 弹窗关闭 */
const close = (type: string, edit?: boolean) => {
  if (type == 'allocation') { allocationDialog.visible = false; }
  if (type == 'import') { importDialog.visible = false; }
  if (edit) { getList(); }
};

/** 时间格式化 */
const toISOStringFormat = (dateInput: Date, isStart = true) => {
  if (!dateInput) return;
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  const pad = (n: number) => n < 10 ? '0' + n : n;
  if (isStart) {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${date.getMilliseconds()}`;
};

onMounted(() => {
  updateDict();
  getList();
});
</script>
