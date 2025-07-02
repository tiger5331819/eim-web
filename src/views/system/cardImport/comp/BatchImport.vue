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
                <div class="el-upload__tip m-2" style="font-size: 16px">
                  2、只支持xlsx格式文件，其中EID、制卡商、运营商、批次信息为必填内容；预制种子号ICCID、预制EIM为非必填信息；
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-upload>
    </div>
    <el-card v-if="paginatedData.length > 0" class=" mt-8">
      <p>导入失败记录</p>
      <el-table :data="paginatedData">
        <el-table-column
          v-for="(item, index) in tableColumn"
          :key="index"
          :label="item.label"
          :width="item.width"
          :align="item.align"
          :prop="item.prop"
        >
          <!-- 插槽预留 -->
          <template v-if="item.slot == 'required'" #header>
            <span style="color: #ff6c00; margin-right: 5px;">*</span>
            <span>{{item.label }}</span>
          </template>
        </el-table-column>
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

    <template v-if="paginatedData.length > 0" #footer>
      <div class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="downloadFailRecord">导出失败记录</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="batchImport" lang="ts">
import { globalHeaders } from "@/utils/request";
import { ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps({
    dialog: {
        type: Object,
        default: null
    }
});
const emits = defineEmits(['close', 'submit']);

//  弹窗
const visible = computed({
  get() {
    return props.dialog.visible
  },
  set(newVal) {
    return newVal
  }
});

//  上传
const upload = reactive({
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/manager/seed/importWithOptions"
});
const fileList = ref([])
const paginatedData = ref([]);
const totalItems = ref(0);
const uploadData = ref({})


//  表格
const tableData = ref([]);
const tableColumn = reactive([
    { label: 'EID', width: '', align: 'center', prop: 'eid', slot: 'required' },
    { label: '预制种子号ICCID', width: '', align: 'center', prop: 'iccid' },
    { label: '预制EIM', width: '', align: 'center', prop: 'eimFqdn' },
    { label: '制卡商', width: '', align: 'center', prop: 'cardProviderName', slot: 'required' },
    { label: '运营商', width: '', align: 'center', prop: 'providerName', slot: 'required' },
    { label: '批次', width: '', align: 'center', prop: 'productionBatch', slot: 'required' },
    { label: '所属租户', width: '', align: 'center', prop: 'companyName' },
    { label: '所属项目', width: '', align: 'center', prop: 'projectName' },
    { label: '数据校验', width: '', align: 'center', prop: 'result' },
]);
//  分页器
const currentPage = ref(1);
const pageSize = ref(10);

//  按钮控制
const buttonLoading = ref(false);
const errorToken = ref();
const uploadSuccess = ref(false);

function handleRemove() {
  paginatedData.value = [];
  totalItems.value = 0;
};

function beforeUpload(file: any) {
  let type = file.name.substr((file.name.lastIndexOf(".")))
  if (type != '.xlsx') {
    proxy?.$modal.msgError("文件格式错误");
    return false;
  }
  return ElMessageBox.confirm('确认批量导入吗？')
  .then(() => {
    return true;
  })
  .catch(() => {
    return false;
  })
}

function uploadFileSuccess(res: any) {
  if (res.code == 200) {
    uploadSuccess.value = true;
    // proxy?.$modal.msgSuccess("文件上传成功");
    ElMessageBox.confirm(
      '导入完成',
      '提示',
      {
        showCancelButton: false
      }
    ).then(() => {
      return true;
    })
    tableData.value = res.data.importResultList || [];
    errorToken.value = res.data.errorToken;
    totalItems.value = tableData.value.length;
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    paginatedData.value = tableData.value.slice(start, end);
  } else {
    proxy?.$modal.msgError("文件上传失败");
    init();
    uploadSuccess.value = false;
  }
}

const init = () => {
  totalItems.value = 0;
  paginatedData.value = [];
  fileList.value = [];
  tableData.value = [];
};

const cancel = () => {
  init();
  uploadSuccess.value? emits('submit') : emits('close');
};

const downloadFailRecord = () => {
    proxy?.download(`/manager/seed/importError/${errorToken.value}`, {}, `失败记录.xlsx`);
    init();
    emits('submit');
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
