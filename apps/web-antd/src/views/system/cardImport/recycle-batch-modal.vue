<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { InventoryChangeLogVo } from '#/api/system/inventory-change/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { inventoryChangeLogList } from '#/api/system/inventory-change';
import { inventoryRecycleBatch } from '#/api/system/inventory';
import {
  formatTargetSourceTenant,
  getInventoryChangeTypeMeta,
} from '#/utils/inventoryChangeStatus';

import { recycleRecordColumns, recycleRecordQuerySchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const step = ref<1 | 2>(1);
const selectedRecord = ref<InventoryChangeLogVo | null>(null);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: recycleRecordQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
};

function resolveTenantId(row: InventoryChangeLogVo) {
  return row.tenantId || row.targetTenantId || row.sourceTenantId;
}

function resolveRecyclableCount(row: InventoryChangeLogVo) {
  return row.changeCount ?? 0;
}

function isAssignableRecycleRow(row: InventoryChangeLogVo) {
  const meta = getInventoryChangeTypeMeta(row.changeType, row.changeTypeText);
  return meta.text === '分配' && resolveRecyclableCount(row) > 0;
}

const gridOptions: VxeGridProps = {
  columns: recycleRecordColumns,
  height: 520,
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
    // 由 onOpened 触发加载，避免与全局 autoLoad 重复请求
    autoLoad: false,
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await inventoryChangeLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          // 批量回收仅可选「分配」类变动
          changeType: 'ASSIGN',
          ...formValues,
        });
      },
    },
  },
  radioConfig: {
    checkMethod: ({ row }: { row: InventoryChangeLogVo }) =>
      isAssignableRecycleRow(row),
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

const recyclableCount = computed(() =>
  selectedRecord.value ? resolveRecyclableCount(selectedRecord.value) : 0,
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
  },
  onOpened() {
    if (step.value === 1) {
      void tableApi.reload();
    }
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
    | InventoryChangeLogVo
    | undefined;
  if (!row?.changeNo || !resolveTenantId(row)) {
    window.message.warning('请选择一条分配记录');
    return;
  }
  if (!isAssignableRecycleRow(row)) {
    window.message.warning('该批次不可回收，请返回重新选择');
    return;
  }
  selectedRecord.value = row;
  step.value = 2;
  const count = resolveRecyclableCount(row);
  confirmFormApi.setValues({
    changeNo: row.changeNo,
    tenantName: formatTargetSourceTenant(row),
    assignCount: count,
    operateTime: row.operateTime || '--',
    recyclableCountDisplay: count,
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
    const tenantId = resolveTenantId(selectedRecord.value);
    if (!tenantId) {
      window.message.warning('缺少租户信息，无法回收');
      return;
    }
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
      tenantId,
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
    <div v-show="step === 1" class="min-h-[560px]">
      <BasicTable />
    </div>

    <ConfirmForm v-show="step === 2" />

    <template #footer>
      <a-button @click="modalApi.close()">取消</a-button>
      <a-button v-if="step === 2" @click="handleBack">上一步</a-button>
      <a-button type="primary" @click="handleConfirm">
        {{ step === 1 ? '下一步' : '确认回收' }}
      </a-button>
    </template>
  </BasicModal>
</template>
