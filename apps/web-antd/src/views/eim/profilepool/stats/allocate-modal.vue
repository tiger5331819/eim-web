<script setup lang="ts">
import { ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { poolAllocate } from '#/api/system/profile-pool';
import { batchAllowableNumber } from '#/api/system/profile';
import {
  getProjectDict,
  getTenantDict,
} from '#/views/system/cardImport/hooks/useGetDict';

const emit = defineEmits<{ reload: [] }>();

const canAssign = ref<number>(0);
const presetBatch = ref<string | undefined>(undefined);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 110 },
  schema: [
    {
      component: 'Input',
      fieldName: 'productionBatch',
      label: '生产批次',
      rules: 'required',
      componentProps: {
        placeholder: '请输入批次号',
        onChange: async (e: any) => {
          const val = typeof e === 'string' ? e : e?.target?.value;
          if (val) {
            const data = await batchAllowableNumber(val);
            canAssign.value = (data as any)?.data ?? data ?? 0;
          } else {
            canAssign.value = 0;
          }
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'canAssignDisplay',
      label: '可分配数量',
      componentProps: {
        disabled: true,
        placeholder: '输入批次后显示',
      },
    },
    {
      component: 'Select',
      fieldName: 'tenantId',
      label: '目标租户',
      rules: 'required',
      componentProps: {
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择租户',
        options: [],
        onChange: async (tenantId: any) => {
          if (tenantId) {
            const opts = await getProjectDict(tenantId);
            formApi.updateSchema([
              { fieldName: 'projectId', componentProps: { options: opts } },
            ]);
            formApi.setValues({ projectId: undefined });
          }
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'projectId',
      label: '目标项目',
      componentProps: {
        placeholder: '请先选择租户',
        options: [],
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'size',
      label: '分配数量',
      rules: 'required',
      componentProps: {
        min: 1,
        style: 'width: 100%',
        placeholder: '请输入数量',
      },
    },
  ],
  showDefaultActions: false,
});

// 把 canAssign 推到表单展示字段
watch(canAssign, (v) => {
  formApi.setValues({ canAssignDisplay: String(v) });
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: async () => {
    await formApi.resetForm();
    canAssign.value = 0;
    presetBatch.value = undefined;
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);

    const data = modalApi.getData() as { productionBatch?: string } | undefined;
    presetBatch.value = data?.productionBatch;

    // 加载租户下拉
    const tenants = await getTenantDict();
    formApi.updateSchema([
      { fieldName: 'tenantId', componentProps: { options: tenants } },
    ]);

    // 若有预填批次，自动加载可分配数量
    if (presetBatch.value) {
      await formApi.setValues({ productionBatch: presetBatch.value });
      const res = await batchAllowableNumber(presetBatch.value);
      canAssign.value = (res as any)?.data ?? res ?? 0;
    }

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    if (values.size > canAssign.value) {
      window.message.warning(`分配数量不能超过可分配数量 ${canAssign.value}`);
      return;
    }
    await poolAllocate({
      productionBatch: values.productionBatch,
      tenantId: values.tenantId,
      projectId: values.projectId,
      size: values.size,
    });
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}
</script>

<template>
  <BasicModal title="分配到租户池" class="w-[520px]">
    <div
      class="mb-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    >
      将指定批次的码号分配给目标租户的资源池。分配后租户即可在自己的池中下载使用。
    </div>
    <BasicForm />
  </BasicModal>
</template>
