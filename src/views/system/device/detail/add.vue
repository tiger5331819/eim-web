<template>
  <div class="p-5">
    <el-card shadow="hover">
      <template #header>
        <div>
          <el-button link type="primary" icon="Back" @click="backTo">返回</el-button>
        </div>
      </template>

      <span class="m-2" style="font-size: 24px;">下载业务号</span>

      <el-form :model="form" :rules="rules" ref="deviceFormRef" label-width="120px" style="margin-top: 20px;">
        <el-form-item label="请求方式：" prop="method">
          <el-radio-group v-model="form.method">
            <el-radio v-for="dict in sys_code_method" :key="dict.value" :label="dict.value">{{
              dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.method == '1'" label="输入QRcode：" prop="code">
          <el-input type="textarea" v-model="form.code" placeholder="请输入QRcode" style="max-width: 470px;" />
        </el-form-item>

        <el-form-item v-if="form.method == '2'" label="上传QRcode：" prop="code">
          <el-upload
            :class="{'hide': btnHidden }"
            style="width: auto;"
            accept=".jpg, .png, .svg"
            :headers="upload.headers"
            list-type="picture-card"
            action="#"
            :on-change="changeFile"
            :on-remove="handleRemove"
            :auto-upload="false"
            :limit="1"
            :file-list="fileList"
            :data="uploadData"
            :on-preview="handlePictureCardPreview"
          >
            <el-icon>
              <Plus />
            </el-icon>
            <template #tip>
              <div class="text-center">
                <span>支持扩展名：.jpg .png .svg</span>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="form.method == '3'" label="资源运营商：" prop="issuer">
          <el-select v-model="form.issuer" placeholder="请选择资源运营商" clearable style="width: 470px">
            <el-option v-for="item in issuerList" :key="item.id" :label="item.issuer" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="">
          <el-button v-if="form.method == '0' || form.method == '3'" type="primary" @click="profileDownload">获取并下载资源</el-button>
          <el-button v-else type="primary" @click="profileDownload">识别并下载资源</el-button>
        </el-form-item>

        <el-form-item v-if="form.method == '1'" label="">
          <span v-if="errorCode && errorCode == '200'" style="font-size: 16px;">code文本识别成功，正在下载资源！</span>
          <span v-if="errorCode && errorCode != '200'" style="font-size: 16px;">code文本识别失败，请重新输入！</span>
        </el-form-item>

        <el-form-item v-if="form.method == '2'" label="">
          <span v-if="errorCode && errorCode == '200'" style="font-size: 16px;">code图片识别成功，正在下载资源！</span>
          <span v-if="errorCode && errorCode != '200'" style="font-size: 16px;">code图片识别失败，请重新上传！</span>
        </el-form-item>

        <el-form-item label="下载进度：" v-if="errorCode && errorCode == '200'">
          <div>
            <el-progress :percentage="progress" :status="success" style="width: 500px;"></el-progress>
          </div>
        </el-form-item>
        <el-form-item label="下载进度：" v-if="errorCode && errorCode != '200'">
          <div>
            <span style="color:red">下载失败，请重新扫码或联系客服人员</span>
          </div>
        </el-form-item>
        <el-form-item v-if="progress == '100'" label="">
          <span style="font-size: 16px; font-weight:bold;">{{ downloadData.iccid }}-详细信息</span>
        </el-form-item>
        <el-form-item v-if="progress == '100'" label="">
          <span style="font-size: 16px;">运营商：{{ downloadData.issue }}</span>
        </el-form-item>
        <el-form-item v-if="progress == '100'" label="">
          <span style="font-size: 16px;">所属地：{{ downloadData.country }}</span>
        </el-form-item>
        <el-form-item v-if="progress == '100'" label="">
          <span style="font-size: 16px;">ICCID：{{ downloadData.iccid }}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" content="default-src 'self' *; img-src *;" />
    </el-dialog>
  </div>
</template>

<script setup name="In" lang="ts">
import { ref, defineProps, getCurrentInstance, toRefs, ComponentInternalInstance, reactive, nextTick, watch } from "vue"
import { eimDownload, dpDownload, idDownload, toDownload, toResult, eimProfile } from '@/api/system/device/index';
import { globalHeaders } from "@/utils/request";
import QrCode from 'qrcode-decoder'
import useTagsViewStore from "@/store/modules/tagsView";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_code_method } = toRefs<any>(proxy?.useDict('sys_code_method'));
const fileList = ref<any>([])
const progress = ref('0')
const success = ref('')
const eid = ref<any>('0')
const trigger = ref<any>('')
const errorCode = ref<any>('')
const deviceFormRef = ref<ElFormInstance>();
const form = ref({
  method: '0',
  code: undefined,
  issuer: undefined,
})
const downloadData = ref<any>({
  iccid: undefined,
  issuer: undefined,
  country: undefined,
})
const rules = ref({
  method: [{ required: true, message: "请求方式不能为空", trigger: "blur" }],
  code: [{ required: true, message: "code不能为空", trigger: "blur" }],
  issuer: [{ required: true, message: "运营商不能为空", trigger: "blur" }]
})

const issuerList = ref<any>([])

const btnHidden = ref(false);

const getList = async () => {
  const res = await eimProfile()
  issuerList.value = res.data
}

const uploadData = ref({})
/*** 上传文件参数 */
const upload = reactive({
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/resource/oss/upload"
})

const router = useRouter();

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 图片预览
const handlePictureCardPreview = () => {
  // dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

// 预上传
function changeFile(file: any) {
  let type = file.name.substr((file.name.lastIndexOf(".")))
  if (type != '.jpg' && type != '.png' && type != '.svg') {
    proxy?.$modal.msgError("文件格式错误");
    return false
  }

  // console.log('file1', file)
  // console.log('file.raw1', file.raw)
  dialogImageUrl.value = window.URL.createObjectURL(file.raw)
  btnHidden.value = true;
  getQrUrl(file.raw).then((res: any) => {
    console.log('res', res)
    trigger.value = res?.data
    if (!trigger.value) {
      proxy?.$modal.msgError("文件信息错误");
    }
  })
}

// 删除上传文件
function handleRemove(file: any, fileList: any) {
  fileList.value = []
  dialogImageUrl.value = ''
  btnHidden.value = false;

};

const store = useTagsViewStore()

const backTo = () => {
  // router.push({
  //   path: "/device",
  // });
  store.delVisitedView(router.currentRoute.value)
  router.go(-1)
}

// 开始下载
const profileDownload = async () => {
  progress.value = '0'
  if (form.value.method == '0') {
    const res = await dpDownload(eid.value)
    if (res.code == 200) {
      errorCode.value = res.code
      ElMessage.success('开始下载资源，请稍等...');
      const val = await eimDownload(eid.value)
      progress.value = val.data
      if (val.data < 100) {
        setTimeout(downloadProgress, 500)
      }
    } else {
      errorCode.value = '500'
    }
  } else if (form.value.method == '3') {
    const res = await idDownload(eid.value, form.value.issuer)
    if (res.code == 200) {
      errorCode.value = res.code
      ElMessage.success('开始下载资源，请稍等...');
      const val = await eimDownload(eid.value)
      progress.value = val.data
      if (val.data < 100) {
        setTimeout(downloadProgress, 500)
      }
    } else {
      errorCode.value = '500'
    }
  } else {
    if (form.value.method == '1') {
      const res = await toDownload(eid.value, { trigger: form.value.code })
      if (res.code == 200) {
        errorCode.value = res.code
        ElMessage.success('开始下载资源，请稍等...');
        const val = await eimDownload(eid.value)
        progress.value = val.data
        if (val.data < 100) {
          setTimeout(downloadProgress, 500)
        }
      } else {
        errorCode.value = '500'
      }
    } else if (form.value.method == '2') {
      const res = await toDownload(eid.value, { trigger: trigger.value })
      if (res.code == 200) {
        errorCode.value = res.code
        ElMessage.success('开始下载资源，请稍等...');
        const val = await eimDownload(eid.value)
        progress.value = val.data
        if (val.data < 100) {
          setTimeout(downloadProgress, 500)
        } else {
          downloadResult()
        }
      } else {
        errorCode.value = '500'
      }
    }
  }
}

// 执行下载
const downloadProgress = async () => {
  const val = await eimDownload(eid.value)
  if (val.code == 200) {
    progress.value = val.data
    if (val.data < 100) {
      setTimeout(downloadProgress, 500)
    } else {
      downloadResult()
    }
  }
}

// 二维码转字符串
const getQrUrl = (file: any) => {
  // console.log('file', file)
  //使用这个方法或者下面被注释的方法设置浏览器读取文件方式
  const URi = window.webkitURL.createObjectURL(file) || window.URL.createObjectURL(file)
  // let uri:any = ''
  // if (window.webkitURL) {
  //   uri = window.webkitURL.createObjectURL(file);
  // } else if (window.URL && window.URL.createObjectURL) {
  //   uri = window.URL.createObjectURL(file);
  // } else {
  //   uri = null;
  // }
  const url = URi
  console.log('url', url)
  // 初始化
  const qr = new QrCode()
  // 解析二维码，返回promise
  return qr.decodeFromImage(url)
}

// 下载结果
const downloadResult = async () => {
  const res = await toResult(eid.value)
  downloadData.value = res.data
}

onMounted(() => {
  eid.value = localStorage.getItem('eid')
  getList()
  errorCode.value = ''
  // downloadProgress()
  downloadData.value = {
    iccid: undefined,
    issue: undefined,
    country: undefined,
  }
})
</script>

<style scoped>
:deep(.hide .el-upload--picture-card) {
  display: none;
}
</style>
