<template>
  <el-card shadow="hover">
    <el-table :data="paginatedData" stripe style="width: 100%">
      <el-table-column label="创建时间" align="center" prop="eid" width="300px" />
      <el-table-column label="动作" align="center" prop="iccid" width="200px" />
      <el-table-column label="描述" align="center" prop="eimFqdn" />
    </el-table>
    <el-pagination class="mt-6" v-show="totalItems" layout="total, sizes, prev, pager, next, jumper"
      v-model:page="currentPage" v-model:limit="pageSize" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 50]"
      :page-size="pageSize" :total="totalItems">
    </el-pagination>
  </el-card>
</template>
<script setup name="In" lang="ts">
import { ref } from "vue"
// 实现分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const paginatedData = ref([]);
const tableData = ref([])
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
</script>