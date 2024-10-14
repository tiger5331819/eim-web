<template>
  <div class="p-2">
    <div class="search" v-show="showSearch">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="88px">
        <el-form-item label="EID" prop="eid">
          <el-input v-model="queryParams.eid" placeholder="请输入EID" clearable style="width: 240px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="ICCID" prop="iccid">
          <el-input v-model="queryParams.iccid" placeholder="请输入ICCID" clearable style="width: 240px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="运营商" prop="providerName">
          <el-input v-model="queryParams.providerName" placeholder="请输入运营商" clearable style="width: 240px"
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
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleUpdate">批量导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button class="mr-2" type="default" @click="handleDownload">下载批量导入模板</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="cardData">
        <el-table-column label="序号" align="center" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="EID" align="center" prop="eid" />
        <el-table-column label="预制种子号ICCID" align="center" prop="iccid" />
        <el-table-column label="预制EIM" align="center" prop="eimFqdn" />
        <el-table-column label="制卡商" align="center" prop="cardProviderName" />
        <el-table-column label="运营商" align="center" prop="providerName" />
        <el-table-column label="操作时间" sortable align="center" prop="creationTime">
          <!-- <template #default="scope">
            <span>{{ parseTime(scope.row.enterTime, '{y}-{m}-{d}') }}</span>
          </template> -->
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 导入卡明细对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1200px" append-to-body @close="cancel">
      <div class="mt-4" style="position: relative;">
        <el-upload style="width: auto;" accept=".xlsx" :headers="upload.headers" :action="upload.url"
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
                    2、只支持xlsx格式文件，其中EID、制卡商、运营商信息为必填内容；预制种子号ICCID、预制EIM为非必填信息；
                  </div>
                </el-col>
              </el-row>
            </div>
          </template>
        </el-upload>
      </div>
      <el-card class=" mt-8">
        <el-table :data="paginatedData">
          <el-table-column label="EID" align="center" prop="eid" />
          <el-table-column label="预制种子号ICCID" align="center" prop="iccid" />
          <el-table-column label="预制EIM" align="center" prop="eimFqdn" />
          <el-table-column label="制卡商" align="center" prop="cardProviderName" />
          <el-table-column label="运营商" align="center" prop="providerName" />
          <el-table-column label="数据校验" align="center" prop="result" />
        </el-table>
        <el-pagination class="mt-6" v-show="totalItems" layout="total, sizes, prev, pager, next, jumper"
          v-model:page="currentPage" v-model:limit="pageSize" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 50]"
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
import { ref, getCurrentInstance, toRefs, ComponentInternalInstance, reactive, nextTick } from "vue"
import { cardList, cardImport } from '@/api/system/cardImport';
import { globalHeaders } from "@/utils/request";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const fileList = ref([])

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
  url: import.meta.env.VITE_APP_BASE_API + "/manager/seed/importWithOptions"
})


const cardData = ref([]);
const buttonLoading = ref(false);
const loading = ref(true);
const isDisabled = ref(true);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    eid: undefined,
    iccid: undefined,
    eimFqdn: undefined,
    providerName: undefined,
    cardProviderName: undefined,
    createTime: undefined,
    isAsc: <any>undefined,
    params: {
    },
  },

});

const { queryParams } = toRefs(data);

/** 查询卡信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await cardList(queryParams.value);
  cardData.value = res.rows;
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
function uploadFileSuccess(res: any) {
  if (res.code == 200) {
    proxy?.$modal.msgSuccess("文件上传成功");
    isDisabled.value = false
    tableData.value = res.data || [];
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

/** 导出按钮操作 */
const handleDownload = () => {
  proxy?.download('manager/seed/importTemplate', {
  }, `卡信息记录_批量模板.xlsx`)
}

onMounted(() => {
  getList();
})

/**完成批量导入 */
const finish = async () => {
  let newData = tableData.value.map((obj:any) => {
    return {
      eid: obj.eid,
      iccid: obj.iccid,
      eimFqdn: obj.eimFqdn,
      providerName: obj.providerName,
      cardProviderName: obj.cardProviderName,
    }
  })
  let res = await cardImport({ seedList: newData });
  if (res.code === 200) {
    dialog.value.visible = false;
    proxy?.$modal.msgSuccess("操作成功");
    getList();
  }
}

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