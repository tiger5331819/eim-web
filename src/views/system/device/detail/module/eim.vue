<template>
  <el-card shadow="hover">
    <template #header>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" icon="Plus" @click="handleAdd">新增EIM</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"
          :search="false"></right-toolbar>
      </el-row>
    </template>
    <el-table :data="tableData" stripe style="width: 100%; max-height: 65vh">
      <el-table-column label="EIMId" align="center" prop="eimId" />
      <el-table-column label="EIM地址" align="center" prop="eimFqdn" />
      <el-table-column label="EIMIdType" align="center" prop="eimIdType" />
      <el-table-column label="eimSupportedProtocol" align="center" prop="eimSupportedProtocol" />
      <el-table-column label="euiccCiPKId" align="center" prop="euiccCipkId" />
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
        <el-input v-model="form.eimId" placeholder="请输入EIMId" :disabled="isEdit" />
      </el-form-item>

      <el-form-item label="EIM地址" prop="eimFqdn">
        <el-input v-model="form.eimFqdn" placeholder="请输入EIM地址" />
      </el-form-item>

      <el-form-item label="EIMIdType" prop="eimIdType">
        <!-- <el-input v-model="form.eimIdType" placeholder="请输入EIMIdType" /> -->
        <el-select v-model="form.eimIdType" placeholder="请选择EIMIdType" clearable style="width:100%">
            <el-option v-for="dict in sys_eim_id" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
      </el-form-item>

      <el-form-item label="counterValue" prop="counterValue">
        <el-input v-model="form.counterValue" placeholder="请输入counterValue" />
      </el-form-item>

      <el-form-item label="associationToken" prop="associationToken">
        <el-input v-model="form.associationToken" placeholder="请输入associationToken" />
      </el-form-item>

      <el-form-item label="authenticationMethod" prop="authenticationMethod">
        <el-radio-group v-model="form.authenticationMethod">
          <el-radio v-for="dict in sye_eim_method" :key="dict.value" :label="dict.value" @change="radioChange">{{
            dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.authenticationMethod == '0'" label="eimPublicKey" prop="eimPublicKey">
        <el-input v-model="form.eimPublicKey" placeholder="请输入eimPublicKey" />
      </el-form-item>

      <el-form-item v-if="form.authenticationMethod == '1'" label="eimCertificate" prop="eimCertificate">
        <el-upload style="width: auto;" accept=".der, .pem" :headers="upload.headers"
          action="#" :on-change="changeFile" :auto-upload="false" :on-remove="handleRemove" :limit="1"
          :file-list="fileList" :data="uploadData">
          <!-- <el-upload style="width: auto;" accept=".rar, .zip, .doc, .docx, .pdf, .jpg" :headers="upload.headers"
          :action="upload.url" :on-remove="handleRemove" :limit="1" :file-list="fileList" :before-upload="beforeUpload"
          :data="uploadData" :on-success="uploadFileSuccess"> -->
          <el-button type="default" icon="Upload">上传文件</el-button>
          <template #tip>
            <div class="text-center">
              <span>支持扩展名：.der .pem</span>
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="trustedPublicKeyDataTls" prop="trustedEimPkTls">
        <el-input v-model="form.trustedEimPkTls" placeholder="请输入trustedPublicKeyDataTls" />
      </el-form-item>

      <el-form-item label="eimSupportedProtocol" prop="eimSupportedProtocol">
        <!-- <el-input v-model="form.eimSupportedProtocol" placeholder="请输入eimSupportedProtocol" /> -->
        <el-select v-model="form.eimSupportedProtocol" placeholder="请选择eimSupportedProtocol" clearable style="width:100%">
            <el-option v-for="dict in sys_eim_sp" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
      </el-form-item>

      <el-form-item label="euiccCiPKld" prop="euiccCipkId">
        <el-input v-model="form.euiccCipkId" placeholder="请输入euiccCiPKld" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel()">取 消</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 删除对话框 -->
  <el-dialog :title="dialogDelete.title" v-model="dialogDelete.visible" width="500px" append-to-body
    :show-close="false">
    <div>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-icon :size="40" color="orange">
            <WarningFilled />
          </el-icon>
        </el-col>
        <el-col :span="1.5">
          <p style="font-size: 20px; color: black; margin-top: 5px">请确认是否删除当前EIM信息</p>
          <p style="font-size: 16px; color: red;">删除后无法撤回</p>
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="deleteEIM">确认</el-button>
      </div>
    </template>
  </el-dialog>

</template>
<script setup name="In" lang="ts">
import { ref } from "vue"
import { DeviceForm, DeviceQuery, DeviceVO } from '@/api/system/device/types';
import { eimList, eimDetail, eimAdd, eimDelete, eimEdit } from '@/api/system/device/index';
import { globalHeaders } from "@/utils/request";
import { to } from "await-to-js";
import axios from "axios";
import { cloneDeep } from "lodash";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sye_eim_method, sys_eim_id, sys_eim_sp } = toRefs<any>(proxy?.useDict('sye_eim_method', 'sys_eim_id', 'sys_eim_sp'));
const eimFormRef = ref<ElFormInstance>();
const formDialogRef = ref<ElDialogInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const dialogDelete = reactive<DialogOption>({
  visible: false,
  title: ''
});
const dialogSuccess = reactive<DialogOption>({
  visible: false,
  title: ''
});

const eid = ref<any>('')
const eimId = ref<any>('')
const isEdit = ref(false)
const loading = ref(true);
const fileData = ref<any>()
const fileList = ref<any>([])
const uploadData = ref<any>({
  eimId: undefined,
  eimFqdn: undefined,
  eimIdType: undefined,
  counterValue: undefined,
  associationToken: undefined,
  authenticationMethod: '0',
  eimPublicKey: undefined,
  eimCertificate: undefined,
  trustedEimPkTls: undefined,
  eimSupportedProtocol: undefined,
  euiccCipkId: undefined,
})
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
// let fileParams: any = {
//   objectId: "",
//   uploadName: "",
//   uploadFile: "",
// }
const tableData = ref<any>([])

/** 查询设备列表 */
const getList = async () => {
  eid.value = localStorage.getItem('eid')
  loading.value = true;
  const res = await eimList(eid.value);
  tableData.value = res.rows;
  loading.value = false;
}

const showSearch = ref(true)

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `EIMId`, visible: true, children: [] },
  { key: 1, label: `EIM地址`, visible: true, children: [] },
  { key: 2, label: `EIMIdType`, visible: true, children: [] },
  { key: 3, label: `eimSP`, visible: true, children: [] },
  { key: 4, label: `euiccCiPKId`, visible: true, children: [] },
  { key: 5, label: `操作`, visible: true, children: [] },
])

