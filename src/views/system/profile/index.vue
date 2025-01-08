<template>
  <div class="p-2">
    <div class="search">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="88px">
        <el-form-item v-for="(item, index) in queryFormItem" :key="index" :label="item.label" :prop="item.prop">
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
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleDataSync">同步数据</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" @click="open('allocation')">资源分配</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" @click="open('import')">批量导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button class="mr-2" type="default" @click="handleDownload">下载批量导入模板</el-button>
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
          <!-- 插槽预留 -->
          <!-- <template v-if="item.slot == 'assignedState'" #default="scope">
            <dict-tag :options="sys_allocate_status" :value="scope.row.assignedState" />
          </template>
          <template v-else-if="item.slot == 'installedState'" #default="scope">
            <dict-tag :options="sys_installed_status" :value="scope.row.installedState" />
          </template> -->
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 资源分配 -->
    <ResourceAllocation :dialog="allocationDialog" @close="close('allocation')" @submit="close('allocation', true)" />
    <!-- 批量导入 -->
    <BatchImport :dialog="importDialog" @close="close('import')" @submit="close('import', true)" />
  </div>
</template>

<script setup name="In" lang="ts">
import { profileList, handleSync } from '@/api/system/profile';
import { ProfileTable } from '@/api/system/profile/types';
import { getCompanyDict, getProjectDict } from '../cardImport/hooks/useGetDict';
import ResourceAllocation from './comp/ResourceAllocation.vue';
import BatchImport from './comp/BatchImport.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

//  字典
const { sys_allocate_status, sys_profile_state, sys_installed_status } = toRefs<any>(proxy?.useDict('sys_allocate_status', 'sys_profile_state', 'sys_installed_status'));
const companyDict = ref();
const projectDict = ref();

//  查询表单
const queryFormRef = ref();
const queryFormItem = reactive([
  { label: 'DP+来源', placeholder: '请输入', prop: 'dpSource', type: 'input' },
  { label: 'ICCID', placeholder: '请输入', prop: 'iccid', type: 'input' },
  { label: 'EID', placeholder: '请输入', prop: 'eid', type: 'input' },
  { label: 'state', placeholder: '请输入', prop: 'state', type: 'select', dict: sys_profile_state },
  { label: '归属企业', placeholder: '请输入', prop: 'companyId', type: 'select', dict: companyDict },
  { label: '归属项目', placeholder: '请输入', prop: 'projectId', type: 'select', dict: projectDict },
  { label: '分配状态', placeholder: '请输入', prop: 'assigned', type: 'select', dict: sys_allocate_status },
  { label: '下号状态', placeholder: '请输入', prop: 'installed', type: 'select',  dict: sys_installed_status },
]);
const queryParams = reactive<{ [key: string]: any }>({
  pageNum: 1,
  pageSize: 10,
  dpSource: undefined,
  iccid: undefined,
  eid: undefined,
  state: undefined,
  companyId: undefined,
  projectId: undefined,
  assigned: undefined,
  installed: undefined,
});

//  表格
const loading = ref(true);
const profileData = ref<ProfileTable>();
const tableColumn = reactive([
  { label: 'DP+来源', width: '200', align:"center", prop:"dpSource" },
  { label: 'iccid', width: '200', align:"center", prop:"iccid" },
  { label: 'imsi', width: '200', align:"center", prop:"imsi" },
  { label: 'isdp aid', width: '200', align:"center", prop:"isdpAid" },
  { label: 'eid', width: '200', align:"center", prop:"eid" },
  { label: 'nickName', width: '200', align:"center", prop:"nick" },
  { label: 'ProfileClass', width: '200', align:"center", prop:"ProfileClass" },
  { label: 'profileType', width: '200', align:"center", prop:"type" },
  { label: 'providerName', width: '200', align:"center", prop:"providerName" },
  { label: 'state', width: '200', align:"center", prop:"state" },
  { label: '下载次数', width: '200', align:"center", prop:"downloadTimes" },
  { label: '确认码错误输入次数', width: '200', align:"center", prop:"codeErrorTimes" },
  { label: '下载错误尝试次数', width: '200', align:"center", prop:"downloadErrorTimes" },
  { label: 'createDate', width: '200', align:"center", prop:"createTime" },
  { label: 'upDate', width: '200', align:"center", prop:"updateTime" },
  { label: '运营商', width: '200', align:"center", prop:"carrierName" },
  { label: '批次', width: '200', align:"center", prop:"productionBatch" },
  { label: '分配状态', width: '200', align:"center", prop:"assignedState" },
  { label: '归属企业', width: '200', align:"center", prop:"companyName" },
  { label: '归属项目', width: '200', align:"center", prop:"projectName" },
  { label: '下号状态', width: '200', align:"center", prop:"installedState" },
]);

//  分页
const total = ref(0);

//  弹窗
const allocationDialog = reactive<DialogOption>({
  title: '资源分配',
  visible: false
});
const importDialog = reactive<DialogOption>({
  title: '批量导入',
  visible: false
});

/** 更新字典 */
const updateDict = async () => {
  companyDict.value = await getCompanyDict();
};

/** 归属企业变化影响归属项目 */
const selectChange = async (type: string) => {
  if (type == 'companyId' && queryParams.companyId) {
    projectDict.value = await getProjectDict(queryParams.companyId);
  }
}

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


/** 查询设备列表 */
const getList = async () => {
  loading.value = true;
  const res = await profileList(queryParams);
  profileData.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 同步数据 */
const handleDataSync = async () => {
  loading.value = true;
  await handleSync();
  proxy?.$modal.msgSuccess("操作成功");
  handleQuery();
  loading.value = false;
};

/** 下载模板 */
const handleDownload = async () => {
  proxy?.download('/manager/profile/import/template', {}, `profile资源批量导入模板.xlsx`);
};

/** 打开弹窗 */
const open = (type: string) => {
  if (type == 'allocation') { allocationDialog.visible = true; };
  if (type == 'import') { importDialog.visible = true; };
};

/** 关闭弹窗 */
const close = (type: string, edit?: boolean) => {
  if (type == 'allocation') { allocationDialog.visible = false; };
  if (type == 'import') { importDialog.visible = false; };
  if (edit) { getList(); };
};

onMounted(() => {
  updateDict();
  getList();
});
</script>
