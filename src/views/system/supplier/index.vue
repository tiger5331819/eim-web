<template>
  <div class="p-2">
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleAdd('新增')">新增</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="supplierData">
        <el-table-column label="DP+来源" align="center" prop="dpSource" />
        <el-table-column label="ID" align="center" prop="accountId" />
        <el-table-column label="password" align="center" prop="accountPassword" />
        <el-table-column label="资源数量" align="center" prop="profileCount" />
        <el-table-column label="创建时间" sortable align="center" prop="createTime">
          <template #default="scope">
            {{ parseTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="center" label="操作">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleAdd('编辑', scope.row)" v-hasPermi="['system:dept:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <AddSupplier :dialog="addSupplier" :detail="detail" @close="close" @submit="close('update')" />
  </div>
</template>

<script setup name="supplier" lang="ts">
import { supplierList, handledelete } from '@/api/system/supplier';
import { SupplierTable } from '@/api/system/supplier/types';
import AddSupplier from './comp/AddSupplier.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const loading = ref(true);//  加载状态
const supplierData = ref([]);// 数据
const total = ref(0);
const queryParams = ref({
    pageNum: 1,
    pageSize: 10
});//  分页
const addSupplier = reactive<DialogOption>({
  title: '新增',
  visible: false
});// 弹窗控制
const detail = ref<SupplierTable>();// 编辑用详情

const getList = async () => {
  loading.value = true;
  const res = await supplierList(queryParams.value);
  supplierData.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 新增/编辑 */
const handleAdd = (title: string, row?: SupplierTable) => {
  addSupplier.title = title;
  addSupplier.visible = true;
  if (row) {
    detail.value = row;
  }
};

/** 删除 */
const handleDelete = async(row: SupplierTable) => {
  await proxy?.$modal.confirm('是否确认删除?');
  await handledelete(row.id);
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
};

/** 弹窗关闭 */
const close = (type: string) => {
  addSupplier.visible = false;
  if (type) {
    getList();
  }
};

onMounted(() => {
  getList();
});
</script>
