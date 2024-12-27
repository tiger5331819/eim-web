<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px" @close="cancel">
    <el-form ref="AllocationCardRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="批次" prop="productionBatch">
        <el-select v-model="form.productionBatch" placeholder="请选择" clearable style="width: 300px;" @change="batchChange">
          <el-option v-for="dict in batchDict" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="允许分配数量">
        <el-input style="width: 300px;" v-model="allowNum" placeholder="上述条件全部输入完成后，进行统计" disabled />
      </el-form-item>
      <el-form-item label="归属企业" prop="company">
        <el-select v-model="company" placeholder="请选择" clearable style="width: 300px;" @change="companyChange">
          <el-option v-for="dict in companyDict" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="归属项目" prop="projectId">
        <el-select v-model="form.projectId" placeholder="请先选择归属企业" clearable :disabled="!company" style="width: 300px;">
          <el-option v-for="dict in projectDict" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="数量" prop="count">
        <el-input-number v-model="form.count" controls-position="right" :min="1" :max="allowNum" :disabled="!allowNum"></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="AllocationCard" lang="ts">
import { batchAllowableNumber, handleAllocation } from '@/api/system/cardImport';
import { AllocationForm } from "@/api/system/cardImport/types";
import { getBatchDict, getCompanyDict, getProjectDict } from '../hooks/useGetDict';

const props = defineProps({
    dialog: {
        type: Object,
        default: null
    }
});
const emits = defineEmits(['submit', 'close']);
const { proxy } = getCurrentInstance() as ComponentInternalInstance

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
const initAllocationForm: AllocationForm = {
    productionBatch: undefined,
    count: undefined,
    projectId: undefined,
};
const data = reactive({
    form: { ...initAllocationForm },
    rules: {
      productionBatch: [
            { required: true, message: "请选择批次", trigger: "blur" }
        ],
        projectId: [
            { required: true, message: "请选择项目", trigger: "blur" }
        ],
        count: [
            { required: true, message: "请分配数量", trigger: "blur" }
        ]
    }
});
const { form, rules } = toRefs(data);
const AllocationCardRef = ref<ElFormInstance>();
const allowNum = ref();
const company = ref();

//  字典
const batchDict = ref();
const companyDict = ref();
const projectDict = ref();

/** 更新字典 */
const updateDict = async () => {
    batchDict.value = await getBatchDict();
    companyDict.value = await getCompanyDict();
};

/** 批次发生变更 */
const batchChange = async () => {
    if (form.value.productionBatch) {
        const res = await batchAllowableNumber(form.value.productionBatch);
        allowNum.value = res.data.count;
    } else {
        allowNum.value = 0;
    }
};

/** 企业发生变更 */
const companyChange = async () => {
    if (company.value) {
        projectDict.value = await getProjectDict(company.value);
    }
}

/** 确定 */
const submitForm = () => {
    AllocationCardRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            form.value.productionBatch && await handleAllocation(form.value.productionBatch, form.value);
            proxy?.$modal.msgSuccess('分配成功');
            emits('submit');
        }
    });
}

/** 取消 */
const cancel = () => {
    emits('close');
}

/** 重置 */
const reset = () => {
    allowNum.value = 0;
    company.value = '';
    form.value = { ...initAllocationForm };
    AllocationCardRef.value?.resetFields();
}


/** 监听是否为编辑 */
watch(() => props.dialog, async (v) => {
  if (v.visible) {
    updateDict();
  } else {
    reset();
  }
}, { deep: true, immediate: true });
</script>
