<template>
  <el-card shadow="hover">
    <el-table :data="paginatedData" stripe border style="width: 100%">
      <el-table-column label="EID" align="center" prop="eid" />
      <el-table-column label="预制种子号ICCID" align="center" prop="iccid" />
      <el-table-column label="预制EIM" align="center" prop="eimFqdn" />
      <el-table-column label="制卡商" align="center" prop="cardProviderName" />
      <el-table-column label="运营商" align="center" prop="providerName" />
      <el-table-column label="数据校验" align="center" prop="result" />
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