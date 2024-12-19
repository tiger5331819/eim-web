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

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="companyData"
        row-key="deptId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpandAll"
      >
        <el-table-column prop="deptName" label="企业管理"></el-table-column>
        <el-table-column prop="createTime" label="有效时间">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="资源数量"></el-table-column>
        <el-table-column prop="orderNum" label="设备数量"></el-table-column>
        <el-table-column prop="deptName" label="备注"></el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="center" label="操作">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']" />
            </el-tooltip>
            <el-tooltip v-if="scope.row.children" content="创建项目" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleCreat('创建项目', scope.row)" v-hasPermi="['system:dept:add']" />
            </el-tooltip>
            <el-tooltip v-if="scope.row.children && scope.row.children.length == 0" content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <AddCompany :dialog="addCompany" :detail="detailRow" @close="closeAddCompany" @submit="closeAddCompany('update')" />
    <CreatProject :dialog="creatProject" :parent="parentRow" @close="closeCreat" @submit="closeCreat('update')" />
  </div>
</template>

<script setup name="company" lang="ts">
import { ref } from 'vue';
// import { CompanyVO } from './types';后续得到真实接口重新写type与column属性
import { DeptVO } from "@/api/system/dept/types";
import { listDept } from '@/api/system/dept';
import AddCompany from './comp/AddCompany.vue';
import CreatProject from './comp/CreatProject.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const tableRef = ref();// 表格
const loading = ref(true);//  加载状态
const companyData = ref<DeptVO[]>([]);//  表格数据
const isExpandAll = ref(true);//  是否全部展开
const addCompany = reactive<DialogOption>({
  title: '新增',
  visible: false
});// 新增企业弹窗
const creatProject = reactive<DialogOption>({
  title: '创建项目',
  visible: false
});// 新增项目弹窗
const detailRow = ref<DeptVO>();//  当前企业信息
const parentRow = ref<DeptVO>();//  传递父级信息

/** 获取列表 */
const getList = async() => {
  loading.value = true;
  const res = await listDept();
  const data = proxy?.handleTree<DeptVO>(res.data, "deptId")
  if (data) {
    companyData.value = data
  }
  loading.value = false
};
/** 新增企业 */
const handleAdd = (title?: string, row?: DeptVO) => {
  addCompany.title = title;
  addCompany.visible = true;
  if (row) {
    detailRow.value = row;
  }
};
/** 新增企业弹窗关闭 */
const closeAddCompany = (type: string) => {
  addCompany.visible = false;
  if (type) {
    getList();
  }
};
/** 更新企业/项目 */
const handleUpdate = (row: DeptVO) => {
    if (row.children) {
      //  存在子级，编辑企业
      handleAdd('编辑', row);
    } else {
      //  编辑项目
      handleCreat('编辑项目', row);
    }
};
/** 新增项目 */
const handleCreat = (title?: string, row?: DeptVO) => {
    parentRow.value = row;
    creatProject.title = title;
    creatProject.visible = true;
};
/** 新增项目弹窗关闭 */
const closeCreat = (type: string) => {
  creatProject.visible = false;
  if (type) {
    getList();
  }
}
/** 删除企业/项目 */
const handleDelete = async(row: DeptVO) => {
  await proxy?.$modal.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?');
  // await delDept(row.deptId);删除方法
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
};

onMounted(() => {
  getList();
});
</script>
