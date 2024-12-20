<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px">
    <el-form ref="addSupplierFormRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="批次" prop="batch">
        <el-select v-model="form.batch" placeholder="请选择" clearable style="width: 300px;" @change="batchChange">
          <el-option v-for="dict in sys_device_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="允许分配数量">
        <el-input style="width: 300px;" v-model="form.allowNum" placeholder="上述条件全部输入完成后，进行统计" disabled />
      </el-form-item>
      <el-form-item label="归属企业" prop="company">
        <el-select v-model="form.company" placeholder="请选择" clearable style="width: 300px;">
          <el-option v-for="dict in sys_device_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称" prop="project">
        <el-select v-model="form.project" placeholder="请选择" clearable style="width: 300px;">
          <el-option v-for="dict in sys_device_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.batch" label="数量" prop="count">
        <el-input-number v-model="form.count" controls-position="right" :min="1" :max="maxNum"></el-input-number>
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
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_status } = toRefs<any>(proxy?.useDict('sys_device_status'));

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
    batch: undefined,
    company: undefined,
    project: undefined,
    count: undefined,
    allowNum: undefined
};
const data = reactive({
    form: { ...initFormData },
    rules: {
        batch: [
            { required: true, message: "请选择批次", trigger: "blur" }
        ],
        company: [
            { required: true, message: "请选择归属企业", trigger: "blur" }
        ],
        project: [
            { required: true, message: "请选择项目", trigger: "blur" }
        ],
        count: [
            { required: true, message: "请输入数量", trigger: "blur" }
        ],
    }
});
const { form, rules } = toRefs(data);

//  表单
const allocationFormRef = ref<ElFormInstance>();
//  可输入最大值
const maxNum = ref(0);
/** 批次发生变更 */
const batchChange = () => {
    form.value.allowNum = 886;
    form.value.count = 886;
    maxNum.value = 886;
};

/** 确定 */
const submitForm = () => {
    allocationFormRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            // form.value.id ? await update(form.value) : await add(form.value);
            // proxy?.$modal.msgSuccess("新增成功");
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
</script>
