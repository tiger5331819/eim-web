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
              <el-button v-if="!showExtra" type="text" icon="ArrowDown" @click="showExtra = true">展开</el-button>
              <el-button v-else type="text" icon="ArrowUp" @click="showExtra = false">收起</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="showExtra">
          <el-form-item v-for="(item, index) in queryFormItem.slice(3)" :key="index" :label="item.label" :prop="item.prop">
            <el-input v-if="item.type == 'input'" v-model="queryParams[item.prop]" :placeholder="item.placeholder"></el-input>
            <el-select
              :style="{'width': '192px'}"
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
        </el-row>
      </el-form>
    </div>

    <el-card shadow="hover">
      <template #header>
        <span v-if="!showSelect">
          <el-button type="primary" @click="handleSelect('eim')">替换EIM</el-button>
          <el-button type="primary" @click="handleSelect('download')">批量下载资源</el-button>
          <el-button type="primary" @click="open('import')">导入分配资源</el-button>
          <el-button @click="handleDownload">下载批量导入模板</el-button>
        </span>
        <span v-else>
          <el-button type="primary" @click="handleUpdate" :disabled="multiple">确认</el-button>
          <el-button type="primary" @click="cancelSelect">取消</el-button>
        </span>
      </template>
      <el-table
        ref="deviceTable"
        v-loading="loading"
        :data="deviceData"
        @selection-change="handleSelectionChange"
        :style="{ '--type': selectType }"
        :header-row-style="{ textAlign: 'center', height: '50px' }"
        :row-key="getRowKey"
      >
        <el-table-column type="selection" width="50" align="center" v-if="showSelect" :selectable="selectAble" :reserve-selection="true" />
        <el-table-column
          v-for="(item, index) in tableColumn"
          :key="index"
          :label="item.label"
          :width="item.width"
          :align="item.align"
          :prop="item.prop"
        >
          <template v-if="item.slot == 'online'" #default="scope">
            <dict-tag :options="sys_device_status" :value="scope.row.online" />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="详细" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"> </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 导入分配资源 -->
    <BatchImport :dialog="importDialog" @close="close('import')" @submit="close('import', true)" />
    <!-- 替换eim -->
    <ChangeEim :dialog="eimDialog" :eidList="eidList" @close="close('eim')" @submit="close('eim', true)" />
  </div>
</template>

<script setup name="device" lang="ts">
import { deviceList } from '@/api/system/device';
import { DeviceTable } from '@/api/system/device/types';
import BatchImport from './comp/BatchImport.vue';
import ChangeEim from './comp/ChangeEim.vue';
import router from '@/router';
import { getCompanyDict, getProjectDict } from '../cardImport/hooks/useGetDict';

//  字典
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_status } = toRefs<any>(proxy?.useDict('sys_device_status'));
const companyDict = ref();
const projectDict = ref();

//  搜索
const queryFormRef = ref();
const showExtra = ref(false);
const queryParams = reactive<{ [key: string]: any }>({
  pageNum: 1,
  pageSize: 10,
  eid: undefined,
  iccid: undefined,
  online: undefined,
  eimFqdn: undefined,
  companyId: undefined,
  projectId: undefined
});
const queryFormItem = reactive([
  { label: 'EID', placeholder: '请输入', prop: 'eid', type: 'input' },
  { label: '预制种子号', placeholder: '请输入', prop: 'iccid', type: 'input' },
  { label: 'EIMId', placeholder: '请输入', prop: 'eimFqdn', type: 'input' },
  { label: '在线状态', placeholder: '请选择', prop: 'online', type: 'select', dict: sys_device_status },
  { label: '设备名称', placeholder: '请输入', prop: 'name', type: 'input' },
  { label: '所属项目', placeholder: '请选择', prop: 'projectName', type: 'input' },
  { label: '所属租户', placeholder: '请选择', prop: 'tenantName', type: 'input' },
]);

//  表格按钮组
const showSelect = ref(false);
const multiple = ref(true);
const selectType = ref();
const selectValue = ref();
const selectArray = ref();

