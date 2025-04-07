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
        row-key="id"
        :tree-props="{ children: 'projcetList', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpandAll"
      >
        <el-table-column prop="name" label="企业管理"></el-table-column>
        <el-table-column label="有效时间">
          <template #default="scope">
            <span v-if="scope.row.startTime && scope.row.endTime">{{ parseTime(scope.row.startTime) + ' ~ ' + parseTime(scope.row.endTime) }}</span>
            <span></span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="profileCount" label="资源数量"></el-table-column> -->
        <el-table-column prop="deviceCount" label="设备数量"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column prop="creationTime" label="创建时间">
          <template #default="scope">
            <span>{{ parseTime(scope.row.creationTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="center" label="操作">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']" />
            </el-tooltip>
            <el-tooltip v-if="scope.row.projcetList" content="创建项目" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleCreat('创建项目', scope.row)" v-hasPermi="['system:dept:add']" />
            </el-tooltip>
            <el-tooltip v-if="scope.row.profileCount == 0 && scope.row.profileCount == 0" content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <AddCompany :dialog="addCompany" :detail="detailRow" @close="close('add')" @submit="close('add', true)" />
    <CreatProject :dialog="creatProject" :parent="parentRow" @close="close('creat')" @submit="close('creat', true)" />
  </div>
</template>

<script setup name="company" lang="ts">
import { CompanyTable } from "@/api/system/company/types";
import { companyList, handledeleteCompany, handledeleteProject } from '@/api/system/company';
import AddCompany from './comp/AddCompany.vue';
import CreatProject from './comp/CreatProject.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance

//  表格
const tableRef = ref();
const loading = ref(true);
const companyData = ref<CompanyTable[]>([]);
const isExpandAll = ref(true);

//  弹窗
const addCompany = reactive<DialogOption>({
  title: '新增',
  visible: false
});
const creatProject = reactive<DialogOption>({
  title: '创建项目',
  visible: false
});
const detailRow = ref<CompanyTable>();//  当前企业信息
const parentRow = ref<CompanyTable>();//  传递父级信息

/** 获取列表 */
const getList = async() => {
  loading.value = true;
  const res = await companyList();
  companyData.value = res.data.map((item: CompanyTable) => {
    if (item.projcetList && item.projcetList.length > 0) {
      item.projcetList = item.projcetList.map((child: CompanyTable) => {
        delete child.projcetList;
        return child
      });
    }
    return item;
  });
  loading.value = false
};

/** 新增企业 */
const handleAdd = (title?: string, row?: CompanyTable) => {
  addCompany.title = title;
  addCompany.visible = true;
  if (row) {
    detailRow.value = row;
  }
};

/** 更新企业/项目 */
const handleUpdate = (row: CompanyTable) => {
    if (row.projcetList) {
      //  存在子级，编辑企业
      handleAdd('编辑', row);
    } else {
      //  编辑项目
      handleCreat('编辑项目', row);
    }
};

/** 新增项目 */
const handleCreat = (title?: string, row?: CompanyTable) => {
    parentRow.value = row;
    creatProject.title = title;
    creatProject.visible = true;
};

/** 弹窗关闭 */
const close = (type: string, edit?: boolean) => {
  if (type == 'add') { addCompany.visible = false; }
  if (type == 'creat') { creatProject.visible = false; }
  if (edit) { getList(); }
};

/** 删除企业/项目 */
const handleDelete = async(row: CompanyTable) => {
  if (row.companyId == undefined) {
    await proxy?.$modal.confirm('是否确认删除名称为"' + row.name + '"的企业?');
    await handledeleteCompany(row.id);
  } else {
    await proxy?.$modal.confirm('是否确认删除名称为"' + row.name + '"的项目?');
    await handledeleteProject(row.companyId, row.id);
  }
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
};

onMounted(() => {
  getList();
});
</script>
