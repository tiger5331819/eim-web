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
    <el-table :data="tableData" stripe style="width: 100%; height: 65vh">
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
  </el-card>

  <!-- 新增/修改EIM对话框 -->
  <el-dialog ref="formDialogRef" :title="dialog.title" v-model="dialog.visible" width="1200px" append-to-body
    @close="closeDialog">
    <el-form :model="form" :rules="rules" ref="eimFormRef" label-width="180px">
      <el-form-item label="EIMId" prop="eimId">
        <el-input v-model="form.eimId" placeholder="请输入EIMId" />
      </el-form-item>

      <el-form-item label="EIM地址" prop="eimAddress">
        <el-input v-model="form.eimAddress" placeholder="请输入EIM地址" />
      </el-form-item>

      <el-form-item label="EIMIdType" prop="eimIdType">
        <el-input v-model="form.eimIdType" placeholder="请输入EIMIdType" />
      </el-form-item>

      <el-form-item label="counterValue" prop="counterValue">
        <el-input v-model="form.counterValue" placeholder="请输入counterValue" />
      </el-form-item>

      <el-form-item label="associationToken" prop="associationToken">
        <el-input v-model="form.associationToken" placeholder="请输入associationToken" />
      </el-form-item>

      <el-form-item label="authenticationMethod">
        <el-radio-group v-model="form.authenticationMethod">
          <el-radio v-for="dict in sye_eim_method" :key="dict.value" :label="dict.value">{{
            dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.authenticationMethod == '0'" label="eimPublicKey" prop="eimPublicKey">
        <el-input v-model="form.eimPublicKey" placeholder="请输入eimPublicKey" />
      </el-form-item>

      <el-form-item v-if="form.authenticationMethod == '1'" label="eimCertificate">
        <el-upload style="width: auto;" accept=".rar, .zip, .doc, .docx, .pdf, .jpg" :headers="upload.headers"
          :action="upload.url" :on-remove="handleRemove" :limit="1" :file-list="fileList" :before-upload="beforeUpload"
          :data="uploadData" :on-success="uploadFileSuccess">
          <el-button type="default" icon="Upload">上传文件</el-button>
          <template #tip>
            <div class="text-center">
              <span>支持扩展名：.rar .zip .doc .docx .pdf .jpg...</span>
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="trustedPublicKeyDataTls" prop="trustedPublicKeyDataTls">
        <el-input v-model="form.trustedPublicKeyDataTls" placeholder="请输入trustedPublicKeyDataTls" />
      </el-form-item>

      <el-form-item label="eimSupportedProtocol" prop="eimSupportedProtocol">
        <el-input v-model="form.eimSupportedProtocol" placeholder="请输入eimSupportedProtocol" />
      </el-form-item>

      <el-form-item label="euiccCiPKld" prop="euiccCiPKld">
        <el-input v-model="form.euiccCiPKld" placeholder="请输入euiccCiPKld" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel()">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>
<script setup name="In" lang="ts">
import { ref } from "vue"
import { DeviceForm, DeviceQuery, DeviceVO } from '@/api/system/device/types';
import { globalHeaders } from "@/utils/request";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sye_eim_method } = toRefs<any>(proxy?.useDict('sye_eim_method'));
const eimFormRef = ref<ElFormInstance>();
const formDialogRef = ref<ElDialogInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const fileList = ref([])
const uploadData = ref({})
/*** 上传文件参数 */
const upload = reactive({
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/resource/oss/upload"
})
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})
let fileParams: any = {
  objectId: "",
  uploadName: "",
  uploadFile: "",
}
// const tableData = ref([])
const tableData = ref([
  {
    eimId: 1
  },
  {
    eimId: 2
  },
  {
    eimId: 3
  },
  {
    eimId: 4
  },
  {
    eimId: 5
  },
  {
    eimId: 6
  },
  {
    eimId: 7
  },
  {
    eimId: 8
  },
  {
    eimId: 9
  },
  {
    eimId: 10
  },
  {
    eimId: 11
  },
  {
    eimId: 12
  },
  {
    eimId: 13
  },
  {
    eimId: 14
  },
  {
    eimId: 15
  },
  {
    eimId: 16
  },
  {
    eimId: 17
  },
  {
    eimId: 18
  },
  {
    eimId: 19
  },
  {
    eimId: 20
  },
  {
    eimId: 21
  },
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

const initFormData: DeviceForm = {
  eimIdOriginal: undefined,
  eimId: undefined,
  eimAddress: undefined,
  eimIdType: undefined,
  counterValue: undefined,
  associationToken: undefined,
  authenticationMethod: '0',
  eimPublicKey: undefined,
  eimCertificate: undefined,
  trustedPublicKeyDataTls: undefined,
  eimSupportedProtocol: undefined,
  euiccCiPKld: undefined,
}
const data = reactive<PageData<DeviceForm, DeviceQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    eid: undefined,
    iccid: undefined,
    providerName: undefined,
    status: undefined,
    eimid: undefined,
    isAsc: undefined,
    params: {
    },
  },
  rules: {
    userName: [{ required: true, message: "账号不能为空", trigger: "blur" }, { min: 2, max: 20, message: "账号长度必须介于 2 和 20 之间", trigger: "blur" }],
    nickName: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
    password: [{ required: true, message: "用户密码不能为空", trigger: "blur" }, { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" }],
    email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
    roleIds: [{ type: 'array', required: true, message: "角色权限不能为空", trigger: ["blur", "change"] }],
  }
})

const { queryParams, form, rules } = toRefs<PageData<DeviceForm, DeviceQuery>>(data)

/**
 * 打开弹窗
 */
const handleUpdate = (e: any) => {
  dialog.visible = true
}

/**
 * 关闭弹窗
 */
const closeDialog = () => {
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表单
 */
const resetForm = () => {
  eimFormRef.value?.resetFields();
  eimFormRef.value?.clearValidate();

  // form.value.id = undefined;
  form.value.authenticationMethod = '0';
}

/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  eimFormRef.value?.resetFields();
}

/** 取消按钮 */
const cancel = () => {
  dialog.visible = false;
  reset();
}

/** 提交按钮 */
const submitForm = () => {
  eimFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      // form.value.userId ? await api.updateUser(form.value) : await api.addUser(form.value);
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      // await getList();
    }
  })
}

function handleRemove(file: any, fileList: any) {
  fileList.value = []
  fileParams.uploadName = ''
  fileParams.uploadFile = ''
};

function beforeUpload(file: any) {
  uploadData.value = { inId: props.id }; //上传携带的参数名
  let type = file.name.substr((file.name.lastIndexOf(".")))
  if (type != '.xlsx' && type != '.xls') {
    proxy?.$modal.msgError("文件格式错误");
    return false
  }
  let promise = new Promise((resolve) => {
    nextTick(function () {
      resolve(true);
    });
  });
  return promise;
}

//上传成功
function uploadFileSuccess(res: any, file: any, fileList: any) {
  console.log('res', res)
  if (res.code == 200) {
    proxy?.$modal.msgSuccess("文件上传成功");
    isDisabled.value = false
    tableData.value = res.data || [];
    fileParams.uploadName = res.data.fileName
    fileParams.uploadFile = res.data.ossId
    totalItems.value = tableData.value.length;
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    paginatedData.value = tableData.value.slice(start, end);
  } else {
    proxy?.$modal.msgError("文件上传失败");
    isDisabled.value = true
  }
}

</script>