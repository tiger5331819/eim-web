<template>
  <el-card shadow="hover">
    <template #header>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" icon="Refresh" @click="getList" class="mr-4">同步数据</el-button>
        </el-col>
      </el-row>
    </template>
    <el-table :data="tableData" v-loading="loading" stripe style="width: 100%;" max-height="500" :row-style="{ height: '55px' }">
      <el-table-column label="创建时间" align="center" prop="creationTime" width="300px" show-overflow-tooltip />
      <el-table-column label="动作" align="center" prop="name" width="200px" max-height="250" show-overflow-tooltip />
      <el-table-column label="描述" align="center" prop="message" show-overflow-tooltip />
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </el-card>
</template>
<script setup name="In" lang="ts">
import { ref } from "vue"
import { operationLog } from "@/api/system/device/index"

// const logData = ref<any>([]);
const loading = ref(true);
const total = ref(0);

// const currentPage = ref(1);
// const pageSize = ref(10);
// const totalItems = ref(0);
// const paginatedData = ref([]);
const tableData = ref([])
const eid = ref<any>('')
const queryParams = ref({
  eid: <any>undefined,
  pageNum: 1,
  pageSize: 10,
  isAsc: undefined,
  orderByColumn: undefined,
  params: {
  }
})

// 分页备用
// const handleCurrentChange = (newPage: any) => {
//   currentPage.value = newPage;
//   const start = (currentPage.value - 1) * pageSize.value;
//   const end = start + pageSize.value;
//   paginatedData.value = tableData.value.slice(start, end);
// };
// const handleSizeChange = (newSize: any) => {
//   pageSize.value = newSize;
//   const start = (currentPage.value - 1) * pageSize.value;
//   const end = start + pageSize.value;
//   paginatedData.value = tableData.value.slice(start, end);
// };

/** 查询运营信息列表 */
const getList = async () => {
  loading.value = true;
  eid.value = localStorage.getItem('eid')
  const res = await operationLog(eid.value, queryParams.value).finally(()=>{
    loading.value = false;
  });
  tableData.value = res.rows;
  total.value = res.total;
  // handleCurrentChange(currentPage)
  
}

onMounted(() => {
  getList();
})
</script>
