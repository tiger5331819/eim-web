<script setup lang="ts">
import type { SwitchProps } from 'antdv-next';

import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OperatorVo } from '#/api/system/operator/model';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { EnableStatus } from '@vben/constants';

import { Popconfirm, Space } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  operatorChangeStatus,
  operatorExport,
  operatorList,
  operatorRemove,
} from '#/api/system/operator';
import { ApiSwitch } from '#/components/global';
import { useBlobExport } from '#/utils/file/export';

import { columns, querySchema } from './data';
import operatorDrawer from './operator-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 90,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无运营商数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
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

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: OperatorVo) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

const { hasAccessByCodes } = useAccess();

function hasRelatedResources(row: OperatorVo) {
  return (row.profileCount ?? 0) > 0 || (row.apnCount ?? 0) > 0;
}

function handleDeleteClick(row: OperatorVo) {
  if (hasRelatedResources(row)) {
    window.message.warning(
      '该运营商下存在关联的APN或码号资源，无法删除，请先解除关联。',
    );
  }
}

async function handleDelete(row: OperatorVo) {
  if (hasRelatedResources(row)) {
    return;
  }
  await operatorRemove([row.id]);
  window.message.success('删除成功');
  await tableApi.query();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(operatorExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('运营商数据');
  exportBlob({ data: formValues, fileName });
}

function statusConfirmText(checked: SwitchProps['checked']) {
  return checked
    ? '确认启用该运营商吗？启用后该运营商的码号、APN等业务恢复操作'
    : '确认禁用该运营商吗？禁用后该运营商的码号、APN等业务禁止操作';
}

async function handleChangeStatus(
  checked: SwitchProps['checked'],
  row: OperatorVo,
) {
  await operatorChangeStatus({
    id: row.id,
    status: checked ? EnableStatus.Enable : EnableStatus.Disable,
  });
  window.message.success('操作成功');
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <a-button
          type="primary"
          v-access:code="['eim:operator:add']"
          @click="handleAdd"
        >
          {{ $t('pages.common.add') }}
        </a-button>
      </template>
      <template #toolbar-tools>
        <a-button
          v-access:code="['eim:operator:export']"
          :loading="exportLoading"
          :disabled="exportLoading"
          @click="handleExport"
        >
          {{ $t('pages.common.export') }}
        </a-button>
      </template>

      <template #status="{ row }">
        <ApiSwitch
          :value="row.status === EnableStatus.Enable"
          :api="(checked) => handleChangeStatus(checked, row)"
          :confirm="true"
          :confirm-text="statusConfirmText"
          :disabled="!hasAccessByCodes(['eim:operator:edit'])"
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
            v-if="!hasRelatedResources(row)"
            placement="left"
            title="确认删除该运营商吗？删除后不可恢复。"
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
          <action-button
            v-else
            danger
            v-access:code="['eim:operator:remove']"
            @click="handleDeleteClick(row)"
          >
            {{ $t('pages.common.delete') }}
          </action-button>
        </Space>
      </template>
    </BasicTable>
    <OperatorDrawer @reload="tableApi.query()" />
  </Page>
</template>
