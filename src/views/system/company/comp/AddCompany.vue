<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px" @close="cancel">
    <el-form ref="addCompanyRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item v-if="isEdit" label="企业编号" prop="companyCode">
        <el-input v-model="form.companyCode" disabled />
      </el-form-item>
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="form.remark"> </el-input>
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

<script setup name="addCompany" lang="ts">
import { getCompanyDetail, addCompany, updateCompany } from '@/api/system/company';
import { CompanyForm } from "@/api/system/company/types";

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
const initCompanyForm: CompanyForm = {
    id: undefined,
    companyCode: undefined,
    name: undefined,
    remark: undefined
};
const data = reactive({
    form: { ...initCompanyForm },
    rules: {
        name: [
            { required: true, message: "企业名称不能为空", trigger: "blur" }
        ]
    }
});
const { form, rules } = toRefs(data);
const isEdit = ref(false);

//  表单
const addCompanyRef = ref<ElFormInstance>();

/** 确定 */
const submitForm = () => {
    addCompanyRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            form.value.id ? await updateCompany(form.value.id, form.value) : await addCompany(form.value);
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
    isEdit.value = false;
    form.value = { ...initCompanyForm };
    addCompanyRef.value?.resetFields();
}

/** 监听是否为编辑 */
watch(() => props.dialog, async (v) => {
  if (v.title == '编辑') {
    isEdit.value = true;
    const res = await getCompanyDetail(props.detail.id);
    form.value = res.data;
  } else {
    reset();
  }
}, { deep: true, immediate: true });
</script>
