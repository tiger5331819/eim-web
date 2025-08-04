<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px" @close="cancel">
    <el-form :model="form" :rules="rules" ref="eimFormRef" label-width="180px">
      <el-form-item label="原EIMId" prop="eimIdOriginal">
        <el-select v-model="form.eimIdOriginal" clearable placeholder="请选择原EIMId" style="width: 100%">
          <el-option v-for="item in eimIdList" :key="item.eid" :label="item.eid" :value="item.eid"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="EIMId" prop="eimId">
        <el-input v-model="form.eimId" placeholder="请输入EIMId" />
      </el-form-item>

      <el-form-item label="EIM地址" prop="eimFqdn">
        <el-input v-model="form.eimFqdn" placeholder="请输入EIM地址" />
      </el-form-item>

      <el-form-item label="EIMIdType" prop="eimIdType">
        <el-select v-model="form.eimIdType" placeholder="请选择EIMIdType" clearable style="width:100%">
          <el-option v-for="dict in sys_eim_id" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="counterValue" prop="counterValue">
        <el-input v-model="form.counterValue" placeholder="请输入counterValue" maxlength="64" />
      </el-form-item>

      <el-form-item label="associationToken" prop="associationToken">
        <el-input v-model="form.associationToken" placeholder="请输入associationToken" disabled />
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
        <el-upload
          style="width: auto;"
          accept=".der, .pem"
          :headers="upload.headers"
          action="#"
          :on-change="changeFile"
          :auto-upload="false"
          :on-remove="handleRemove"
          :limit="1"
          :file-list="fileList"
          :data="uploadData"
        >
          <el-button type="default" icon="Upload">上传文件</el-button>
          <template #tip>
            <div class="text-center">
              <span>支持扩展名：.der .pem</span>
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="trustedPublicKeyDataTls" prop="trustedEimPkTls">
        <el-input v-model="form.trustedEimPkTls" placeholder="请输入trustedPublicKeyDataTls" maxlength="64" />
      </el-form-item>

      <el-form-item label="eimSupportedProtocol" prop="eimSupportedProtocol">
        <el-select v-model="form.eimSupportedProtocol" placeholder="请选择eimSupportedProtocol" clearable style="width:100%">
          <el-option v-for="dict in sys_eim_sp" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="euiccCiPKld" prop="euiccCipkId">
        <!-- <el-input v-model="form.euiccCipkId" placeholder="请输入euiccCiPKld" onkeyup="value=value.replace(/[^\w_]/g,'')" maxlength="64" /> -->
        <el-input v-model="form.euiccCipkId" placeholder="请输入euiccCiPKld" maxlength="64" />
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

<script setup name="changeEim" lang="ts">
import { eimChange, eimList } from '@/api/system/device/index';
import { globalHeaders } from "@/utils/request";
import { cloneDeep } from "lodash";

const props = defineProps({
  dialog: {
    type: Object,
    default: null
  },
  eidList: {
    type: Array,
    default: null
  }
});
const emits = defineEmits(['submit', 'close']);

//  字典
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sye_eim_method, sys_eim_id, sys_eim_sp } = toRefs<any>(proxy?.useDict('sye_eim_method', 'sys_eim_id', 'sys_eim_sp'));


// 弹窗控制
const visible = computed({
  get() {
    return props.dialog.visible;
  },
  set(val) {
    return val;
  }
});

//  表单
const initFormData: any = {
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
};

const data = reactive({
  form: { ...initFormData },
  rules: {
    eimIdOriginal: [{ required: true, message: "原EIMId不能为空", trigger: "blur" }],
    eimId: [{ required: true, message: "EIMId不能为空", trigger: "blur" },
    { pattern: /\d+(\.{1}\d+)+$/, message: '输入不合法', trigger: 'blur' },
    ],
    eimFqdn: [{ required: true, message: "EIM地址不能为空", trigger: "blur" },
    { pattern: /\d+(\.{1}\d+)+(\:{1}\d+){1}$/, message: '输入不合法', trigger: 'blur' },
    ],
    counterValue: [{ pattern: /^[A-Za-z0-9]+$/, message: '输入不合法', trigger: 'blur' },
    ],
    eimIdType: [{ required: true, message: "EIMIdType不能为空", trigger: "blur" }],
    authenticationMethod: [{ required: true, message: "authenticationMethod不能为空", trigger: "blur" }],
    eimPublicKey: [{ required: true, message: "eimPublicKey不能为空", trigger: "blur" },
    { pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>/?]+$/, message: '输入不合法', trigger: 'blur' },
    ],
    eimCertificate: [{ required: true, message: "eimCertificate不能为空", trigger: "blur" }],
    trustedEimPkTls: [{ pattern: /^[A-Za-z0-9]+$/, message: '输入不合法', trigger: 'blur' },],
    eimSupportedProtocol: [{ required: true, message: "eimSupportedProtocol不能为空", trigger: "blur" }],
    euiccCipkId: [{ pattern: /^[A-Za-z0-9]+$/, message: '输入不合法', trigger: 'blur' },],
  }
});
const { form, rules } = toRefs(data);
const eimFormRef = ref();
const eimIdList = ref<any>();

const uploadData = ref();
const fileData = ref();
const fileList = ref();

/*** 上传文件参数 */
const upload = reactive({
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/resource/oss/upload"
});

//  更新eimIdList
const updateEimIdList = () => {
  props.eidList.forEach(async (item: any) => {
    const res = await eimList(item);
    res.rows.forEach((val: any) => {
      eimIdList.value.push({ eid: val.eimId });
    });
  });
};

//  预上传
function changeFile(file: any) {
  let type = file.name.substr((file.name.lastIndexOf(".")))
  if (type != '.der' && type != '.pem') {
    proxy?.$modal.msgError("文件格式错误");
    return false
  }
  fileData.value = file
  form.value.eimCertificate = file.name
};

function handleRemove(file: any, fileList: any) {
  fileList.value = []
  form.value.eimCertificate = undefined
};

// 认证方式
function radioChange() {
  if (form.value.authenticationMethod == '0') {
    form.value.eimCertificate = undefined
  }
  fileData.value = undefined
};


/** 取消按钮 */
const cancel = () => {
  emits('close');
};

/** 提交按钮 */
const submitForm = () => {
  eimFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      let param = new FormData();
      const data = cloneDeep(form.value);
      const json = JSON.stringify(data);
      // 将 json 字符串转化为 Blob 对象
      const req = new Blob([json], { type: 'application/json' });
      if (fileData.value && form.value.authenticationMethod == '1') {
        param.append('eimCertificate', fileData.value?.raw)
      }
      else {
        param.append('eimCertificate', '')
      }
      param.append('req', req)
      props.eidList.forEach(async (item: any) => {
        form.value.eid = item.eid
        try {
          const res = await eimChange(form.value.eid, form.value.eimIdOriginal, param)
          if (res.code == 200) {
            proxy?.$modal.msgSuccess("操作成功");
            emits('submit');
          } else {
            proxy?.$modal.msgError("操作失败");
          }
        } catch (err) {
          proxy?.$modal.msgError("操作失败");
        }
      })
    }
  })
};

/** 重置操作表单 */
const reset = () => {
  eimIdList.value = [];
  eimFormRef.value?.resetFields();
  eimFormRef.value?.clearValidate();
  form.value = { ...initFormData };
}

/** 监听是否打开 */
watch(() => props.dialog, async (v) => {
  if (v.visible) {
    updateEimIdList();
  } else {
    reset();
  }
}, { deep: true, immediate: true });
</script>
