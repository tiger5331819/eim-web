<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px" @close="cancel">
    <el-form ref="addSupplierFormRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="DP+来源" prop="dpSource">
        <el-input v-model="form.dpSource" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="接口地址" prop="apiUrl">
        <el-input v-model="form.apiUrl" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="token地址" prop="tokenUrl">
        <el-input v-model="form.tokenUrl" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="ID" prop="accountId">
        <el-input v-model="form.accountId" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="password" prop="accountPassword">
        <el-input v-model="form.accountPassword" placeholder="请输入" />
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
import { getSupplierDetail, addSupplier, updateSupplier } from '@/api/system/supplier';
import { SupplierForm } from '@/api/system/supplier/types';

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

//  表单数据
const initFormData: SupplierForm = {
    id: undefined,
    dpSource: undefined,
    apiUrl: undefined,
    tokenUrl: undefined,
    accountId: undefined,
    accountPassword: undefined,
};
const data = reactive({
    form: { ...initFormData },
    rules: {
      dpSource: [
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
            form.value.id ? await updateSupplier(form.value) : await addSupplier(form.value);
            let _message = form.value.id ? '编辑成功' : "新增成功";
            proxy?.$modal.msgSuccess(_message);
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
watch(() => props.dialog, async(v) => {
  if (v.title == '编辑') {
    const res = await getSupplierDetail(props.detail.id);
    form.value = res.data;
  } else {
    reset();
  }
}, { deep: true, immediate: true });
</script>
