<template>
  <div class="p-2">
    <div class="search" v-show="showSearch">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="88px">
        <el-form-item label="EID" prop="eid">
          <el-input v-model="queryParams.eid" placeholder="请输入EID" clearable style="width: 240px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="预制种子号" prop="iccid">
          <el-input v-model="queryParams.iccid" placeholder="请输入ICCID" clearable style="width: 240px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="运营商" prop="providerName">
          <el-input v-model="queryParams.providerName" placeholder="请输入运营商" clearable style="width: 240px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="在线状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择在线状态" clearable style="width: 240px">
            <el-option v-for="dict in sys_device_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="EIMid" prop="eimid">
          <el-input v-model="queryParams.eimid" placeholder="请输入EIMid" clearable style="width: 240px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover">
      <template #header>
        <el-button type="primary" @click="handleUpdate">替换EIM</el-button>
      </template>
      <el-table v-loading="loading" :data="deviceData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="EID" align="center" prop="eid" />
        <el-table-column label="预制种子号" align="center" prop="eid1" />
        <el-table-column label="企业名称" align="center" prop="eid2" />
        <el-table-column label="设备名称" align="center" prop="eid3" />
        <el-table-column label="业务号数量" align="center" prop="eid4" />
        <el-table-column label="在线状态" align="center" prop="eid5" />
        <el-table-column label="EIMid" align="center" prop="eid6" />
        <el-table-column label="创建时间" sortable align="center" prop="eid7">
          <!-- <template #default="scope">
            <span>{{ parseTime(scope.row.enterTime, '{y}-{m}-{d}') }}</span>
          </template> -->
        </el-table-column>
        <el-table-column label="激活时间" sortable align="center" prop="eid8">
          <!-- <template #default="scope">
            <span>{{ parseTime(scope.row.enterTime, '{y}-{m}-{d}') }}</span>
          </template> -->
        </el-table-column>
        <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="详细" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"> </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 替换EIM对话框 -->
    <el-dialog ref="formDialogRef" :title="dialog.title" v-model="dialog.visible" width="1200px" append-to-body
      @close="closeDialog">
      <el-form :model="form" :rules="rules" ref="deviceFormRef" label-width="180px">
        <el-form-item label="原EIMId" prop="eimIdOriginal">
          <!-- <el-input v-model="form.eimIdOriginal" placeholder="请输入原EIMId" /> -->
          <el-select v-model="form.eimIdOriginal" multiple placeholder="请选择原EIMId" style="width: 100%">
            <el-option v-for="item in eidList" :key="item.eid" :label="item.eid" :value="item.eid"></el-option>
          </el-select>
        </el-form-item>

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
            :action="upload.url" :on-remove="handleRemove" :limit="1" :file-list="fileList"
            :before-upload="beforeUpload" :data="uploadData" :on-success="uploadFileSuccess">
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

  </div>
</template>

<script setup name="In" lang="ts">
import { ref, defineProps, getCurrentInstance, toRefs, ComponentInternalInstance, reactive, nextTick, watch } from "vue"
import { cardList, cardImport } from '@/api/system/device/index';
import { DeviceForm, DeviceQuery, DeviceVO } from '@/api/system/device/types';
import { globalHeaders } from "@/utils/request";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_status, sye_eim_method } = toRefs<any>(proxy?.useDict('sys_device_status', 'sye_eim_method'));
const fileList = ref([])
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const deviceFormRef = ref<ElFormInstance>();
const formDialogRef = ref<ElDialogInstance>();

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const uploadData = ref({})
/*** 上传文件参数 */
const upload = reactive({
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/resource/oss/upload"
})


const deviceData = ref<any>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const isDisabled = ref(true);
const showSearch = ref(true);
const total = ref(0);
const router = useRouter();
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const queryFormRef = ref<ElFormInstance>();
const eidList = ref<any>([])


let fileParams: any = {
  objectId: "",
  uploadName: "",
  uploadFile: "",
}

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

/** 查询设备列表 */
const getList = async () => {
  loading.value = true;
  // const res = await cardDetailList(queryParams.value);
  // deviceData.value = res.rows;
  // total.value = res.total;
  deviceData.value = [
    {
      eid: '123'
    },
    {
      eid: '456'
    },
    {
      eid: '789'
    }
  ]
  loading.value = false;
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

/** 详情按钮操作*/
const handleView = (row?: any) => {
  router.push({
    path: "/device_detail",
    query: {
      id: row.id,
    },
  });
}

/** 选择条数  */
const handleSelectionChange = (selection: DeviceVO[]) => {
  ids.value = selection.map((item) => item.eid);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
  eidList.value = []
  if(ids.value.length > 0){
    ids.value.forEach((item) => {
      eidList.value.push({eid: item}) 
    })
  }
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
// 实现分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const paginatedData = ref([]);
const tableData = ref([])

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

const handleUpdate = () => {
  dialog.visible = true
}

onMounted(() => {
  getList();
})

// /**完成入库 */
// const finish = async () => {
//   fileParams.objectId = queryParams.value.inId
//   let res = await addRenewTask(fileParams);
//   console.log(res)
//   if (res.code === 200) {
//     dialog.visible = false;
//     // reset()
//     // getList();
//     proxy?.$modal.msgSuccess("操作成功");
//   }
// }


// const cancel = () => {
//   currentPage.value = 1;
//   totalItems.value = 0;
//   tableData.value = [];
//   paginatedData.value = [];
//   fileList.value = [];
//   dialog.value.visible = false
//   getList();
// }

/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  deviceFormRef.value?.resetFields();
}

/** 取消按钮 */
const cancel = () => {
  dialog.visible = false;
  reset();
}

/** 提交按钮 */
const submitForm = () => {
  deviceFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      // form.value.userId ? await api.updateUser(form.value) : await api.addUser(form.value);
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  })
}

/**
 * 关闭弹窗
 */
const closeDialog = () => {
  dialog.visible = false;
  eidList.value = [];
  resetForm();
}

/**
 * 重置表单
 */
const resetForm = () => {
  deviceFormRef.value?.resetFields();
  deviceFormRef.value?.clearValidate();

  // form.value.id = undefined;
  form.value.authenticationMethod = '0';
}
</script>