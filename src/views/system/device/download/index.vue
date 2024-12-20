<template>
  <div class="p-5">
    <el-card shadow="hover">
      <template #header>
        <div>
          <el-button link type="primary" icon="Back" @click="backTo">返回</el-button>
        </div>
      </template>

      <span class="m-2" style="font-size: 24px;">下载业务号</span>

      <el-form :model="form" :rules="rules" :inline="true" ref="deviceFormRef" label-width="180px" style="margin-top: 20px;">
        <el-form-item label="单个设备分配资源数：" prop="method">
          <el-input v-model="form.method" placeholder="0" />
        </el-form-item>

        <el-form-item label="批次：" prop="method">
          <el-select v-model="form.method">
            <el-option v-for="dict in sys_code_method" :key="dict.value" :label="dict.value">{{
              dict.label }}</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="">
          <el-button type="primary">分配适用</el-button>
        </el-form-item>

        <el-form-item label="资源立即启用：" prop="method">
          <el-radio-group v-model="form.method">
            <el-radio v-for="dict in sys_code_method" :key="dict.value" :label="dict.value">{{
              dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <el-card shadow="hover">
        <template #header>
          <el-button type="primary">资源分配并执行下载工作</el-button>
        </template>
        <el-table ref="deviceTable" v-loading="loading" :data="deviceData">
          <el-table-column label="EID" align="center" prop="eid" />
          <el-table-column label="预制种子号" align="center" prop="iccid" />
          <el-table-column label="归属企业" align="center" prop="companyName" />
          <el-table-column label="归属项目" align="center" prop="name" />
          <el-table-column label="设备名称" align="center" prop="profileCount" />
          <el-table-column label="批次" align="center" prop="online">
            <!-- <template #default="{ scope, $index }">
            <el-input v-model="deviceData[$index].profileCount" placeholder="请输入手机号" />
          </template> -->
          </el-table-column>
          <el-table-column label="分配资源数量" align="center" prop="eimFqdn">
            <!-- <template #default="{ scope, $index }">
            <el-input v-model="deviceData[$index].profileCount" placeholder="请输入手机号" />
          </template> -->
          </el-table-column>
          <el-table-column label="ICCID" align="center" prop="creationTime" />
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </el-card>

      <el-card shadow="hover">
        <el-button type="primary" style="margin-bottom: 20px;">一键重新下载</el-button>
        <el-row style="margin-bottom: 10px;" v-for="item in mockResult" :key="item.number" :gutter="10" type="flex" align="middle">
          <el-col :span="3">{{ item.number }}</el-col>
          <el-col :span="2" style="text-align: right;">下载进度： </el-col>
          <el-col :span="3" v-if="item.status !== 'fail'">
            <el-progress :percentage="item.percentage" :status="item.status"></el-progress>
          </el-col>
          <el-col v-else :span="3" style="color: red;">下载失败</el-col>
          <el-col v-if="item.status == 'fail'" :span="3"><el-button type="primary">重新下载</el-button></el-col>
        </el-row>
      </el-card>
    </el-card>
  </div>
</template>

<script setup name="In" lang="ts">
import { ref, defineProps, getCurrentInstance, toRefs, ComponentInternalInstance, reactive, nextTick, watch } from "vue"
import { eimDownload, dpDownload, idDownload, toDownload, toResult, eimProfile } from '@/api/system/device/index';
import useTagsViewStore from "@/store/modules/tagsView";
import { spawn } from "child_process";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_code_method } = toRefs<any>(proxy?.useDict('sys_code_method'));
const total = ref(0)
const loading = ref(false)
const eid = ref<any>('0')
const deviceData = ref<any>([])
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
  method: [{ required: true, message: "资源是否启用不能为空", trigger: "blur" }],
  code: [{ required: true, message: "code不能为空", trigger: "blur" }],
  issuer: [{ required: true, message: "运营商不能为空", trigger: "blur" }]
})

const data = reactive<any>({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    eid: undefined,
    iccid: undefined,
    companyName: undefined,
    online: undefined,
    eimid: undefined,
    eimFqdn: undefined,
    isAsc: undefined,
    params: {
    },
  },
})

const { queryParams } = toRefs<any>(data)

const issuerList = ref<any>([])

const getList = async () => {
  const res = await eimProfile()
  issuerList.value = res.data
}

const router = useRouter();
const store = useTagsViewStore()

const mockResult = reactive<any>([]);

for(let i = 0; i < 7; i++) {
  let _info = { number: `test-number${i}`, percentage: 50, status: '' }
  switch (i){
    case 1:
      _info.percentage = 100;
      _info.status = 'success';
      mockResult.push(_info);
      break;
    case 2:
      _info.status = 'fail';
      mockResult.push(_info);
      break;
    case 4:
      _info.status = 'fail';
      mockResult.push(_info);
      break;
    default:
      mockResult.push(_info);
      break;
  }
}

const backTo = () => {
  // router.push({
  //   path: "/device",
  // });
  store.delVisitedView(router.currentRoute.value)
  router.go(-1)
}


// // 执行下载
// const downloadProgress = async () => {
//   const val = await eimDownload(eid.value)
//   if (val.code == 200) {
//     progress.value = val.data
//     if (val.data < 100) {
//       setTimeout(downloadProgress, 500)
//     } else {
//       downloadResult()
//     }
//   }
// }


// // 下载结果
// const downloadResult = async () => {
//   const res = await toResult(eid.value)
//   downloadData.value = res.data
// }

onMounted(() => {
  eid.value = localStorage.getItem('eid')
  getList()
  // downloadProgress()
  downloadData.value = {
    iccid: undefined,
    issue: undefined,
    country: undefined,
  }
})

/**
 *  <el-table-column label="EID" width="150" align="center" prop="eid">
          <template #default="{ scope, $index }">
            <el-input v-model="deviceData[$index].profileCount" placeholder="请输入手机号" />
          </template>
        </el-table-column>
 */
</script>
