<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ApnVO } from '#/api/system/apn/model';

import { Page, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { apnExport, delApn, listApn, setDefaultApn } from '#/api/system/apn';
import { useBlobExport } from '#/utils/file/export';

import ApnModal from './apn-modal.vue';
import { columns, getSourceTypeMeta, querySchema } from './data';

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
  // 默认 APN 行加高亮 class
  rowClassName: ({ row }) => (row.isDefault === '1' ? 'apn-default-row' : ''),
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

async function handleDelete(row: ApnVO) {
  await delApn(row.id);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: ApnVO) => row.id);
  window.modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      for (const id of ids) {
        await delApn(id);
      }
      await tableApi.query();
    },
  });
}

async function handleSetDefault(row: ApnVO) {
  const carrier = row.carrierName || row.carrierCode || '当前运营商';
  window.modal.confirm({
    title: '设为默认 APN',
    content: `确认将「${row.name}」设为 ${carrier} 的默认 APN？同运营商下的其他默认 APN 将被自动取消。`,
    onOk: async () => {
      await setDefaultApn(row.id);
      await tableApi.query();
    },
  });
}

const { exportBlob, exportLoading, buildExportFileName } = useBlobExport(apnExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('APN列表');
  exportBlob({ data: formValues, fileName });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="APN列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :loading="exportLoading"
            :disabled="exportLoading"
            @click="handleExport"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button type="primary" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>

      <!-- 是否默认 -->
      <template #isDefault="{ row }">
        <Tag v-if="row.isDefault === '1'" color="gold">
          <template #icon>⭐</template>
          默认
        </Tag>
        <span v-else class="text-gray-400">--</span>
      </template>

      <!-- 状态 -->
      <template #status="{ row }">
        <Tag v-if="row.status === '0'" color="green">正常</Tag>
        <Tag v-else-if="row.status === '1'" color="red">停用</Tag>
        <span v-else class="text-gray-400">--</span>
      </template>

      <!-- 来源 -->
      <template #sourceType="{ row }">
        <Tag :color="getSourceTypeMeta(row.sourceType).color">
          {{ getSourceTypeMeta(row.sourceType).text }}
        </Tag>
      </template>

      <!-- 行操作 -->
      <template #action="{ row }">
        <Space>
          <action-button
            v-if="row.isDefault !== '1' && row.carrierCode"
            variant="link"
            color="gold"
            @click.stop="handleSetDefault(row)"
          >
            设为默认
          </action-button>
          <action-button @click.stop="handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </action-button>
          <Popconfirm
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <action-button danger @click.stop="">
              {{ $t('pages.common.delete') }}
            </action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ApnModalComp @reload="tableApi.query()" />
  </Page>
</template>

<style scoped>
/* 默认 APN 行高亮：左侧金色边框 + 渐变背景 */
:deep(.apn-default-row) {
  background: linear-gradient(
    90deg,
    rgba(250, 173, 20, 0.08) 0%,
    transparent 30%
  );
  border-left: 4px solid #faad14;
}
:deep(.apn-default-row td:first-child) {
  border-left: none;
}
</style>
