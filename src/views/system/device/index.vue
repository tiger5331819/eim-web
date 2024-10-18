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
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="queryParams.companyName" placeholder="请输入企业名称" clearable style="width: 240px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="在线状态" prop="online">
          <el-select v-model="queryParams.online" placeholder="请选择在线状态" clearable style="width: 240px">
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
        <el-table-column label="预制种子号" align="center" prop="iccid" />
        <el-table-column label="企业名称" align="center" prop="companyName" />
        <el-table-column label="设备名称" align="center" prop="name" />
        <el-table-column label="业务号数量" align="center" prop="profileCount" />
        <el-table-column label="在线状态" align="center" prop="online">
          <template #default="scope">
            <span v-if="scope.row.online == '1'">在线</span>
            <span v-if="scope.row.online == '0'">离线</span>
          </template>
        </el-table-column>
        <el-table-column label="EIMid" align="center" prop="eimFqdn" />
        <el-table-column label="创建时间" sortable align="center" prop="creationTime">
          <!-- <template #default="scope">
            <span>{{ parseTime(scope.row.enterTime, '{y}-{m}-{d}') }}</span>
          </template> -->
        </el-table-column>
        <el-table-column label="激活时间" sortable align="center" prop="activationTime">
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
          <el-select v-model="form.eimIdOriginal" clearable placeholder="请选择原EIMId" style="width: 100%">
            <el-option v-for="item in eimIdList" :key="item.eimFqdn" :label="item.eimFqdn" :value="item.eimFqdn"
              @change="optionChange"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="EIMId" prop="eimId">
          <el-input v-model="form.eimId" placeholder="请输入EIMId" />
        </el-form-item>

        <el-form-item label="EIM地址" prop="eimFqdn">
          <el-input v-model="form.eimFqdn" placeholder="请输入EIM地址" />
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
          <el-upload style="width: auto;" accept=".rar, .zip, .doc, .docx, .pdf, .jpg" :headers="upload.headers"
            action="#" :on-change="changeFile" :auto-upload="false" :on-remove="handleRemove" :limit="1"
            :file-list="fileList" :data="uploadData">
            <!-- <el-upload style="width: auto;" accept=".rar, .zip, .doc, .docx, .pdf, .jpg" :headers="upload.headers"
            :action="upload.url" :on-remove="handleRemove" :limit="1" :file-list="fileList"
            :before-upload="beforeUpload" :data="uploadData" :on-success="uploadFileSuccess"> -->
            <el-button type="default" icon="Upload">上传文件</el-button>
            <template #tip>
              <div class="text-center">
                <span>支持扩展名：.rar .zip .doc .docx .pdf .jpg...</span>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="trustedPublicKeyDataTls" prop="trustedEimPkTls">
          <el-input v-model="form.trustedEimPkTls" placeholder="请输入trustedPublicKeyDataTls" />
        </el-form-item>

        <el-form-item label="eimSupportedProtocol" prop="eimSupportedProtocol">
          <el-input v-model="form.eimSupportedProtocol" placeholder="请输入eimSupportedProtocol" />
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

  </div>
</template>

<script setup name="In" lang="ts">
import { ref, defineProps, getCurrentInstance, toRefs, ComponentInternalInstance, reactive, nextTick, watch } from "vue"
import { deviceList, eimChange } from '@/api/system/device/index';
import { DeviceForm, DeviceQuery, DeviceVO } from '@/api/system/device/types';
import { globalHeaders } from "@/utils/request";
import { cloneDeep } from "lodash";

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
  title: '',
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
const ids = ref<any>([]);
const single = ref(true);
const multiple = ref(true);
const queryFormRef = ref<ElFormInstance>();
const eimIdList = ref<any>([])
const fileData = ref<any>()

const initFormData: DeviceForm = {
  eid: undefined,
  eimIdOriginal: undefined,
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
    eimIdOriginal: [{ required: true, message: "原EIMId不能为空", trigger: "blur" }],
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

/** 查询设备列表 */
const getList = async () => {
  loading.value = true;
  const res = await deviceList(queryParams.value);
  deviceData.value = res.rows;
  total.value = res.total;
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
  // 添加缓存
  localStorage.setItem('eid', row.eid)
  router.push({
    path: "/device_detail",
    query: {
      id: row.eid,
    },
  });
}

/** 选择条数  */
const handleSelectionChange = (selection: DeviceVO[]) => {
  ids.value = []
  selection.forEach((item) => {
    ids.value.push({ eimFqdn: item.eimFqdn, eid: item.eid })
  })
  single.value = selection.length != 1;
  multiple.value = !selection.length;
  eimIdList.value = []
  if (ids.value.length > 0) {
    ids.value.forEach((item: any) => {
      eimIdList.value.push({ eimFqdn: item.eimFqdn, eid: item.eid })
    })
  }
}

function handleRemove(file: any, fileList: any) {
  fileList.value = []
  form.value.eimCertificate = undefined
};



const handleUpdate = () => {
  dialog.visible = true;
  dialog.title = '替换EIM'
}

onMounted(() => {
  getList();
})

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

function changeFile(file: any) {
  let type = file.name.substr((file.name.lastIndexOf(".")))
  if (type != '.rar' && type != '.zip' && type != '.doc' && type != '.docx' && type != '.pdf' && type != '.jpg') {
    proxy?.$modal.msgError("文件格式错误");
    return false
  }

  fileData.value = file
  form.value.eimCertificate = file.name
}

function optionChange() {
  eimIdList.value.forEach((item: any) => {
    if (item.eimId == form.value.eimIdOriginal) {
      form.value.eid = item.eid
    }
  })
}

function radioChange() {
  if(form.value.authenticationMethod == '0'){
    form.value.eimCertificate = undefined
    fileData.value = undefined
  }else{
    form.value.eimPublicKey = undefined
  }
}

/** 提交按钮 */
const submitForm = () => {
  deviceFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      let param = new FormData();
      const data = cloneDeep(form.value);
      const json = JSON.stringify(data);
      // param.append('req', json);
      // 将 json 字符串转化为 Blob 对象
      const req = new Blob([json], {
        type: 'application/json',
      });
      if(fileData.value){
        param.append('eimCertificate', fileData.value?.raw)
      }
      param.append('req', req)

      const res = await eimChange(form.value.eid, form.value.eimIdOriginal, param)
      if (res.code == 200) {
        proxy?.$modal.msgSuccess("操作成功");
        dialog.visible = false;
        await getList();
      } else {
        proxy?.$modal.msgError("操作失败");
      }
    }

  })
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
  deviceFormRef.value?.resetFields();
  deviceFormRef.value?.clearValidate();

  // form.value.id = undefined;
  form.value.authenticationMethod = '0';
}
</script>