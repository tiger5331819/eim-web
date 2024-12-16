<template>
  <div style="display: flex; justify-content: space-around">
    <div style="flex: 1; margin-left: 30px">
      <el-form-item label="EID:">
        <span>{{ detailData.eid || '--' }}</span>
      </el-form-item>
      <el-form-item label="设备名称:">
        <el-input v-model="detailData.name" v-if="changeName" style="width: 220px" />
        <span v-else>{{ detailData.name || '--' }}</span>
        <el-button type="primary" size="small" style="margin-left: 20px" @click="editName"
          v-if="changeName">保存</el-button>
        <el-button type="primary" size="small" style="margin-left: 20px" @click="changeName = true"
          v-else>修改</el-button>
      </el-form-item>
      <el-form-item label="预制种子号:">
        <span>{{ detailData.iccid || '--' }}</span>
      </el-form-item>
      <el-form-item label="创建时间:">
        <span>{{ detailData.creationTime || '--' }}</span>
      </el-form-item>
    </div>
    <div style="flex: 1">
      <el-form-item label="EIM:">
        <span>{{ detailData.eid || '--' }}</span>
      </el-form-item>
      <el-form-item label="企业名称:">
        <el-input v-model="detailData.companyName" v-if="changeCompany" style="width: 220px" />
        <span v-else>{{ detailData.companyName || '--' }}</span>
        <el-button type="primary" size="small" style="margin-left: 20px" @click="editCompany"
          v-if="changeCompany">保存</el-button>
        <el-button type="primary" size="small" style="margin-left: 20px" @click="changeCompany = true"
          v-else>修改</el-button>
      </el-form-item>
      <el-form-item label="在线状态:">
        <template #default="">
          <dict-tag :options="sys_device_status" :value="detailData.online" />
        </template>
      </el-form-item>
      <el-form-item label="激活时间:">
        <span>{{ detailData.activationTime || '--' }}</span>
      </el-form-item>
    </div>
  </div>
  <el-card shadow="hover">
    <template #header>
      <el-row :gutter="10" class="mb8">
        <span class="mt-1 ml-4 mr-4">业务号信息</span>
        <el-col :span="1.5">
          <el-button type="primary" icon="Plus" @click="handleAdd" class="mr-4">下载业务号</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" icon="Refresh" @click="handleUpdate" class="mr-4">同步数据</el-button>
        </el-col>
      </el-row>
    </template>
    <el-table :data="paginatedData" v-loading="loading" stripe style="width: 100%">
      <el-table-column label="序号" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ (currentPage - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运营商" align="center" prop="issuer" />
      <el-table-column label="ICCID" align="center" prop="iccid" />
      <el-table-column label="状态" align="center" prop="state">
        <template #default="scope">
          <dict-tag :options="sys_profile_status" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip v-if="scope.row.state == '0'" content="启用业务号" placement="top">
            <el-switch v-model="scope.row.state" active-value="1" inactive-value="0" active-text="启用" inactive-text="停用"
              class="mr-8" :loading="switchLoading" :before-change="() => handleEnable(scope.row)"></el-switch>
          </el-tooltip>
          <el-tooltip v-else content="停用业务号" placement="top">
            <el-switch v-model="scope.row.state" active-value="1" inactive-value="0" active-text="启用" inactive-text="停用"
              class="mr-8" :loading="switchLoading" :before-change="() => handleDisable(scope.row)"></el-switch>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"> </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="totalItems > 0" :total="totalItems" v-model:page="currentPage" v-model:limit="pageSize"
      @pagination="getList" />
  </el-card>
</template>
<script setup name="In" lang="ts">
import { ref } from "vue"
import { deviceDetail, deviceName, companyName, toEnable, toDisable, toDelete, updateDetail } from "@/api/system/device/index";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_profile_status, sys_device_status } = toRefs<any>(proxy?.useDict('sys_profile_status', 'sys_device_status'));

const router = useRouter();
const detailData = ref<any>({})
const changeName = ref(false)
const changeCompany = ref(false)
const loading = ref(true);
const eid = ref<any>('')
const switchLoading = ref(false)

// 实现分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const paginatedData = ref<any>([]);
const tableData = ref<any>([])
const handleCurrentChange = (newPage: any) => {
  currentPage.value = newPage;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
};

// 分页备用
// const handleSizeChange = (newSize: any) => {
//   pageSize.value = newSize;
//   const start = (currentPage.value - 1) * pageSize.value;
//   const end = start + pageSize.value;
//   paginatedData.value = tableData.value.slice(start, end);
// };

/** 查询设备详细信息 */
const getList = async () => {
  eid.value = localStorage.getItem('eid')
  loading.value = true;
  const res = await deviceDetail(eid.value);
  detailData.value = res.data;
  tableData.value = res.data.profileList;
  totalItems.value = res.data.profileList.length;
  tableData.value.forEach((item:any) => {
    item.state = item.state.toString()
  })
  handleCurrentChange(currentPage.value)
  loading.value = false;
}

const editName = () => {
  deviceName(eid.value, { name: detailData.value.name }).then((res) => {
    if (res.code == 200) {
      proxy?.$modal.msgSuccess("修改成功");
    } else {
      proxy?.$modal.msgError("修改失败");
    }
  })
  changeName.value = false
}

const editCompany = () => {
  companyName(eid.value, { name: detailData.value.companyName }).then((res) => {
    if (res.code == 200) {
      proxy?.$modal.msgSuccess("修改成功");
    } else {
      proxy?.$modal.msgError("修改失败");
    }
  })
  changeCompany.value = false
}

/** 启用业务号  */
const handleEnable = async (row: any) => {
  switchLoading.value = true
  const res = await toEnable(eid.value, row.iccid)
  if (res.code == 200) {
    switchLoading.value = false
    proxy?.$modal.msgSuccess("操作成功");
    return true
  } else {
    switchLoading.value = false
    proxy?.$modal.msgError("操作失败");
    return false
  }
}

/** 停用业务号  */
const handleDisable = async (row: any) => {
  switchLoading.value = true
  const res = await toDisable(eid.value, row.iccid)
  if (res.code == 200) {
    switchLoading.value = false
    proxy?.$modal.msgSuccess("操作成功");
    return true
  } else {
    switchLoading.value = false
    proxy?.$modal.msgError("操作失败");
    return false
  }
}

/** 删除  */
const handleDelete = async (row: any) => {
  const res = await toDelete(eid.value, row.iccid)
  if (res.code == 200) {
    proxy?.$modal.msgSuccess("操作成功");
    getList();
  } else {
    proxy?.$modal.msgError("操作失败");
  }
}

/** 下载业务号  */
const handleAdd = (row?: any) => {
  router.push({
    path: "/device_add",
    query: {
      id: row.id,
    },
  });
}

/** 同步数据  */
const handleUpdate = async () => {
  eid.value = localStorage.getItem('eid')
  loading.value = true;
  const res = await updateDetail(eid.value)
  if (res.code == 200) {
    getList();
    proxy?.$modal.msgSuccess("操作成功");
    loading.value = false;
  } else {
    proxy?.$modal.msgError("操作失败");
    loading.value = false;
  }
}

onMounted(() => {
  getList();
})
</script>