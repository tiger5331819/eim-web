<template>
  <el-dialog :title="dialog.title" v-model="visible" destroy-on-close append-to-body width="600px" @close="cancel">
    <el-form ref="projectRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item v-if="isAdmin" label="所属租户" prop="tenantId">
        <el-select v-model="form.tenantId" :disabled="isAdmin && isEdit" placeholder="请选择" clearable style="width: 100%;">
          <el-option v-for="dict in companyDict" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="有效期" prop="time">
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
import { getProjectDetail, addProject, updateProject, tenantList, tenantInfo } from '@/api/system/company';
import { ProjectForm } from "@/api/system/company/types";
import { parseTime } from '@/utils/ruoyi';
import useUserStore from "@/store/modules/user";

const { roles } = useUserStore();
const isAdmin = roles.includes('superadmin');
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

const companyDict = ref();

/** 更新字典 */
const updateDict = async () => {
    if (isAdmin) {
      const res = await tenantList();
      companyDict.value = res.rows.map((item: any) => {
        return {
          label: item.companyName,
          value: item.tenantId
        }
      })
    } else {
      const res = await tenantInfo();
      companyDict.value = [{
        label: res.data.companyName,
        value: res.data.tenantId
      }]
      form.value.tenantId = res.data.tenantId
    }
};

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
    tenantId: undefined,
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
        tenantId: [
            { required: true, message: "请选择租户", trigger: "change" }
        ]
    }
});
const { form, rules } = toRefs(data);
const isEdit = ref(false);

//  表单
const projectRef = ref<ElFormInstance>();

/** 确定 */
const submitForm = () => {
  projectRef.value?.validate(async (valid: boolean) => {
    if (valid) {
        if (form.value.time) {
          form.value.startTime = parseTime(form.value.time[0]) as string;
          form.value.endTime = parseTime(form.value.time[1]) as string;
        }
        delete form.value.time;
        isEdit.value && form.value.id ? await updateProject(form.value.tenantId as string, form.value.id, form.value) : await addProject(form.value.tenantId as string, form.value);
        let _message = isEdit.value ? '编辑成功' : "添加成功";
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
    projectRef.value?.resetFields();
}

/** 监听是否为编辑 */
watch(() => props.dialog, async (v) => {
  if (v.title == '编辑') {
    isEdit.value = true;
    const res = await getProjectDetail(props.detail.tenantId, props.detail.id);
    form.value = res.data;
    form.value.time = [res.data.startTime, res.data.endTime];
  } else {
    reset();
  }
  if (v.visible) {
    updateDict();
  }
}, { deep: true, immediate: true });
</script>
