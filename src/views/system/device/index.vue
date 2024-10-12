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
      <el-table v-loading="loading" :data="deviceData">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="EID" align="center" prop="eid" />
        <el-table-column label="预制种子号" align="center" prop="account" />
        <el-table-column label="企业名称" align="center" prop="name" />
        <el-table-column label="设备名称" align="center" prop="firm" />
        <el-table-column label="业务号数量" align="center" prop="import" />
        <el-table-column label="在线状态" align="center" prop="import" />
        <el-table-column label="EIMid" align="center" prop="import" />
        <el-table-column label="创建时间" sortable align="center" prop="enterTime">
          <!-- <template #default="scope">
            <span>{{ parseTime(scope.row.enterTime, '{y}-{m}-{d}') }}</span>
          </template> -->
        </el-table-column>
        <el-table-column label="激活时间" sortable align="center" prop="enterTime">
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

    <!-- 导入卡明细对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1200px" append-to-body @close="cancel">
      <div class="mt-4" style="position: relative;">
        <el-upload style="width: auto;" accept=".xlsx, .xls" :headers="upload.headers" :action="upload.url"
          :on-remove="handleRemove" :limit="1" :file-list="fileList" :before-upload="beforeUpload" :data="uploadData"
          :on-success="uploadFileSuccess">
          <el-button type="default" icon="Upload">上传文件</el-button>
          <template #tip>
            <div class="mt-4"
              style="border: 1px solid #91d5ff; background-color: #e6f7ff; border-radius: 4px; box-sizing: border-box; line-height: 28px;">
              <el-row :gutter="10">
                <el-col :span="1.5">
                  <el-icon class="mt-2 ml-2" :size="30" color="#1890FF">
                    <Warning />
                  </el-icon>
                </el-col>
                <el-col :span="1.5">
                  <div class="el-upload__tip m-2" style="font-size: 16px">
                    温馨提示：
                  </div>
                  <div class="el-upload__tip m-2" style="font-size: 16px">
                    1、请按照模板格式输入信息，数据量不要超过10000条；
                  </div>
                  <div class="el-upload__tip m-2" style="font-size: 16px">
                    2、只支持xlsx格式文件，其中EID信息为必填内容，设备名称为非必填内容；
                  </div>
                  <div class="el-upload__tip m-2" style="font-size: 16px">
                    3、批量导入设备时，你可自定义设备名称（限30字，选填），并使用设备名称查找设备；
                  </div>
                  <div class="el-upload__tip m-2" style="font-size: 16px">
                    4、批量导入设备时，默认获取当前的企业名称信息，自动填充；
                  </div>
                </el-col>
              </el-row>
            </div>
          </template>
        </el-upload>
      </div>
      <!-- v-if="paginatedData && paginatedData.length > 0" -->
      <el-card class=" mt-8">
        <el-table :data="paginatedData">
          <el-table-column label="EID" align="center" prop="eid" />
          <el-table-column label="设备名称" align="center" prop="device" />
          <el-table-column label="企业名称" align="center" prop="firm" />
          <el-table-column label="数据校验" align="center" prop="result" />
        </el-table>
        <el-pagination class="mt-6" v-show="totalItems" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize" :total="totalItems">
        </el-pagination>
      </el-card>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="finish" :disable="isDisabled">确定导入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="In" lang="ts">
import { ref, defineProps, getCurrentInstance, toRefs, ComponentInternalInstance, reactive, nextTick, watch } from "vue"
import { cardList, cardImport } from '@/api/system/cardImport';
import { globalHeaders } from "@/utils/request";
import { Edit } from "@element-plus/icons-vue/dist/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_status } = toRefs<any>(proxy?.useDict('sys_device_status'));
const fileList = ref([])
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const dialog = ref({
  visible: false,
  title: "批量导入"
})

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

const queryFormRef = ref<ElFormInstance>();

let fileParams: any = {
  objectId: "",
  uploadName: "",
  uploadFile: "",
}

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    eid: undefined,
    iccid: undefined,
    providerName: undefined,
    status: undefined,
    eimid: undefined,
    isAsc: <any>undefined,
    params: {
    },
  },

});

const { queryParams } = toRefs(data);

/** 查询入库列表 */
const getList = async () => {
  loading.value = true;
  // const res = await cardDetailList(queryParams.value);
  // deviceData.value = res.rows;
  // total.value = res.total;
  deviceData.value = [
    {
      eid: '123'
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
const handleCurrentChange = (newPage: any) => {
  currentPage.value = newPage;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
};


const handleSizeChange = (newSize: any) => {
  pageSize.value = newSize;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
};
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
  dialog.value.visible = true
}

onMounted(() => {
  getList();
})


const isCheck = ref(false)

/**完成入库 */
const finish = async () => {
  fileParams.objectId = queryParams.value.inId
  let res = await addRenewTask(fileParams);
  console.log(res)
  if (res.code === 200) {
    isCheck.value = false;
    dialog.value.visible = false;
    // reset()
    // getList();
    proxy?.$modal.msgSuccess("操作成功");
  }
}

// /** 表单重置 */
// const reset = () => {
//     form.value = { ...initFormData };
//     inFormRef.value?.resetFields();
// }

const cancel = () => {
  currentPage.value = 1;
  totalItems.value = 0;
  tableData.value = [];
  paginatedData.value = [];
  fileList.value = [];
  dialog.value.visible = false
  getList();
}
</script>