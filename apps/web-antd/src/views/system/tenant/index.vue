<script setup lang="ts">
import type { SwitchProps } from 'antdv-next';

import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EimTenantVo } from '#/api/system/tenant/model';

import { computed } from 'vue';

import { useAccess } from '@vben/access';
import { Fallback, Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { EnableStatus } from '@vben/constants';

import { Space, Switch, Tooltip } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  eimTenantChangeStatus,
  eimTenantExport,
  eimTenantList,
} from '#/api/system/tenant';
import { ApiSwitch } from '#/components/global';
import { useBlobExport } from '#/utils/file/export';

import { columns, querySchema } from './data';
import resetPwdModal from './reset-pwd-modal.vue';
import tenantDrawer from './tenant-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [
    [
      'createTime',
      ['params[beginTime]', 'params[endTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  emptyText: '暂无租户数据',
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await eimTenantList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
        const rows = (result?.rows ?? []).map((row) => ({
          ...row,
          id: String(row.id),
          packageId:
            row.packageId != null ? String(row.packageId) : row.packageId,
        }));
        return { ...result, rows };
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'system-tenant-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [TenantDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: tenantDrawer,
});

const [ResetPwdModal, resetPwdModalApi] = useVbenModal({
  connectedComponent: resetPwdModal,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: EimTenantVo) {
  drawerApi.setData({ id: String(record.id) });
  drawerApi.open();
}

function handleResetPassword(record: EimTenantVo) {
  resetPwdModalApi.setData({ record });
  resetPwdModalApi.open();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(eimTenantExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('租户台账');
  exportBlob({ data: formValues, fileName });
}

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const isSuperAdmin = computed(() => {
  return hasAccessByRoles(['superadmin']);
});

function isTenantExpired(row: EimTenantVo) {
  if (row.expired) {
    return true;
  }
  if (!row.expireTime) {
    return false;
  }
  return dayjs(row.expireTime).isBefore(dayjs(), 'day');
}

function statusConfirmText(checked: SwitchProps['checked']) {
  return checked
    ? '确认启用该租户吗？'
    : '确认禁用该租户吗？禁用后该租户下所有下载任务将暂停，且无法新增业务。';
}

async function handleChangeStatus(
  checked: SwitchProps['checked'],
  row: EimTenantVo,
) {
  await eimTenantChangeStatus({
    id: String(row.id),
    status: checked ? EnableStatus.Enable : EnableStatus.Disable,
  });
  window.message.success(checked ? '已启用该租户' : '已禁用该租户');
}
</script>

<template>
  <Page v-if="isSuperAdmin" :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <a-button
          type="primary"
          v-access:code="['eim:tenant:add', 'system:tenant:add']"
          @click="handleAdd"
        >
          {{ $t('pages.common.add') }}
        </a-button>
      </template>
      <template #toolbar-tools>
        <a-button
          v-access:code="['eim:tenant:export', 'system:tenant:export']"
          :loading="exportLoading"
          :disabled="exportLoading"
          @click="handleExport"
        >
          {{ $t('pages.common.export') }}
        </a-button>
      </template>

      <template #status="{ row }">
        <Tooltip
          v-if="isTenantExpired(row)"
          title="租户已过期，请修改过期时间后再启用"
        >
          <Switch
            disabled
            :checked="false"
            checked-children="过期"
            un-checked-children="过期"
          />
        </Tooltip>
        <ApiSwitch
          v-else
          :value="row.status === EnableStatus.Enable"
          :api="(checked) => handleChangeStatus(checked, row)"
          :confirm="true"
          :confirm-text="statusConfirmText"
          :disabled="
            String(row.id) === '1' ||
            !hasAccessByCodes(['eim:tenant:edit', 'system:tenant:edit'])
          "
          @reload="tableApi.query()"
        />
      </template>

      <template #action="{ row }">
        <Space v-if="String(row.id) !== '1'">
          <action-button
            v-access:code="['eim:tenant:edit', 'system:tenant:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </action-button>
          <action-button
            variant="link"
            color="purple"
            v-access:code="['eim:tenant:edit', 'system:tenant:edit']"
            @click="handleResetPassword(row)"
          >
            重置密码
          </action-button>
        </Space>
      </template>
    </BasicTable>
    <TenantDrawer @reload="tableApi.query()" />
    <ResetPwdModal @reload="tableApi.query()" />
  </Page>
  <Fallback v-else description="您没有租户的访问权限" status="403" />
</template>
