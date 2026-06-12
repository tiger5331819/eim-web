<script setup lang="ts">
import type { DropdownEmits, MenuItemType, SwitchProps } from 'antdv-next';

import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EimTenantVo } from '#/api/system/tenant/model';

import { computed } from 'vue';

import { useAccess } from '@vben/access';
import { Fallback, Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { EnableStatus } from '@vben/constants';

import { Dropdown, Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  dictSyncTenant,
  eimTenantExport,
  eimTenantLicenseAdjust,
  eimTenantList,
  eimTenantRemove,
  eimTenantResetPassword,
  eimTenantSyncPackage,
  syncTenantConfig,
  tenantStatusChange,
} from '#/api/system/tenant';
import { ApiSwitch } from '#/components/global';
import { useTenantStore } from '#/store/tenant';
import { useBlobExport } from '#/utils/file/export';
import LicenseAdjustModal from '#/views/eim/license/balance/license-adjust-modal.vue';

import { columns, querySchema } from './data';
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
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    checkMethod: ({ row }) => row?.id !== 1,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await eimTenantList({
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
  id: 'system-tenant-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [TenantDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: tenantDrawer,
});

const [LicenseAdjustModalCmp, licenseAdjustApi] = useVbenModal({
  connectedComponent: LicenseAdjustModal,
});

async function handleAdjustLicense(record: EimTenantVo) {
  licenseAdjustApi.setData({
    tenantId: record.id,
    current: record.licenseBalance ?? 0,
  });
  licenseAdjustApi.open();
}

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: EimTenantVo) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleSync(record: EimTenantVo) {
  await eimTenantSyncPackage(record.id, record.packageId);
  await tableApi.query();
}

async function handleResetPassword(record: EimTenantVo) {
  await eimTenantResetPassword(record.id);
  await tableApi.query();
}

const tenantStore = useTenantStore();
async function handleDelete(row: EimTenantVo) {
  await eimTenantRemove([row.id]);
  await tableApi.query();
  tenantStore.initTenant();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: EimTenantVo) => row.id);
  window.modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await eimTenantRemove(ids);
      await tableApi.query();
      tenantStore.initTenant();
    },
  });
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(eimTenantExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('租户数据');
  exportBlob({ data: formValues, fileName });
}

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const isSuperAdmin = computed(() => {
  return hasAccessByRoles(['superadmin']);
});

function handleSyncTenantDict() {
  window.modal.confirm({
    title: '提示',
    content: '确认同步租户字典？',
    onOk: async () => {
      await dictSyncTenant();
      await tableApi.query();
    },
  });
}

function handleSyncTenantConfig() {
  window.modal.confirm({
    title: '提示',
    content: '确认同步租户参数配置？',
    onOk: async () => {
      await syncTenantConfig();
      await tableApi.query();
    },
  });
}

async function handleChangeStatus(
  checked: SwitchProps['checked'],
  row: EimTenantVo,
) {
  await tenantStatusChange({
    id: row.id,
    tenantId: row.tenantId,
    status: checked ? EnableStatus.Enable : EnableStatus.Disable,
  });
}

const items = computed(() => {
  const list: MenuItemType[] = [];
  if (hasAccessByCodes(['system:tenant:edit'])) {
    list.push(
      { label: '同步租户字典', key: 'syncTenantDict' },
      { label: '同步租户参数配置', key: 'syncTenantConfig' },
    );
  }
  return list;
});

const handleMenuClick: DropdownEmits['menuClick'] = (e) => {
  const { key } = e;
  switch (key) {
    case 'syncTenantConfig': {
      handleSyncTenantConfig();
      break;
    }
    case 'syncTenantDict': {
      handleSyncTenantDict();
      break;
    }
  }
};
</script>

<template>
  <Page v-if="isSuperAdmin" :auto-content-height="true">
    <BasicTable table-title="租户列表">
      <template #toolbar-tools>
        <Space>
          <Dropdown
            placement="top"
            :menu="{ items }"
            @menu-click="handleMenuClick"
          >
            <a-button>操作</a-button>
          </Dropdown>

          <a-button
            v-access:code="['system:tenant:export']"
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
            v-access:code="['system:tenant:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:tenant:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>

      <!-- 用户数 -->
      <template #userCount="{ row }">
        <span v-if="row.accountCount === -1">{{ row.userCount }} / 不限</span>
        <span v-else>{{ row.userCount }} / {{ row.accountCount }}</span>
      </template>

      <!-- License余额 -->
      <template #licenseBalance="{ row }">
        <Tag color="blue" class="font-semibold">{{ row.licenseBalance ?? 0 }}</Tag>
      </template>

      <!-- 状态开关 -->
      <template #status="{ row }">
        <ApiSwitch
          :value="row.status === EnableStatus.Enable"
          :api="(checked) => handleChangeStatus(checked, row)"
          :disabled="row.id === 1 || !hasAccessByCodes(['system:tenant:edit'])"
          @reload="tableApi.query()"
        />
      </template>

      <!-- 操作按钮 -->
      <template #action="{ row }">
        <Space v-if="row.id !== 1">
          <action-button
            v-access:code="['eim:license:adjust']"
            variant="link"
            color="orange"
            @click="handleAdjustLicense(row)"
          >
            调整License
          </action-button>
          <action-button
            v-access:code="['system:tenant:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </action-button>
          <Popconfirm
            title="确认重置该租户管理员密码为默认密码？"
            placement="left"
            @confirm="handleResetPassword(row)"
          >
            <action-button
              variant="link"
              color="purple"
              v-access:code="['system:tenant:edit']"
              @click.stop=""
            >
              重置密码
            </action-button>
          </Popconfirm>
          <Popconfirm
            :title="`确认同步[${row.companyName}]的套餐吗?`"
            placement="left"
            @confirm="handleSync(row)"
          >
            <action-button
              variant="link"
              color="green"
              v-access:code="['system:tenant:edit']"
            >
              {{ $t('pages.common.sync') }}
            </action-button>
          </Popconfirm>
          <Popconfirm
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <action-button
              danger
              v-access:code="['system:tenant:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <TenantDrawer @reload="tableApi.query()" />
    <LicenseAdjustModalCmp @reload="tableApi.query()" />
  </Page>
  <Fallback v-else description="您没有租户的访问权限" status="403" />
</template>
