<script setup lang="ts">
import type { SwitchProps } from 'antdv-next';

import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EimTenantPackageVo } from '#/api/system/tenant-package/model';

import { computed } from 'vue';

import { useAccess } from '@vben/access';
import { Fallback, Page, useVbenDrawer } from '@vben/common-ui';
import { EnableStatus } from '@vben/constants';

import { Space, Switch, Tooltip } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  packageChangeStatus,
  packageExport,
  packageList,
  packageRemove,
} from '#/api/system/tenant-package';
import { ApiSwitch } from '#/components/global';
import { useBlobExport } from '#/utils/file/export';
import { confirmDeleteActionModal } from '#/utils/modal';

import { columns, querySchema } from './data';
import tenantPackageDrawer from './tenant-package-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
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
  emptyText: '暂无套餐数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await packageList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
        // 雪花 ID 统一转字符串，避免 Number 精度丢失导致删除/编辑 ID 错位
        const rows = (result?.rows ?? []).map((row) => ({
          ...row,
          packageId: String(row.packageId),
        }));
        return { ...result, rows };
      },
    },
  },
  rowConfig: {
    keyField: 'packageId',
  },
  id: 'system-tenant-package-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [TenantPackageDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: tenantPackageDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: EimTenantPackageVo) {
  drawerApi.setData({ id: String(record.packageId) });
  drawerApi.open();
}

function handleDeleteClick(row: EimTenantPackageVo) {
  if ((row.tenantCount ?? 0) > 0) {
    window.message.warning('该套餐已绑定租户，无法删除，请先解除绑定关系。');
    return;
  }
  confirmDeleteActionModal({
    content: '确认删除该套餐吗？删除后不可恢复。',
    onOk: () => handleDelete(row),
  });
}

async function handleDelete(row: EimTenantPackageVo) {
  const packageId = String(row.packageId);
  await packageRemove(packageId);
  window.message.success('删除成功');
  await tableApi.query();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(packageExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('租户套餐');
  exportBlob({ data: formValues, fileName });
}

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const isSuperAdmin = computed(() => {
  return hasAccessByRoles(['superadmin']);
});

function isStatusSwitchDisabled(row: EimTenantPackageVo) {
  return (row.tenantCount ?? 0) > 0;
}

async function handleChangeStatus(
  checked: SwitchProps['checked'],
  row: EimTenantPackageVo,
) {
  if (!checked) {
    await new Promise<void>((resolve, reject) => {
      window.modal.confirm({
        title: '提示',
        content: '禁用后，新建租户将无法选择该套餐。',
        onOk: () => resolve(),
        onCancel: () => reject(new Error('cancel')),
      });
    });
  }
  await packageChangeStatus({
    packageId: String(row.packageId),
    status: checked ? EnableStatus.Enable : EnableStatus.Disable,
  });
  window.message.success(checked ? '启用成功' : '禁用成功');
}
</script>

<template>
  <Page v-if="isSuperAdmin" :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <a-button
          type="primary"
          v-access:code="['eim:tenantPackage:add', 'system:tenantPackage:add']"
          @click="handleAdd"
        >
          {{ $t('pages.common.add') }}
        </a-button>
      </template>
      <template #toolbar-tools>
        <a-button
          v-access:code="['eim:tenantPackage:export', 'system:tenantPackage:export']"
          :loading="exportLoading"
          :disabled="exportLoading"
          @click="handleExport"
        >
          {{ $t('pages.common.export') }}
        </a-button>
      </template>

      <template #status="{ row }">
        <Tooltip
          v-if="isStatusSwitchDisabled(row)"
          title="已绑定租户，无法禁用"
        >
          <Switch
            disabled
            :checked="row.status === EnableStatus.Enable"
            checked-children="启用"
            un-checked-children="禁用"
          />
        </Tooltip>
        <ApiSwitch
          v-else
          :value="row.status === EnableStatus.Enable"
          :api="(checked) => handleChangeStatus(checked, row)"
          :disabled="
            !hasAccessByCodes([
              'eim:tenantPackage:edit',
              'system:tenantPackage:edit',
            ])
          "
          @reload="tableApi.query()"
        />
      </template>

      <template #action="{ row }">
        <Space>
          <action-button
            v-access:code="['eim:tenantPackage:edit', 'system:tenantPackage:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </action-button>
          <action-button
            danger
            v-access:code="[
              'eim:tenantPackage:remove',
              'system:tenantPackage:remove',
            ]"
            @click="handleDeleteClick(row)"
          >
            {{ $t('pages.common.delete') }}
          </action-button>
        </Space>
      </template>
    </BasicTable>
    <TenantPackageDrawer @reload="tableApi.query()" />
  </Page>
  <Fallback v-else description="您没有租户的访问权限" status="403" />
</template>
