<script setup lang="ts">
import type { SwitchProps } from 'antdv-next';

import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ApiCredentialVO } from '#/api/system/api-credential/model';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { EnableStatus } from '@vben/constants';

import { Space } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  apiCredentialChangeStatus,
  apiCredentialList,
  apiCredentialReset,
} from '#/api/system/api-credential';
import { ApiSwitch } from '#/components/global';

import { columns, querySchema } from './data';
import SecretModal from './secret-modal.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无API管理数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await apiCredentialList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
        const rows = (result?.rows ?? []).map((row) => ({
          ...row,
          id: String(row.id),
        }));
        return { ...result, rows };
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'eim-api-management-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

const [ViewSecretModal, secretModalApi] = useVbenModal({
  connectedComponent: SecretModal,
});

const { hasAccessByCodes } = useAccess();

function handleViewSecret(row: ApiCredentialVO) {
  secretModalApi.setData({ id: String(row.id) });
  secretModalApi.open();
}

function handleReset(row: ApiCredentialVO) {
  window.modal.confirm({
    title: '重置密钥',
    content:
      '确认重置该租户的API密钥？重置后原密钥将立即失效，租户需更新设备端配置。',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await apiCredentialReset(String(row.id));
        window.message.success('密钥重置成功');
        await tableApi.query();
      } catch (error: any) {
        window.message.error(error?.message || '操作失败，请稍后重试');
        throw error;
      }
    },
  });
}

async function handleChangeStatus(
  checked: SwitchProps['checked'],
  row: ApiCredentialVO,
) {
  const enabling = !!checked;
  await new Promise<void>((resolve, reject) => {
    window.modal.confirm({
      title: enabling
        ? '确认启用该租户的API调用吗？'
        : '确认禁用该租户的API调用吗？',
      content: enabling
        ? '启用后租户可以调用API。'
        : '禁用后租户无法调用API。',
      onOk: async () => {
        try {
          await apiCredentialChangeStatus(
            String(row.id),
            enabling ? EnableStatus.Enable : EnableStatus.Disable,
          );
          window.message.success('操作成功');
          resolve();
        } catch {
          window.message.error('操作失败，请稍后重试');
          reject(new Error('change status failed'));
        }
      },
      onCancel: () => reject(new Error('cancelled')),
    });
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="API管理">
      <template #status="{ row }">
        <ApiSwitch
          :value="row.status === EnableStatus.Enable"
          :api="(checked) => handleChangeStatus(checked, row)"
          :disabled="!hasAccessByCodes(['eim:api:credential:edit'])"
          @reload="tableApi.query()"
        />
      </template>
      <template #action="{ row }">
        <Space>
          <action-button
            v-access:code="['eim:api:credential:query']"
            @click.stop="handleViewSecret(row)"
          >
            查看密钥
          </action-button>
          <action-button
            v-access:code="['eim:api:credential:reset']"
            @click.stop="handleReset(row)"
          >
            重置密钥
          </action-button>
        </Space>
      </template>
    </BasicTable>
    <ViewSecretModal />
  </Page>
</template>
