<template>
  <el-dialog title="APN更新" v-model="dialogVisible" append-to-body>
    <el-form class="mt-10" ref="formRef" :rules="rules" :model="form" label-width="100px">
      <el-form-item label="ICCID" prop="iccid">
        <el-input v-model="form.iccid" disabled placeholder="请输入" />
      </el-form-item>
      <el-form-item label="APNID" prop="apnId">
        <SelectPro v-model="form.apnId" valueKey="id" labelKey="name" :request="listApn" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="dialogVisible = false" type="default">取消</el-button>
        <el-button @click="submit" type="primary">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { updateProfileApn } from "@/api/system/profile/index";
import { listApn} from '@/api/system/apn';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps(['visible','row']);
const emits = defineEmits(['update:visible','success']);
const dialogVisible = useVModel(props, 'visible', emits);

const form = reactive<any>(props.row ? { iccid: props.row.iccid,id:props.row.id } : {});
const formRef = ref<ElFormInstance>();

const rules = {
  apnId: [{ required: true, message: 'APNId不能为空', trigger: 'change' }],

};

const submit = () => {
    let eid = localStorage.getItem('eid')
    formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
        await updateProfileApn({id:props.row.id,apnId:form.apnId});
        proxy?.$modal.msgSuccess('更新成功');
        dialogVisible.value = false;
        emits('success');
        }
    });
};
</script>

<style lang="scss" scoped></style>
