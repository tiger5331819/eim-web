<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px">
    <el-form ref="allocationFormRef" :model="form" :rules="rules" label-width="100px">
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
      <el-form-item v-if="form.productionBatch" label="数量" prop="size">
        <el-input-number v-model="form.size" controls-position="right" :min="1" :max="allowNum" :disabled="!allowNum"></el-input-number>
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

<script setup name="resourceAllocation" lang="ts">
import { allBatchList, batchAllowableNumber, handleAllocation } from '@/api/system/profile';
import { getCompanyDict, getProjectDict } from '../../cardImport/hooks/useGetDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const props = defineProps({
    dialog: {
        type: Object,
        default: null
    },
});
const emits = defineEmits(['submit', 'close']);

// 弹窗控制
const visible = computed({
    get() {
        return props.dialog.visible;
    },
    set(val) {
        return val;
    }
});

//  表单数据
const initFormData: any = {
  productionBatch: undefined,
  projectId: undefined,
  size: undefined,
};
const data = reactive({
    form: { ...initFormData },
    rules: {
        productionBatch: [
            { required: true, message: "请选择批次", trigger: "blur" }
        ],
        projectId: [
            { required: true, message: "请选择项目", trigger: "blur" }
        ],
        size: [
            { required: true, message: "请输入数量", trigger: "blur" }
        ],
    }
});
const { form, rules } = toRefs(data);

//  表单
const allocationFormRef = ref<ElFormInstance>();
const allowNum = ref();
const company = ref();

//  字典
const batchDict = ref();
const companyDict = ref();
const projectDict = ref();

/** 更新字典 */
const updateDict = async () => {
  const res = await allBatchList();
  batchDict.value = res.data.map((item: any) => {
    const _item = {
      label: item,
      value: item
    };
    return _item;
  });
  companyDict.value = await getCompanyDict();
};

/** 批次发生变更 */
const batchChange = async () => {
  if (form.value.productionBatch) {
        const res = await batchAllowableNumber(form.value.productionBatch);
        allowNum.value = res.data;
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
    allocationFormRef.value?.validate(async (valid: boolean) => {
      if (valid) {
          await handleAllocation(form.value);
          proxy?.$modal.msgSuccess('分配成功');
          emits('submit');
      }
    });
};
/** 取消 */
const cancel = () => {
    form.value = { ...initFormData };
    allocationFormRef.value?.resetFields();
    emits('close');
};

/** 重置 */
const reset = () => {
    allowNum.value = 0;
    company.value = '';
    form.value = { ...initFormData };
    allocationFormRef.value?.resetFields();
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
