<template>
  <div class="p-5">
    <el-card shadow="hover">
      <template #header>
        <div>
          <el-button link type="primary" icon="Back" @click="backTo">返回</el-button>
        </div>
      </template>

      <span class="m-2">{{ companyAndProject }}，共有{{ batchCountSum }}个可分配资源</span>

      <el-form :model="form" :inline="true" ref="deviceFormRef" label-width="180px" style="margin-top: 20px;">
        <el-form-item label="单个设备分配资源数：" prop="count">
          <el-input v-model="form.count" placeholder="0" />
        </el-form-item>

        <el-form-item label="批次：" prop="productionBatch">
          <el-select v-model="form.productionBatch" @change="setBatch">
            <el-option v-for="dict in batchDict" :key="dict.value" :label="dict.value" :value="dict.value">{{
              dict.label }}</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="">
          <el-button type="primary" @click="allocation">分配适用</el-button>
        </el-form-item>

        <el-form-item label="资源立即启用：" prop="use">
          <el-radio-group v-model="form.use">
            <el-radio v-for="dict in useDict" :key="dict.value" :label="dict.value">{{
              dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <el-card shadow="hover">
        <template #header>
          <el-button type="primary" @click="handleDownload">资源分配并执行下载工作</el-button>
        </template>
        <el-table ref="deviceTable" v-loading="loading" :data="tableData">
          <el-table-column label="EID" align="center" prop="eid" />
          <el-table-column label="预制种子号" align="center" prop="iccid" />
          <el-table-column label="归属企业" align="center" prop="companyName" />
          <el-table-column label="归属项目" align="center" prop="projectName" />
          <el-table-column label="设备名称" align="center" prop="name" />
          <el-table-column label="批次" align="center" prop="productionBatch">
            <template #default="scope">
              <el-select v-model="scope.row.productionBatch">
                <el-option v-for="dict in batchDict" :key="dict.value" :label="dict.value" :value="dict.value">{{
              dict.label }}</el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="分配资源数量" align="center" prop="count">
            <template #default="scope">
              <el-input-number v-model="scope.row.count" placeholder="0" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="ICCID" align="center" prop="iccidList" />
        </el-table>

        <el-pagination
          class="mt-6"
          v-show="totalItems"
          layout="total, sizes, prev, pager, next, jumper"
          v-model:page="currentPage"
          v-model:limit="pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          :total="totalItems"
        >
        </el-pagination>
      </el-card>
    </el-card>
  </div>
</template>

<script setup name="In" lang="ts">
import { batchListByProjectId, countByBatchId, batchAllocationAndDownload } from "@/api/system/device";
import { AllocationAndDownload } from "@/api/system/device/types";
import useTagsViewStore from "@/store/modules/tagsView";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const store = useTagsViewStore()

//  表单配置
const form = ref({
  count: 0,
  productionBatch: undefined,
  use: false,
});
const useDict = reactive([
  { value: true, label: '是' },
  { value: false, label: '否' },
]);
const batchDict = ref();
const batchCountSum = ref(0);
const batchList = ref();
const companyAndProject = ref();
const countMax = ref();

//  表格分页
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const paginatedData = ref([]);
const tableData = ref([]);
const loading = ref(false)

const handleCurrentChange = (newPage: any) => {
  currentPage.value = newPage;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
};

const handleSizeChange = (newSize: any) => {
  pageSize.value = newSize;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
};

//  获取数据
const getData = async () => {
  //  从storage内获取批量下载列表
  const _data = JSON.parse(localStorage.getItem('downloadList') || '');
  tableData.value = _data;
  //  由于企业和项目一样，id取第一个
  const _pId = _data[0].projectId || '';
  //  设置顶部tips内容
  companyAndProject.value = `当前企业${_data[0].companyName}的项目${_data[0].projectName}`
  //  数据分页
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
  //  获取批次
  const _dict = await batchListByProjectId(_pId);
  //  批次保存后续操作
  batchList.value = _dict.data;
  //  设置批次字典
  batchDict.value = _dict.data.map((item: {[key: string]: any}) => {
    batchCountSum.value += item.canBeInstalledCount;
    return {
      label: item.productionBatch,
      value: item.productionBatch
    }
  });
};

//  设置全部批次
const setBatch = async (val: string) => {
  const res = await countByBatchId(val);
  countMax.value = res.data;
};

//  分配适用
const allocation = () => {
  tableData.value.map((item: { [key: string]: any }) => {
    item.productionBatch = form.value.productionBatch;
    item.count = form.value.count;
    return item;
  });
};

//  分配资源并下载
const handleDownload = async () => {
  const _data = {
    use: form.value.use,
    deviceList: tableData.value.map((item: { [key: string]: any }) => {
      const _item = {
        eid: item.eid,
        productionBatch: item.productionBatch,
        projectId: item.projectId,
        count: item.count
      }
      return _item;
    })
  } as AllocationAndDownload
  const res = await batchAllocationAndDownload(_data);
  if (res.code == 200) {
    proxy?.$modal.msgSuccess("操作成功");
    router.push({
    path: "/task"
  });
  } else {
    proxy?.$modal.msgError("操作失败");
  }
};

const backTo = () => {
  store.delVisitedView(router.currentRoute.value);
  router.go(-1);
};

onMounted(() => {
  getData();
});
</script>
