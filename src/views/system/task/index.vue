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
          <el-input v-model="queryParams.handlePeople" placeholder="请输入操作人" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
      <template #header>
        <el-button type="primary" @click="cancel">取消任务</el-button>
      </template>
      <el-table
        ref="taskTable"
        v-loading="loading"
        :data="taskData"
        :header-row-style="{ textAlign: 'center', height: '50px' }"
        :row-key="getRowKey"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" :selectable="selectAble" :reserve-selection="true" />
        <el-table-column label="ICCID" align="center" prop="iccid" />
        <el-table-column label="EID" width="400" align="center" prop="eid" />
        <el-table-column label="进度条" align="center" prop="downloadRate" />
        <el-table-column label="创建时间" align="center" prop="creationTime" />
        <el-table-column label="状态" align="center" prop="state">
          <template #default="scope">
            <dict-tag :options="sys_task_status" :value="scope.row.state" />
          </template>
        </el-table-column>
        <el-table-column label="操作时间" align="center" prop="operatorTime" />
        <el-table-column label="操作人" align="center" prop="operatorUser" />
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="task" lang="ts">
import { taskList, cancelTask } from '@/api/system/task';
import { QueryFrom, TaskTable } from '@/api/system/task/types';
import { parseTime } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const queryFormRef = ref();
const { sys_task_status } = toRefs<any>(proxy?.useDict('sys_task_status'));

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        state: undefined,
        operatorUser: undefined,
        handleTime: [],
        startCreationTime: undefined,
        endCreationTime: undefined,
    } as QueryFrom
});

const { queryParams } = toRefs(data);
const loading = ref(true);
const taskData = ref<TaskTable>();
const multipleSelection = ref();
const total = ref(0);

/** 查询设备列表 */
const getList = async () => {
  loading.value = true;
  if (queryParams.value.handleTime) {
    queryParams.value.startCreationTime = parseTime(queryParams.value.handleTime[0]) as string;
    queryParams.value.endCreationTime = parseTime(queryParams.value.handleTime[1]) as string;
  }
  const res = await taskList(queryParams.value);
  taskData.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 设置row-key */
function getRowKey(row: any) {
  return row.id;
};

const handleSelectionChange = (item: TaskTable[]) => {
  multipleSelection.value = item;
};

/** 取消任务 */
const cancel = async() => {
  if (!multipleSelection.value || multipleSelection.value.length === 0) {
    proxy?.$modal.msgError("请选择取消的任务");
  } else {
    const ids = multipleSelection.value.map((item: TaskTable) => {
      return item.id
    })
    const res = await cancelTask(ids);
    if (res.code == 200) {
      proxy?.$modal.msgSuccess("操作成功");
      multipleSelection.value = [];
      getList();
    } else {
      proxy?.$modal.msgError("操作失败");
    }
  }
};

/** 多选按钮控制 */
const selectAble = (row: TaskTable) => {
  if (row.state == 0) {
    return true;
  } else {
    return false;
  }
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

onMounted(() => {
  getList();
});
</script>
