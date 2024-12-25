<template>
  <div class="p-2">
    <div class="search">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="88px">
        <el-form-item label="任务类型" prop="taskType">
          <el-select v-model="queryParams.taskType" placeholder="请选择" clearable style="width: 240px">
            <el-option v-for="dict in sys_task_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="handlePeople">
          <el-input v-model="queryParams.handlePeople" placeholder="请输入EID" clearable style="width: 240px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="操作时间" prop="handleTime">
          <el-date-picker
            v-model="queryParams.handleTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="hover">
      <el-table ref="taskTable" v-loading="loading" :data="taskData" :header-row-style="{ textAlign: 'center', height: '50px' }">
        <el-table-column label="任务类型" align="center" prop="taskType" />
        <el-table-column label="文件名称" width="400" align="center" prop="taskType" />
        <el-table-column label="导入数" align="center" prop="taskType" />
        <el-table-column label="失败数" align="center" prop="taskType" />
        <el-table-column label="操作人" align="center" prop="taskType" />
        <el-table-column label="操作时间" align="center" prop="taskType" />
        <el-table-column label="状态" align="center" prop="taskType" />
        <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="导入记录下载" placement="top">
              <el-button link type="primary" icon="el-icon-download" @click="downloadRecord(scope.row)"> </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="task" lang="ts">
import { deviceList } from '@/api/system/device/index';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const queryFormRef = ref();
const { sys_task_status } = toRefs<any>(proxy?.useDict('sys_task_status'));

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskType: undefined,
        handlePeople: undefined,
        handleTime: undefined,
        status: undefined,
    }
});

const { queryParams } = toRefs(data);
const loading = ref(true);
const taskData = ref<any>([]);
const total = ref(0);

/** 查询设备列表 */
const getList = async () => {
  loading.value = true;
  const res = await deviceList(queryParams.value);
  taskData.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};
/** 下载 */
const downloadRecord = (row) => {
    console.log(row, '>>> row');
};

onMounted(() => {
  getList();
});
</script>