//  表格数据
const loading = ref(true);
const total = ref(0);
const deviceTable = ref();
const deviceData = ref();
const tableColumn = reactive([
  { label: 'EID', width: '', align: 'center', prop: 'eid' },
  { label: '预制种子号', width: '', align: 'center', prop: 'iccid' },
  { label: '归属企业', width: '', align: 'center', prop: 'companyName' },
  { label: '归属项目', width: '', align: 'center', prop: 'projectName' },
  { label: '设备名称', width: '', align: 'center', prop: 'name' },
  { label: '业务号', width: '', align: 'center', prop: 'profileCount' },
  { label: '在线状态', width: '', align: 'center', prop: 'online', slot: 'online' },
  { label: 'EIMId', width: '', align: 'center', prop: 'eimFqdn' },
  { label: '所属项目', width: '', align: 'center', prop: 'projectName' },
  { label: '所属租户', width: '', align: 'center', prop: 'companyName' },
  // { label: '创建时间', width: '', align: 'center', prop: 'creationTime' },
]);

//  弹窗
const importDialog = reactive<DialogOption>({
  title: '批量导入',
  visible: false
});
const eimDialog = reactive<DialogOption>({
  title: '替换EIM',
  visible: false
});
const eidList = ref();

/** 更新字典 */
const updateDict = async () => {
  companyDict.value = await getCompanyDict();
};

/** 归属企业变化影响归属项目 */
const selectChange = async (type: string) => {
  if (type == 'companyId' && queryParams.companyId) {
    projectDict.value = await getProjectDict(queryParams.companyId);
  }
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

/** 多选：eim-替换EIM、download-批量下载资源 */
const handleSelect = (type: string) => {
  showSelect.value = true;
  selectType.value = type;
};

/** 执行多选操作 */
const handleUpdate = () => {
  if (selectType.value == 'download') {
    //  选中添加缓存
    localStorage.removeItem('downloadList');
    localStorage.setItem('downloadList', JSON.stringify(selectArray.value));
    router.push({
      path: '/download',
    });
  } else if (selectType.value == 'eim') {
    eidList.value = selectArray.value.map((item: DeviceTable) => {
      return item.eid
    })
    eimDialog.visible = true;
  }
};

/** 取消多选 */
const cancelSelect = () => {
  selectType.value = '';
  selectValue.value = '';
  selectArray.value = [];
  showSelect.value = false;
  deviceTable.value.clearSelection();
};

/** 下载模板 */
const handleDownload = () => {
  proxy?.download('/manager/device/batch/profileDownload/importTemplate', {}, `设备列表批量导入模板.xlsx`);
};

/** 设置row-key */
const getRowKey = (row: DeviceTable) => {
  return row.id;
}

/** 选择条数时应限制同一企业及同一项目 */
const handleSelectionChange = (row: DeviceTable[]) => {
  selectValue.value = row[0];
  selectArray.value = row;
  multiple.value = !row.length;

};

/** 多选按钮控制 */
const selectAble = (row: DeviceTable) => {
  if (selectType.value == 'eim') {
    return true;
  } else if (selectType.value == 'download' && selectValue.value) {
    if (row.companyName == selectValue.value.companyName && row.projectName == selectValue.value.projectName) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

/** 查询卡信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await deviceList(queryParams);
  deviceData.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 查看详情 */
const handleView = (row?: any) => {
  // 添加缓存
  localStorage.removeItem('eid');
  localStorage.setItem('eid', row.eid);
  router.push({
    path: "/device_detail",
    query: {
      id: row.eid,
    },
  });
}

/** 打开弹窗 */
const open = (type: string) => {
  if (type == 'import') { importDialog.visible = true };
};

/** 关闭弹窗 */
const close = (type: string, edit?: boolean) => {
  if (type == 'import') { importDialog.visible = false };
  if (type == 'eim') { eimDialog.visible = false };
  if (edit) {
    getList();
  }
};

onMounted(() => {
  // updateDict();
  getList();
});
</script>