const initFormData: DeviceForm = {
  eimId: undefined,
  eimFqdn: undefined,
  eimIdType: undefined,
  counterValue: undefined,
  associationToken: undefined,
  authenticationMethod: '0',
  eimPublicKey: undefined,
  eimCertificate: undefined,
  trustedEimPkTls: undefined,
  eimSupportedProtocol: undefined,
  euiccCipkId: undefined,
}
const data = reactive<PageData<DeviceForm, DeviceQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    eid: undefined,
    iccid: undefined,
    companyName: undefined,
    online: undefined,
    eimid: undefined,
    isAsc: undefined,
    params: {
    },
  },
  rules: {
    eimId: [{ required: true, message: "EIMId不能为空", trigger: "blur" }],
    eimFqdn: [{ required: true, message: "EIM地址不能为空", trigger: "blur" }],
    eimIdType: [{ required: true, message: "EIMIdType不能为空", trigger: "blur" }],
    authenticationMethod: [{ required: true, message: "authenticationMethod不能为空", trigger: "blur" }],
    eimPublicKey: [{ required: true, message: "eimPublicKey不能为空", trigger: "blur" }],
    eimCertificate: [{ required: true, message: "eimCertificate不能为空", trigger: "blur" }],
    eimSupportedProtocol: [{ required: true, message: "eimSupportedProtocol不能为空", trigger: "blur" }],
  }
})

const { queryParams, form, rules } = toRefs<PageData<DeviceForm, DeviceQuery>>(data)

/**
 * 打开新增弹窗
 */
const handleAdd = (e: any) => {
  dialog.visible = true;
  dialog.title = '新增EIM'
}

/**
 * 打开修改弹窗
 */
