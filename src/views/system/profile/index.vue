<template>
  <div class="p-2">
    <div class="search">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="88px">
        <el-form-item v-for="(item, index) in queryFormItem" :key="index" :label="item.label" :prop="item.prop">
          <el-input v-if="item.type == 'input'" v-model="queryParams[item.prop]" :placeholder="item.placeholder"></el-input>
          <el-select v-if="item.type == 'select'" v-model="queryParams[item.prop]" :placeholder="item.placeholder" clearable>
            <el-option v-for="dict in item.dict" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleSync">同步数据</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" @click="handleAllocation">资源分配</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" @click="handleImport">批量导入</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="profileData">
        <el-table-column
          v-for="(item, index) in tableColumn"
          :key="index"
          :label="item.label"
          :width="item.width"
          :align="item.align"
          :prop="item.prop"
        >
          <template v-if="item.slot" #[item.slot]="scope">
            {{ scope[item.prop] }}
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 资源分配 -->
    <ResourceAllocation :dialog="allocationDialog" @close="closeAllocation" @submit="closeAllocation('update')" />
    <!-- 批量导入 -->
    <BatchImport :dialog="importDialog" @close="closeImport" @submit="closeImport('update')" />
  </div>
</template>

<script setup name="In" lang="ts">
import ResourceAllocation from './comp/ResourceAllocation.vue';
import BatchImport from './comp/BatchImport.vue';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_status } = toRefs<any>(proxy?.useDict('sys_device_status'));

const queryFormRef = ref();// 表单
const queryFormItem = reactive([
  { label: 'DP+来源', placeholder: '请输入', prop: 'dp', type: 'input' },
  { label: 'ICCID', placeholder: '请输入', prop: 'iccid', type: 'input' },
  { label: 'EID', placeholder: '请输入', prop: 'eid', type: 'input' },
  { label: 'state', placeholder: '请输入', prop: 'state', type: 'select', dict: sys_device_status },
  { label: '归属企业', placeholder: '请输入', prop: 'company', type: 'select', dict: sys_device_status },
  { label: '归属项目', placeholder: '请输入', prop: 'project', type: 'select', dict: sys_device_status },
  { label: '分配状态', placeholder: '请输入', prop: 'status', type: 'select', dict: sys_device_status },
  { label: '下号状态', placeholder: '请输入', prop: 'online', type: 'select',  dict: sys_device_status },
]);// 表单配置
const queryParams = reactive<{ [key: string]: any }>({
  pageNum: 1,
        pageSize: 10,
        dp: undefined,
        iccid: undefined,
        eid: undefined,
        state: undefined,
        company: undefined,
        project: undefined,
        status: undefined,
        online: undefined,
});// 查询参数
const loading = ref(true);//  加载状态
const profileData = reactive([]);// 表格数据
const tableColumn = reactive([
  { label: 'DP+来源', width: '200', align:"center", prop:"dp" },
  { label: 'iccid', width: '200', align:"center", prop:"iccid" },
  { label: 'imsi', width: '200', align:"center", prop:"imsi" },
  { label: 'isdp aid', width: '200', align:"center", prop:"isdp aid" },
  { label: 'eid', width: '200', align:"center", prop:"eid" },
  { label: 'nickName', width: '200', align:"center", prop:"nickName" },
  { label: 'ProfileClass', width: '200', align:"center", prop:"ProfileClass" },
  { label: 'profileType', width: '200', align:"center", prop:"profileType" },
  { label: 'providerName', width: '200', align:"center", prop:"providerName" },
  { label: 'state', width: '200', align:"center", prop:"state" },
  { label: '下载次数', width: '200', align:"center", prop:"downloadTimes" },
  { label: '确认码错误输入次数', width: '200', align:"center", prop:"codeErrorTimes" },
  { label: '下载错误尝试次数', width: '200', align:"center", prop:"downloadErrorTimes" },
  { label: 'createDate', width: '200', align:"center", prop:"createDate" },
  { label: 'upDate', width: '200', align:"center", prop:"upDate" },
  { label: '运营商', width: '200', align:"center", prop:"operator" },
  { label: '批次', width: '200', align:"center", prop:"batch" },
  { label: '分配状态', width: '200', align:"center", prop:"allocationStatus", slot: 'allocationStatus' },
  { label: '归属企业', width: '200', align:"center", prop:"company" },
  { label: '归属项目', width: '200', align:"center", prop:"project" },
  { label: '下号状态', width: '200', align:"center", prop:"online", slot: 'online' },
]);// 表格配置
const total = ref(0);// 分页控制
const allocationDialog = reactive<DialogOption>({
  title: '资源分配',
  visible: false
});// 资源分配弹窗控制
const importDialog = reactive<DialogOption>({
  title: '批量导入',
  visible: false
});// 资源分配弹窗控制


/** 查询设备列表 */
const getList = async () => {
  loading.value = true;
  // const res = await deviceList(queryParams.value);
  // taskData.value = res.rows;
  // total.value = res.total;
  loading.value = false;
};

/** 同步数据 */
const handleSync = () => {
  //  TODO
};
/** 资源分配 */
const handleAllocation = () => {
  allocationDialog.visible = true;
};
/** 批量导入 */
const handleImport = () => {
  importDialog.visible = true;
};
/** 资源分配弹窗关闭 */
const closeAllocation = (type: string) => {
  allocationDialog.visible = false;
  if (type) {
    getList();
  }
};
/** 资源分配弹窗关闭 */
const closeImport = (type: string) => {
  importDialog.visible = false;
  if (type) {
    getList();
  }
};

onMounted(() => {
  getList();
});
</script>
