<script setup lang="ts">
import type { SwitchProps } from 'antdv-next';

import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OperatorVo } from '#/api/system/operator/model';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { EnableStatus } from '@vben/constants';

import { Popconfirm, Space } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  operatorExport,
  operatorList,
  operatorRemove,
  operatorUpdate,
} from '#/api/system/operator';
import { ApiSwitch } from '#/components/global';
import { useBlobExport } from '#/utils/file/export';

import { columns, querySchema } from './data';
import BatchImportModal from './batch-import-modal.vue';
import operatorDrawer from './operator-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await operatorList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'eim-operator-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [OperatorDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: operatorDrawer,
});

const [BatchImportModalCmp, importModalApi] = useVbenModal({
  connectedComponent: BatchImportModal,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: OperatorVo) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleDelete(row: OperatorVo) {
  await operatorRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: OperatorVo) => row.id);
  window.modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await operatorRemove(ids);
      await tableApi.query();
    },
  });
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(operatorExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('运营商数据');
  exportBlob({ data: formValues, fileName });
}

function handleBatchImport() {
  importModalApi.setData({});
  importModalApi.open();
}

async function handleChangeStatus(
  checked: SwitchProps['checked'],
  row: OperatorVo,
) {
  await operatorUpdate({
    id: row.id,
    status: checked ? EnableStatus.Enable : EnableStatus.Disable,
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="运营商列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['eim:operator:export']"
            :loading="exportLoading"
            :disabled="exportLoading"
            @click="handleExport"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            v-access:code="['eim:operator:add']"
            @click="handleBatchImport"
          >
            批量导入
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['eim:operator:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['eim:operator:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <ApiSwitch
          :value="row.status === EnableStatus.Enable"
          :api="(checked) => handleChangeStatus(checked, row)"
          @reload="tableApi.query()"
        />
      </template>
      <template #action="{ row }">
        <Space>
          <action-button
            v-access:code="['eim:operator:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </action-button>
          <Popconfirm
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <action-button
              danger
              v-access:code="['eim:operator:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <OperatorDrawer @reload="tableApi.query()" />
    <BatchImportModalCmp @reload="tableApi.query()" />
  </Page>
</template>
