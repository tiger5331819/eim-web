<script setup lang="ts">
import type { SwitchProps } from 'antdv-next';

import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ApnVO } from '#/api/system/apn/model';

import { Page, useVbenModal } from '@vben/common-ui';
import { EnableStatus } from '@vben/constants';

import { Space } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  apnChangeStatus,
  apnExport,
  listApn,
  setDefaultApn,
} from '#/api/system/apn';
import { ApiSwitch } from '#/components/global';
import { useBlobExport } from '#/utils/file/export';

import ApnModal from './apn-modal.vue';
import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 90,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无APN配置数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await listApn({
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
  id: 'system-apn-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [ApnModalComp, modalApi] = useVbenModal({
  connectedComponent: ApnModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(record: ApnVO) {
  modalApi.setData({ id: record.id });
  modalApi.open();
}

function isDefaultApnDisabled(row: ApnVO) {
  return row.isDefault === '1' || row.status !== EnableStatus.Enable;
}

async function handleChangeStatus(
  checked: SwitchProps['checked'],
  row: ApnVO,
) {
  if (!checked) {
    await new Promise<void>((resolve, reject) => {
      window.modal.confirm({
        title: '提示',
        content: '确认禁用该APN吗？',
        centered: true,
        onOk: async () => {
          try {
            await apnChangeStatus({
              id: row.id,
              status: EnableStatus.Disable,
            });
            window.message.success('状态变更成功');
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        onCancel: () => {
          reject(new Error('cancel'));
        },
      });
    });
    return;
  }

  await apnChangeStatus({
    id: row.id,
    status: EnableStatus.Enable,
  });
  window.message.success('状态变更成功');
}

async function handleSetDefault(
  checked: SwitchProps['checked'],
  row: ApnVO,
) {
  if (!checked) {
    throw new Error('blocked');
  }

  const carrier = row.operatorName || '当前运营商';
  await new Promise<void>((resolve, reject) => {
    window.modal.confirm({
      title: '提示',
      content: `确认将「${row.name || row.apn}」设为 ${carrier} 的默认 APN？当前默认APN将被替换。`,
      centered: true,
      onOk: async () => {
        try {
          await setDefaultApn(row.id);
          window.message.success('已设为默认APN');
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      onCancel: () => {
        reject(new Error('cancel'));
      },
    });
  });
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(apnExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('APN列表');
  exportBlob({ data: formValues, fileName });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <a-button type="primary" @click="handleAdd">
          {{ $t('pages.common.add') }}
        </a-button>
      </template>
      <template #toolbar-tools>
        <a-button
          :loading="exportLoading"
          :disabled="exportLoading"
          @click="handleExport"
        >
          {{ $t('pages.common.export') }}
        </a-button>
      </template>

      <template #isDefault="{ row }">
        <ApiSwitch
          :key="`${row.id}-${row.isDefault}`"
          :value="row.isDefault === '1'"
          :api="(checked) => handleSetDefault(checked, row)"
          :disabled="isDefaultApnDisabled(row)"
          checked-text="是"
          un-checked-text="否"
          @reload="tableApi.query()"
        />
      </template>

      <template #status="{ row }">
        <ApiSwitch
          :key="`${row.id}-${row.status}`"
          :value="row.status === EnableStatus.Enable"
          :api="(checked) => handleChangeStatus(checked, row)"
          checked-text="启用"
          un-checked-text="禁用"
          @reload="tableApi.query()"
        />
      </template>

      <template #action="{ row }">
        <Space>
          <action-button @click.stop="handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </action-button>
        </Space>
      </template>
    </BasicTable>
    <ApnModalComp @reload="tableApi.query()" />
  </Page>
</template>
