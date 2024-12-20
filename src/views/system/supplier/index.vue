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
        <el-table-column label="DP+来源" align="center" prop="eid" />
        <el-table-column label="ID" align="center" prop="iccid" />
        <el-table-column label="password" align="center" prop="eimFqdn" />
        <el-table-column label="资源数量" align="center" prop="cardProviderName" />
        <el-table-column label="创建时间" sortable align="center" prop="creationTime" />
        <el-table-column fixed="right" align="center" label="操作">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleAdd('编辑', scope.row)" v-hasPermi="['system:dept:edit']" />
            </el-tooltip>
            <el-tooltip v-if="scope.row.children && scope.row.children.length == 0" content="删除" placement="top">
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
import { ref, reactive } from 'vue';
import { cardList } from '@/api/system/cardImport';
import { supplierVO } from './types';
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
const detail = ref<supplierVO>();// 编辑用详情

const getList = async () => {
  loading.value = true;
  const res = await cardList(queryParams.value);
  supplierData.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 新增/编辑 */
const handleAdd = (title: string, row: any) => {
  addSupplier.title = title;
  addSupplier.visible = true;
  if (row) {
    detail.value = row;
  }
};

/** 删除 */
const handleDelete = async(row: supplierVO) => {
  await proxy?.$modal.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?');
  // await delDept(row.deptId);删除方法
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
