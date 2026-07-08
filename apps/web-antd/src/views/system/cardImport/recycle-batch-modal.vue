<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { InventoryRecycleRecordVo } from '#/api/system/inventory/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  inventoryRecycleBatch,
  inventoryRecycleRecordList,
} from '#/api/system/inventory';

import {
  recycleRecordColumns,
  recycleRecordQuerySchema,
} from './data';

const emit = defineEmits<{ reload: [] }>();

const step = ref<1 | 2>(1);
const selectedRecord = ref<InventoryRecycleRecordVo | null>(null);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: recycleRecordQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
};

const gridOptions: VxeGridProps = {
  columns: recycleRecordColumns,
  height: 360,
  keepSource: true,
  emptyText: '暂无分配记录',
  toolbarConfig: {
    refresh: false,
    zoom: false,
    custom: false,
  },
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await inventoryRecycleRecordList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  radioConfig: {
    checkMethod: ({ row }: { row: InventoryRecycleRecordVo }) =>
      (row.recyclableCount ?? 0) > 0,
    highlight: true,
    strict: true,
  },
  rowConfig: { keyField: 'changeNo' },
  id: 'inventory-recycle-record-select',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

const recyclableCount = computed(
  () => selectedRecord.value?.recyclableCount ?? 0,
);

const [ConfirmForm, confirmFormApi] = useVbenForm({
  commonConfig: { labelWidth: 110 },
  schema: [
    {
      component: 'Input',
      fieldName: 'changeNo',
      label: '变动编号',
      componentProps: { disabled: true },
    },
    {
      component: 'Input',
      fieldName: 'tenantName',
      label: '租户',
      componentProps: { disabled: true },
    },
    {
      component: 'Input',
      fieldName: 'assignCount',
      label: '分配数量',
      componentProps: { disabled: true },
    },
    {
      component: 'Input',
      fieldName: 'operateTime',
      label: '操作时间',
      componentProps: { disabled: true },
    },
    {
      component: 'Input',
      fieldName: 'nonRecyclableCount',
      label: '不可回收',
      componentProps: { disabled: true },
    },
    {
      component: 'Input',
      fieldName: 'recyclableCountDisplay',
      label: '可回收数量',
      componentProps: { disabled: true },
    },
    {
      component: 'InputNumber',
      fieldName: 'size',
      label: '回收数量',
      rules: 'required',
      componentProps: {
        min: 1,
        precision: 0,
        style: 'width: 100%',
        placeholder: '请输入回收数量',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '请输入备注',
      },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  showConfirmButton: false,
  showCancelButton: false,
  onOpenChange(isOpen) {
    if (!isOpen) return;
    step.value = 1;
    selectedRecord.value = null;
    tableApi.query();
  },
  onClosed() {
    step.value = 1;
    selectedRecord.value = null;
    confirmFormApi.resetForm();
  },
});

const modalTitle = computed(() =>
  step.value === 1 ? '选择分配记录' : '确认回收',
);

function handleNext() {
  const row = tableApi.grid?.getRadioRecord?.() as
    | InventoryRecycleRecordVo
    | undefined;
  if (!row?.changeNo || !row.tenantId) {
    window.message.warning('请选择一条分配记录');
    return;
  }
  if ((row.recyclableCount ?? 0) <= 0) {
    window.message.warning('该批次已无设备可回收，请返回重新选择');
    return;
  }
  selectedRecord.value = row;
  step.value = 2;
  confirmFormApi.setValues({
    changeNo: row.changeNo,
    tenantName: row.tenantName || '--',
    assignCount: row.assignCount ?? '--',
    operateTime: row.operateTime || '--',
    nonRecyclableCount: row.nonRecyclableCount ?? 0,
    recyclableCountDisplay: row.recyclableCount ?? 0,
    size: 1,
  });
}

function handleBack() {
  step.value = 1;
}

async function handleConfirm() {
  if (step.value === 1) {
    handleNext();
    return;
  }

  try {
    modalApi.lock(true);
    const { valid } = await confirmFormApi.validate();
    if (!valid || !selectedRecord.value) return;

    const values = cloneDeep(await confirmFormApi.getValues());
    const max = recyclableCount.value;
    if ((values.size ?? 0) > max) {
      window.message.warning(`回收数量不能超过 ${max}`);
      return;
    }
    if (max <= 0) {
      window.message.warning('该批次已无设备可回收，请返回重新选择');
      return;
    }

    await inventoryRecycleBatch({
      changeNo: selectedRecord.value.changeNo!,
      tenantId: selectedRecord.value.tenantId!,
      size: values.size,
      remark: values.remark,
    });
    window.message.success('回收成功');
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
  <BasicModal :title="modalTitle" class="w-[760px]">
    <BasicTable v-if="step === 1" />

    <ConfirmForm v-else />

    <template #footer>
      <a-button @click="modalApi.close()">取消</a-button>
      <a-button v-if="step === 2" @click="handleBack">上一步</a-button>
      <a-button type="primary" @click="handleConfirm">
        {{ step === 1 ? '下一步' : '确认回收' }}
      </a-button>
    </template>
  </BasicModal>
</template>
