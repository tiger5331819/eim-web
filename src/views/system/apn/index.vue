<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="APN" prop="apn">
            <el-input v-model="queryParams.apn" placeholder="请输入APN" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:apn:add']">新增</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:apn:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:apn:remove']"
              >删除</el-button
            >
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:apn:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="apnList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="APN ID" align="center" prop="id" v-if="true" />
        <el-table-column label="名称" align="center" prop="name" />
        <el-table-column label="APN" align="center" prop="apn" />
        <el-table-column label="适用地区" align="center" prop="local" />
        <el-table-column label="创建时间" align="center" prop="creationTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.creationTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:apn:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:apn:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改apn对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="apnFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="APNID" prop="id">
          <el-input v-model="form.id" :disabled="isEdit" placeholder="请输入APNID" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="APN" prop="apn">
          <el-input v-model="form.apn" placeholder="请输入APN" />
        </el-form-item>
        <el-form-item label="适用地区" prop="local">
          <el-input v-model="form.local" placeholder="请输入适用地区" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Apn" lang="ts">
import { addApn,getApn,listApn, updateApn,delApn} from '@/api/system/apn';
import { ApnForm, ApnQuery, ApnVO } from '@/api/system/apn/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const apnList = ref<ApnVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const apnFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const isEdit = ref<any>(false)
const initFormData: ApnForm = {
  id: undefined,
  name: undefined,
  apn: undefined,
  local: undefined,
}
const data = reactive<PageData<ApnForm, ApnQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    apn: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "APN ID不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "名称不能为空", trigger: "blur" }
    ],
    apn: [
      { required: true, message: "APN不能为空", trigger: "blur" }
    ],
    local: [
      { required: true, message: "适用地区不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询apn列表 */
const getList = async () => {
  loading.value = true;
  const res = await listApn(queryParams.value);
  apnList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  apnFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: ApnVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加apn";
  isEdit.value = false
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ApnVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getApn(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改apn";
  isEdit.value = true
}

/** 提交按钮 */
const submitForm = () => {
  apnFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (isEdit.value) {
        await updateApn(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addApn(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ApnVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除apn编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delApn(_ids)
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('manager/apn/export', {
    ...queryParams.value
  }, `apn_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
