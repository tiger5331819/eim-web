<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px" @close="cancel">
    <el-form ref="creatProjectRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="企业编号" prop="cNumber">
        <el-input v-model="cNumber" disabled />
      </el-form-item>
      <el-form-item label="企业名称" prop="cName">
        <el-input v-model="cName" disabled />
      </el-form-item>
      <el-form-item v-if="isEdit" label="项目编号" prop="id">
        <el-input v-model="form.id" disabled />
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
import { getCompanyDetail, getProjectDetail, addProject, updateProject } from '@/api/system/company';
import { ProjectForm } from "@/api/system/company/types";
import { parseTime } from '@/utils/ruoyi';

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
    id: undefined,
    name: undefined,
    time: [],
    startTime: undefined,
    endTime: undefined,
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
const cNumber = ref();
const cName = ref();

const isEdit = ref(false);

//  表单
const creatProjectRef = ref<ElFormInstance>();

/** 获取父级企业编号及名称 */
const getParentInfo = async(id: string) => {
  const res = await getCompanyDetail(id);
  cNumber.value = res.data.companyCode;
  cName.value = res.data.name;
};

/** 确定 */
const submitForm = () => {
  creatProjectRef.value?.validate(async (valid: boolean) => {
      if (valid) {
          if (form.value.time) {
            form.value.startTime = parseTime(form.value.time[0]) as string;
            form.value.endTime = parseTime(form.value.time[1]) as string;
          }
          delete form.value.time;
          isEdit.value && form.value.id ? await updateProject(props.parent.companyId, form.value.id, form.value) : await addProject(props.parent.id, form.value);
          let _message = isEdit.value ? '编辑成功' : "新增成功";
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
    form.value = { ...initFormData };
    creatProjectRef.value?.resetFields();
}

/** 监听是否为编辑 */
watch(() => props.dialog, async (v) => {
  if (v.title == '编辑项目') {
    getParentInfo(props.parent.companyId);
    isEdit.value = true;
    const res = await getProjectDetail(props.parent.companyId, props.parent.id);
    form.value = res.data;
    form.value.time = [res.data.startTime, res.data.endTime];
  } else {
    getParentInfo(props.parent.id);
    reset();
  }
}, { deep: true, immediate: true });
</script>