const handleUpdate = async (e: any) => {
  fileList.value = []
  dialog.visible = true;
  dialog.title = '更新EIM';
  isEdit.value = true;
  eid.value = localStorage.getItem('eid')
  eimId.value = e.eimId;
  const res = await eimDetail(eid.value, e.eimId);
  form.value = res.data
  if (!form.value.eimPublicKey) {
    form.value.authenticationMethod = '1'
    fileList.value = [{
      name: '证书',
    }]
  } else {
    form.value.authenticationMethod = '0'
  }
}

/**
 * 打开删除弹窗
 */
const handleDelete = async (e: any) => {
  dialogDelete.visible = true;
  eimId.value = e.eimId;
}

/**
 * 删除EIM
 */
const deleteEIM = async () => {
  const res = await eimDelete(eid.value, eimId.value)
  dialogDelete.visible = false;
  if (res.code == 200) {
    proxy?.$modal.msgSuccess("删除成功");
    getList()
  } else {
    proxy?.$modal.msgError("删除失败");
  }
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
  isEdit.value = false;

  // form.value.id = undefined;
  form.value.authenticationMethod = '0';
}

/** 重置操作表单 */
const reset = () => {
  isEdit.value = false;
  form.value = { ...initFormData };
  eimFormRef.value?.resetFields();
}

/** 取消按钮 */
const cancel = () => {
  dialog.visible = false;
  dialogDelete.visible = false;
  reset();
}

/** 提交按钮 */
const submitForm = () => {
  eimFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      let param = new FormData();
      const data = cloneDeep(form.value);
      const json = JSON.stringify(data);
      // 将 json 字符串转化为 Blob 对象
      const req = new Blob([json], {
        type: 'application/json',
      });
      if (fileData.value) {
        param.append('eimCertificate', fileData.value?.raw)
      }else{
        param.append('eimCertificate', '')
      }
      param.append('req', req)

      if (!isEdit.value) {
        const res = await eimAdd(eid.value, param)
        if (res.code == 200) {
          proxy?.$modal.msgSuccess("操作成功");
          dialog.visible = false;
          await getList();
        } else {
          proxy?.$modal.msgError("操作失败");
        }
      } else {
        const res = await eimEdit(eid.value, eimId.value, param)
        if (res.code == 200) {
          proxy?.$modal.msgSuccess("操作成功");
          dialog.visible = false;
          await getList();
        } else {
          proxy?.$modal.msgError("操作失败");
        }
      }
    }
  })
}

function changeFile(file: any) {
  let type = file.name.substr((file.name.lastIndexOf(".")))
  if (type != '.der' && type != '.pem') {
    proxy?.$modal.msgError("文件格式错误");
    return false
  }

  fileData.value = file
  form.value.eimCertificate = file.name
}

function radioChange() {
  if (form.value.authenticationMethod == '0') {
    form.value.eimCertificate = undefined
    fileData.value = undefined
  } else {
    form.value.eimPublicKey = undefined
  }
}

function handleRemove(file: any, fileList: any) {
  fileList.value = []
  form.value.eimCertificate = undefined
};

// function beforeUpload(file: any) {
//   // uploadData.value = { inId: props.id }; //上传携带的参数名
//   let type = file.name.substr((file.name.lastIndexOf(".")))
//   if (type != '.rar' && type != '.zip' && type != '.doc' && type != '.docx' && type != '.pdf' && type != '.jpg') {
//     proxy?.$modal.msgError("文件格式错误");
//     return false
//   }
//   let promise = new Promise((resolve) => {
//     nextTick(function () {
//       resolve(true);
//     });
//   });
//   return promise;
// }

// //上传成功
// function uploadFileSuccess(res: any, file: any, fileList: any) {
//   console.log('res', res)
//   if (res.code == 200) {
//     proxy?.$modal.msgSuccess("文件上传成功");
//     tableData.value = res.data || [];
//     // totalItems.value = tableData.value.length;
//     // const start = (currentPage.value - 1) * pageSize.value;
//     // const end = start + pageSize.value;
//     // paginatedData.value = tableData.value.slice(start, end);
//   } else {
//     proxy?.$modal.msgError("文件上传失败");
//   }
// }

onMounted(() => {
  getList();
})

</script>