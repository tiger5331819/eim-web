<template>
  <!-- 导入卡明细对话框 -->
  <el-dialog :title="dialog.title" v-model="visible" width="1200px" append-to-body @close="cancel">
    <div class="mt-4" style="position: relative;">
      <el-upload
        style="width: auto;"
        accept=".xlsx"
        :headers="upload.headers"
        :action="upload.url"
        :on-remove="handleRemove"
        :limit="1"
        :file-list="fileList"
        :before-upload="beforeUpload"
        :data="uploadData"
        :on-success="uploadFileSuccess"
      >
        <el-button type="default" icon="Upload">上传文件</el-button>
        <template #tip>
          <div
            class="mt-4"
            style="border: 1px solid #91d5ff; background-color: #e6f7ff; border-radius: 4px; box-sizing: border-box; line-height: 28px;"
          >
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-icon class="mt-2 ml-2" :size="30" color="#1890FF">
                  <Warning />
                </el-icon>
              </el-col>
              <el-col :span="1.5">
                <div class="el-upload__tip m-2" style="font-size: 16px">温馨提示：</div>
                <div class="el-upload__tip m-2" style="font-size: 16px">1、请按照模板格式输入信息，数据量不要超过10000条；</div>
                <div class="el-upload__tip m-2" style="font-size: 16px">2、只支持xlsx格式文件，其中ICCID、运营商、批次、DP+来源信息为必填内容；</div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-upload>
    </div>
    <el-card class=" mt-8">
      <el-table :data="paginatedData">
        <el-table-column label="ICCID" align="center" prop="iccid" />
        <el-table-column label="运营商" align="center" prop="carrierName" />
        <el-table-column label="批次" align="center" prop="productionBatch" />
        <el-table-column label="DP+来源" align="center" prop="dpSource" />
        <el-table-column label="数据校验" align="center" prop="result" />
      </el-table>
      <el-pagination
        class="mt-6"
        v-show="totalItems"
        layout="total, sizes, prev, pager, next, jumper"
        v-model:page="currentPage"
        v-model:limit="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        :total="totalItems"
      >
      </el-pagination>
    </el-card>

    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="downloadFailRecord">导出失败记录</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="batchImport" lang="ts">
import { globalHeaders } from "@/utils/request";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps({
    dialog: {
        type: Object,
        default: null
    }
});
const emits = defineEmits(['cancel']);

//  弹窗
const visible = computed({
  get() {
    return props.dialog.visible
  },
  set(newVal) {
    return newVal
  }
})

//  上传
const upload = reactive({
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/manager/profile/import"
})
const fileList = ref([])
const paginatedData = ref([]);
const totalItems = ref(0);
const uploadData = ref({})

//  表格
const tableData = ref([])
const currentPage = ref(1);
const pageSize = ref(10);
const buttonLoading = ref(false);
const errorToken = ref();

function handleRemove() {
  paginatedData.value = [];
  totalItems.value = 0;
};

function beforeUpload(file: any) {
  let type = file.name.substr((file.name.lastIndexOf(".")))
  if (type != '.xlsx') {
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

function uploadFileSuccess(res: any) {
  if (res.code == 200) {
    proxy?.$modal.msgSuccess("文件上传成功");
    tableData.value = res.data.importResultList || [];
    errorToken.value = res.data.errorToken;
    totalItems.value = tableData.value.length;
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    paginatedData.value = tableData.value.slice(start, end);
  } else {
    proxy?.$modal.msgError("文件上传失败");
  }
}

const cancel = () => {
  totalItems.value = 0;
  paginatedData.value = [];
  fileList.value = [];
  tableData.value = [];
  emits('cancel');
}

const downloadFailRecord = () => {
    proxy?.download(`/manager/profile/importError/${errorToken.value}`, {}, `失败记录.xlsx`);
    cancel();
};

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
</script>
