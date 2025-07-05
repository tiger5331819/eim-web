<template>
  <div class="p-2">
    <div class="search">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="88px">
        <el-row>
          <el-col :span="18">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleUpdate('添加')">添加</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="companyData">
        <el-table-column
          v-for="(item, index) in tableColumn"
          :key="index"
          :label="item.label"
          :width="item.width"
          :align="item.align"
          :prop="item.prop"
        >
          <template v-if="item.slot === 'time'" #default="scope">
            <span>{{ scope.row.startTime + ' ~ ' + scope.row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="center" label="操作">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate('编辑', scope.row)" v-hasPermi="['system:dept:edit']">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <Update :dialog="updateDialog" :detail="detailRow" @close="close('project')" @submit="close('project', true)" />
  </div>
</template>

<script setup name="company" lang="ts">
import { CompanyTable } from "@/api/system/company/types";
import { companyList, handledeleteProject } from '@/api/system/company';
import Update from './comp/CreatProject.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance


const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined
});
const queryFormRef = ref();

//  表格
const loading = ref(true);
const total = ref(0);
const companyData = ref<CompanyTable[]>([]);
const tableColumn = reactive([
  { label: '项目编号', width: '', align: 'center', prop: 'code' },
  { label: '项目名称', width: '', align: 'center', prop: 'name' },
  { label: '设备数量', width: '', align: 'center', prop: 'deviceCount' },
  { label: '有效期', width: '300', align: 'center', prop: 'time', slot: 'time' },
  { label: '所属租户', width: '', align: 'center', prop: 'companyName' },
  { label: '备注', width: '', align: 'center', prop: 'remark' },
  { label: '创建人', width: '', align: 'center', prop: 'creationBy' },
  { label: '创建时间', width: '', align: 'center', prop: 'creationTime' },
]);

//  弹窗
const updateDialog = reactive<DialogOption>({
  title: '添加',
  visible: false
});
const detailRow = ref<CompanyTable>();//  当前项目信息

/** 获取列表 */
const getList = async() => {
  loading.value = true;
  const res = await companyList();
  companyData.value = res.rows;
  total.value = res.total || 0;
  loading.value = false;
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

/** 新增项目 */
const handleUpdate = (title?: string, row?: CompanyTable) => {
    detailRow.value = row;
    updateDialog.title = title;
    updateDialog.visible = true;
};

/** 弹窗关闭 */
const close = (type: string, edit?: boolean) => {
  if (type == 'project') { updateDialog.visible = false; }
  if (edit) { getList(); }
};

/** 删除企业/项目 */
const handleDelete = async(row: CompanyTable) => {
  await proxy?.$modal.confirm('不可恢复，确认删除吗？');
  await handledeleteProject(row.companyId, row.id)
  .then((res) => {
    console.log(res);
  })
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
};

onMounted(() => {
  getList();
});
</script>
