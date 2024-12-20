<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px">
    <el-form ref="creatProjectRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="企业编号" prop="cNumber">
        <el-input v-model="form.cNumber" disabled />
      </el-form-item>
      <el-form-item label="企业名称" prop="cName">
        <el-input v-model="form.cName" disabled />
      </el-form-item>
      <el-form-item v-if="isEdit" label="项目编号" prop="number">
        <el-input v-model="form.number" disabled />
      </el-form-item>
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="有效时间" prop="time">
        <el-date-picker v-model="form.time" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
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

<script setup name="CreatProject" lang="ts">
import { ref, computed, toRefs, watch } from 'vue';
import { ProjectForm } from '../types';

const props = defineProps({
    dialog: {
        type: Object,
        default: null
    },
    parent: {
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
const initFormData: ProjectForm = {
    cName: 'test名称1',
    cNumber: '001',
    id: undefined,
    number: undefined,
    name: undefined,
    time: undefined,
    remark: undefined
};
const data = reactive({
    form: { ...initFormData },
    rules: {
        name: [
            { required: true, message: "项目名称不能为空", trigger: "blur" }
        ],
        time: [
            { required: true, message: "请选择有效时间", trigger: "blur" }
        ]
    }
});
const { form, rules } = toRefs(data);
const isEdit = ref(false);

//  表单
const creatProjectRef = ref<ElFormInstance>();

/** 确定 */
const submitForm = () => {
    creatProjectRef.value?.validate(async (valid: boolean) => {
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
    isEdit.value = false;
    form.value = { ...initFormData };
    creatProjectRef.value?.resetFields();
}

/** 监听是否为编辑 */
watch(() => props.dialog, v => {
  if (v.title == '编辑项目') {
    isEdit.value = true;
    //  以下都应该有后台返回
    form.value.number = '001001';
    form.value.id = props.parent.deptName;
    form.value.name = props.parent.deptName;
    form.value.remark = props.parent.deptName;
  } else {
    reset();
  }
}, { deep: true, immediate: true });
</script>
