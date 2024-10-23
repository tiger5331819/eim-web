<template>
  <div class="p-2">

    <el-card shadow="hover">
      <template #header>
        <div>
          <el-button link type="primary" icon="Back" @click="backTo">返回</el-button>
        </div>
      </template>

      <span class="m-2" style="font-size: 24px;">下载业务号</span>

      <el-form :model="form" :rules="rules" ref="deviceFormRef" label-width="100px" style="margin-top: 20px;">

        <el-form-item label="请求方式：" prop="method">
          <el-radio-group v-model="form.method">
            <el-radio v-for="dict in sys_code_method" :key="dict.value" :label="dict.value">{{
              dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.method == '1'" label="输入QRcode：" prop="code">
          <el-input type="textarea" v-model="form.code" placeholder="请输入QRcode" style="max-width: 500px;" />
        </el-form-item>

        <el-form-item v-if="form.method == '2'" label="上传QRcode：" prop="code">
          <el-upload style="width: auto;" accept=".jpg, .png, .svg" :headers="upload.headers"
            list-type="picture-card" action="#" :on-change="changeFile" :auto-upload="false" :on-remove="handleRemove"
            :limit="1" :file-list="fileList" :data="uploadData" :on-preview="handlePictureCardPreview">
            <!-- <el-upload style="width: auto;" accept=".jpg" :headers="upload.headers" :action="upload.url"
            :on-remove="handleRemove" :limit="1" :file-list="fileList" list-type="picture-card"
            :before-upload="beforeUpload" :data="uploadData" :on-success="uploadFileSuccess" :auto-upload="false"> -->
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

        <el-form-item label="">
          <el-button v-if="form.method == '0'" type="primary" @click="profileDownload">获取并下载资源</el-button>
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

        <el-form-item label="下载进度：">
          <div>
            <el-progress :percentage="progress" :status="success" style="width: 500px;"></el-progress>
          </div>
        </el-form-item>
        <!-- <div class="m-4" style="max-width: 600px;">
          <el-progress :percentage="50" />
          <el-progress :percentage="100" :format="format" />
          <el-progress :percentage="100" status="success" />
          <el-progress :percentage="100" status="warning" />
          <el-progress :percentage="50" status="exception" />
        </div> -->
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

    <!-- <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog> -->
  </div>
</template>

<script setup name="In" lang="ts">
import { ref, defineProps, getCurrentInstance, toRefs, ComponentInternalInstance, reactive, nextTick, watch } from "vue"
import { eimDownload, dpDownload, toDownload, toResult } from '@/api/system/device/index';
import { globalHeaders } from "@/utils/request";
import QrCode from 'qrcode-decoder'

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
  code: undefined
})
const downloadData = ref<any>({
  iccid: undefined,
  issue: undefined,
  country: undefined,
})
const rules = ref({
  method: [{ required: true, message: "请求方式不能为空", trigger: "blur" }],
  code: [{ required: true, message: "code不能为空", trigger: "blur" }]
})


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

const handlePictureCardPreview = () => {
  // dialogImageUrl.value = uploadFile.url!
  // dialogVisible.value = true
}

function changeFile(file: any) {
  let type = file.name.substr((file.name.lastIndexOf(".")))
  if (type != '.jpg' && type != '.png' && type != '.svg') {
    proxy?.$modal.msgError("文件格式错误");
    return false
  }

  // fileList.value.push(file)
  console.log('file1',file)
  console.log('file.raw1',file.raw)
  // dialogImageUrl.value = window.URL.createObjectURL(file.raw)

  getQrUrl(file.raw).then((res: any) => {
    trigger.value = res?.data
    if (!trigger.value) {
      proxy?.$modal.msgError("文件信息错误");
    }
  })
}

function handleRemove(file: any, fileList: any) {
  fileList.value = []
  dialogImageUrl.value = ''
};

const backTo = () => {
  // router.push({
  //   path: "/device",
  // });
  router.go(-1)
}

const profileDownload = async () => {
  progress.value ='0'
  if (form.value.method == '0') {
    const res = await dpDownload(eid.value)
    if (res.code == 200) {
      errorCode.value = res.code
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

const downloadProgress = async () => {
  const val = await eimDownload(eid.value)
  progress.value = val.data
  if (val.data < 100) {
    setTimeout(downloadProgress, 500)
  } else {
    downloadResult()
  }
}

const getQrUrl = (file: any) => {
  console.log('file',file)
  //使用这个方法或者下面被注释的方法设置浏览器读取文件方式，chrome和ie有效，其他浏览器没测试
  const URi = window.webkitURL.createObjectURL(file) || window.URL.createObjectURL(file)
  // if (window.webkitURL) {
  //     URi = window.webkitURL.createObjectURL(file);
  // } else if (window.URL && window.URL.createObjectURL) {
  //     URi = window.URL.createObjectURL(file);
  // } else {
  //     URi = null;
  // }
  const url = URi
  console.log('url',url)
  // 初始化
  const qr = new QrCode()
  // 解析二维码，返回promise
  return qr.decodeFromImage(url)
}

const downloadResult = async () => {
  const res = await toResult(eid.value)
  downloadData.value = res.data
}



onMounted(() => {
  eid.value = localStorage.getItem('eid')
  errorCode.value = ''
  downloadData.value = {
    iccid: undefined,
    issue: undefined,
    country: undefined,
  }
  // getList();
})

</script>