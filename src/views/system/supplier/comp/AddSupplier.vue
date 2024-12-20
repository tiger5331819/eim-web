<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px">
    <el-form ref="addSupplierFormRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="DP+来源" prop="dp">
        <el-input v-model="form.dp" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="接口地址" prop="api">
        <el-input v-model="form.api" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="token地址" prop="token">
        <el-input v-model="form.token" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="ID" prop="id">
        <el-input v-model="form.id" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="password" prop="password">
        <el-input v-model="form.password" placeholder="请输入" />
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

<script setup name="addSupplier" lang="ts">
import { ref } from 'vue';
import { SupplierForm } from '../types';

const props = defineProps({
    dialog: {
        type: Object,
        default: null
    },
    detail: {
        type: Object,
        default: null
    }
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
const initFormData: SupplierForm = {
    supplierId: undefined,
    dp: undefined,
    api: undefined,
    token: undefined,
    id: undefined,
    password: undefined,
};
const data = reactive({
    form: { ...initFormData },
    rules: {
        dp: [
            { required: true, message: "DP+来源不能为空", trigger: "blur" }
        ]
    }
});
const { form, rules } = toRefs(data);

//  表单
const addSupplierFormRef = ref<ElFormInstance>();

/** 确定 */
const submitForm = () => {
    addSupplierFormRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            // form.value.id ? await update(form.value) : await add(form.value);
            // proxy?.$modal.msgSuccess("新增成功");
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
    form.value = { ...initFormData };
    addSupplierFormRef.value?.resetFields();
}

/** 监听是否为编辑 */
watch(() => props.dialog, v => {
  if (v.title == '编辑') {
    //  以下都应该有后台返回
    form.value.dp = props.detail.eid;
    form.value.api = props.detail.eid;
    form.value.token = props.detail.eid;
    form.value.id = props.detail.eid;
    form.value.password = props.detail.eid;
  } else {
    reset();
  }
}, { deep: true, immediate: true });
</script>
