<template>
  <el-card shadow="hover">
    <template #header>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" icon="Plus" @click="handleUpdate">新增EIM</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"
          :search="false"></right-toolbar>
      </el-row>
    </template>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column label="EIMId" align="center" prop="eimId" />
      <el-table-column label="EIM地址" align="center" prop="eimAddress" />
      <el-table-column label="EIMIdType" align="center" prop="eimIdType" />
      <el-table-column label="eimSupportedProtocol" align="center" prop="eimSupportedProtocol" />
      <el-table-column label="euiccCiPKId" align="center" prop="euiccCiPKId" />
      <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="更新" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- <el-pagination class="mt-6" v-show="totalItems" layout="total, sizes, prev, pager, next, jumper"
      v-model:page="currentPage" v-model:limit="pageSize" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 50]"
      :page-size="pageSize" :total="totalItems">
    </el-pagination> -->
  </el-card>
</template>
<script setup name="In" lang="ts">
import { ref } from "vue"

// const tableData = ref([])
const tableData = ref([
  {
    eimId: 1
  }
])

const showSearch = ref(true)

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `用户编号`, visible: false, children: [] },
  { key: 1, label: `账号`, visible: true, children: [] },
  { key: 2, label: `姓名`, visible: true, children: [] },
  { key: 3, label: `手机号码`, visible: true, children: [] },
  { key: 4, label: `状态`, visible: true, children: [] },
  { key: 5, label: `创建时间`, visible: true, children: [] },
  // { key: 6, label: `部门`, visible: false, children: [] },
])

</script>