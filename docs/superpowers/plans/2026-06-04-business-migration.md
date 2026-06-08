# 业务模块迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧项目5个业务模块（APN列表、任务列表、卡入库管理、Profile来源管理、设备管理）迁移到新项目，适配新框架的技术栈和代码模式。

**Architecture:** 逐模块渐进式迁移，按依赖关系排序。每个模块先迁移API层（index.ts + model.d.ts），再迁移视图层（data.ts + index.vue + 子组件）。所有模块遵循新项目的 useVbenVxeGrid + useVbenModal + useVbenForm 模式。

**Tech Stack:** Vue 3 + antdv-next + Alova/Axios + VXE Table + Tailwind CSS 4 + Pinia

---

## 文件结构总览

### 模块1 — APN列表

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 创建 | `apps/web-antd/src/api/system/apn/index.ts` | APN API接口定义 |
| 创建 | `apps/web-antd/src/api/system/apn/model.d.ts` | APN 类型定义 |
| 创建 | `apps/web-antd/src/views/system/apn/data.ts` | 搜索表单Schema + 表格列 + 弹窗表单Schema |
| 创建 | `apps/web-antd/src/views/system/apn/apn-modal.vue` | APN 新增/修改弹窗 |
| 创建 | `apps/web-antd/src/views/system/apn/index.vue` | APN 列表主页面 |

### 模块2 — 任务列表

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 创建 | `apps/web-antd/src/api/system/task/index.ts` | 任务 API接口定义 |
| 创建 | `apps/web-antd/src/api/system/task/model.d.ts` | 任务 类型定义 |
| 创建 | `apps/web-antd/src/views/system/task/data.ts` | 搜索表单Schema + 表格列 |
| 创建 | `apps/web-antd/src/views/system/task/index.vue` | 任务 列表主页面 |

### 模块3 — 卡入库管理

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 创建 | `apps/web-antd/src/api/system/cardImport/index.ts` | 卡入库 API接口定义 |
| 创建 | `apps/web-antd/src/api/system/cardImport/model.d.ts` | 卡入库 类型定义 |
| 创建 | `apps/web-antd/src/views/system/cardImport/hooks/useGetDict.ts` | 跨模块共享字典hooks |
| 创建 | `apps/web-antd/src/views/system/cardImport/data.ts` | 搜索表单Schema + 表格列 |
| 创建 | `apps/web-antd/src/views/system/cardImport/index.vue` | 卡入库 列表主页面 |
| 创建 | `apps/web-antd/src/views/system/cardImport/allocation-modal.vue` | 卡数分配弹窗 |
| 创建 | `apps/web-antd/src/views/system/cardImport/batch-import-modal.vue` | 批量导入弹窗 |

### 模块4 — Profile来源管理

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 创建 | `apps/web-antd/src/api/system/profile/index.ts` | Profile API接口定义 |
| 创建 | `apps/web-antd/src/api/system/profile/model.d.ts` | Profile 类型定义 |
| 创建 | `apps/web-antd/src/views/system/profile/data.ts` | 搜索表单Schema + 表格列 |
| 创建 | `apps/web-antd/src/views/system/profile/index.vue` | Profile 列表主页面 |
| 创建 | `apps/web-antd/src/views/system/profile/allocation-modal.vue` | 资源分配弹窗 |
| 创建 | `apps/web-antd/src/views/system/profile/batch-import-modal.vue` | 批量导入弹窗 |
| 创建 | `apps/web-antd/src/views/system/profile/apn-modal.vue` | APN更新弹窗 |

### 模块5 — 设备管理

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 创建 | `apps/web-antd/src/api/system/device/index.ts` | 设备 API接口定义 |
| 创建 | `apps/web-antd/src/api/system/device/model.d.ts` | 设备 类型定义 |
| 创建 | `apps/web-antd/src/views/system/device/data.ts` | 搜索表单Schema + 表格列 |
| 创建 | `apps/web-antd/src/views/system/device/index.vue` | 设备列表主页面 |
| 创建 | `apps/web-antd/src/views/system/device/batch-import-modal.vue` | 导入分配资源弹窗 |
| 创建 | `apps/web-antd/src/views/system/device/change-eim-modal.vue` | 替换EIM弹窗 |
| 创建 | `apps/web-antd/src/views/system/device/detail/index.vue` | 设备详情页（Tab） |
| 创建 | `apps/web-antd/src/views/system/device/detail/add.vue` | 下载业务号页 |
| 创建 | `apps/web-antd/src/views/system/device/detail/module/basic.vue` | 基本信息Tab |
| 创建 | `apps/web-antd/src/views/system/device/detail/module/operation.vue` | 运营信息Tab |
| 创建 | `apps/web-antd/src/views/system/device/detail/module/eim.vue` | EIM LIST Tab |
| 创建 | `apps/web-antd/src/views/system/device/detail/module/apn-modal.vue` | APN更新弹窗 |
| 创建 | `apps/web-antd/src/views/system/device/download/index.vue` | 批量下载资源页 |
| 创建 | `apps/web-antd/src/store/device.ts` | 设备模块Pinia Store（替代localStorage） |

---

## Task 1: APN列表 — API层

**Files:**
- Create: `apps/web-antd/src/api/system/apn/index.ts`
- Create: `apps/web-antd/src/api/system/apn/model.d.ts`

- [ ] **Step 1: 创建 APN 类型定义文件**

Create `apps/web-antd/src/api/system/apn/model.d.ts`:

```typescript
export interface ApnVO {
  id: string | number;
  name: string;
  apn: string;
  local: string;
  creationTime: string;
}

export interface ApnForm {
  id?: string | number;
  name?: string;
  apn?: string;
  local?: string;
}
```

- [ ] **Step 2: 创建 APN API接口文件**

Create `apps/web-antd/src/api/system/apn/index.ts`:

```typescript
import type { ApnForm, ApnVO } from './model';
import type { ID, PageQuery, PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/apn',
  apnList = '/manager/apn/list',
}

export function listApn(params?: PageQuery) {
  return alovaInstance.get<PageResult<ApnVO>>(Api.apnList, { params });
}

export function getApn(id: ID) {
  return alovaInstance.get<ApnVO>(`${Api.root}/${id}`);
}

export function addApn(data: ApnForm) {
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

export function updateApn(data: ApnForm) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${data.id}`, data);
}

export function delApn(id: ID) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${id}`);
}
```

- [ ] **Step 3: 完成**

---

## Task 2: APN列表 — 视图层

**Files:**
- Create: `apps/web-antd/src/views/system/apn/data.ts`
- Create: `apps/web-antd/src/views/system/apn/apn-modal.vue`
- Create: `apps/web-antd/src/views/system/apn/index.vue`

- [ ] **Step 1: 创建数据定义文件**

Create `apps/web-antd/src/views/system/apn/data.ts`:

```typescript
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
  },
  {
    component: 'Input',
    fieldName: 'apn',
    label: 'APN',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'APN ID', field: 'id' },
  { title: '名称', field: 'name' },
  { title: 'APN', field: 'apn' },
  { title: '适用地区', field: 'local' },
  { title: '创建时间', field: 'creationTime' },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: 'APN ID',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'apn',
    label: 'APN',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'local',
    label: '适用地区',
    rules: 'required',
  },
];
```

- [ ] **Step 2: 创建APN弹窗组件**

Create `apps/web-antd/src/views/system/apn/apn-modal.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { addApn, getApn, updateApn } from '#/api/system/apn';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 80,
  },
  schema: modalSchema(),
  showDefaultActions: false,
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await getApn(id);
      await formApi.setValues(record);
    }
    await markInitialized();

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? updateApn(data) : addApn(data));
    resetInitialized();
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
</script>

<template>
  <BasicModal :title="title" class="w-[550px]">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 3: 创建APN列表主页面**

Create `apps/web-antd/src/views/system/apn/index.vue`:

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ApnVO } from '#/api/system/apn/model';

import { Page, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { delApn, listApn } from '#/api/system/apn';

import ApnModal from './apn-modal.vue';
import { columns, querySchema } from './data';

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
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="APN列表">
      <template #toolbar-tools>
        <Space>
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
      <template #action="{ row }">
        <Space>
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
```

- [ ] **Step 4: 完成**

---

## Task 3: 任务列表 — API层

**Files:**
- Create: `apps/web-antd/src/api/system/task/index.ts`
- Create: `apps/web-antd/src/api/system/task/model.d.ts`

- [ ] **Step 1: 创建任务类型定义文件**

Create `apps/web-antd/src/api/system/task/model.d.ts`:

```typescript
export interface TaskQuery {
  pageNum?: number;
  pageSize?: number;
  state?: number;
  operatorUser?: string;
  startCreationTime?: string;
  endCreationTime?: string;
}

export interface TaskVO {
  id: string;
  iccid: string;
  eid: string;
  downloadRate: number;
  creationTime: string;
  state: number;
  operatorTime: string;
  operatorUser: string;
  [key: string]: any;
}
```

- [ ] **Step 2: 创建任务API接口文件**

Create `apps/web-antd/src/api/system/task/index.ts`:

```typescript
import type { TaskQuery, TaskVO } from './model';
import type { PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  taskList = '/manager/device/task/list',
  root = '/manager/device/task',
}

export function taskList(params?: TaskQuery) {
  return alovaInstance.get<PageResult<TaskVO>>(Api.taskList, { params });
}

export function cancelTask(ids: (string | number)[]) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${ids}`);
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web-antd/src/api/system/task/
git commit -m "feat: 迁移任务列表模块API层"
```

---

## Task 4: 任务列表 — 视图层

**Files:**
- Create: `apps/web-antd/src/views/system/task/data.ts`
- Create: `apps/web-antd/src/views/system/task/index.vue`

- [ ] **Step 1: 创建数据定义文件**

Create `apps/web-antd/src/views/system/task/data.ts`:

```typescript
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions('sys_task_status'),
    },
    fieldName: 'state',
    label: '任务类型',
  },
  {
    component: 'Input',
    fieldName: 'operatorUser',
    label: '操作人',
  },
  {
    component: 'RangePicker',
    fieldName: 'creationTime',
    label: '操作时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'ICCID', field: 'iccid' },
  { title: 'EID', field: 'eid', width: 400 },
  { title: '进度条', field: 'downloadRate' },
  { title: '创建时间', field: 'creationTime' },
  {
    title: '状态',
    field: 'state',
    slots: {
      default: ({ row }) => {
        return renderDict(row.state, 'sys_task_status');
      },
    },
  },
  { title: '操作时间', field: 'operatorTime' },
  { title: '操作人', field: 'operatorUser' },
];
```

- [ ] **Step 2: 创建任务列表主页面**

Create `apps/web-antd/src/views/system/task/index.vue`:

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Space } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { cancelTask, taskList } from '#/api/system/task';

import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [
    [
      'creationTime',
      ['startCreationTime', 'endCreationTime'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
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
        return await taskList({
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
  id: 'system-task-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

async function handleCancelTask() {
  const rows = tableApi.grid.getCheckboxRecords();
  if (!rows.length) {
    window.message.warning('请选择要取消的任务');
    return;
  }
  const ids = rows.map((row: any) => row.id);
  await cancelTask(ids);
  await tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="任务列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            type="primary"
            @click="handleCancelTask"
          >
            取消任务
          </a-button>
        </Space>
      </template>
    </BasicTable>
  </Page>
</template>
```

- [ ] **Step 3: 提交**

```bash
git add apps/web-antd/src/views/system/task/
git commit -m "feat: 迁移任务列表模块视图层"
```

---

## Task 5: 卡入库管理 — API层

**Files:**
- Create: `apps/web-antd/src/api/system/cardImport/index.ts`
- Create: `apps/web-antd/src/api/system/cardImport/model.d.ts`

- [ ] **Step 1: 创建卡入库类型定义文件**

Create `apps/web-antd/src/api/system/cardImport/model.d.ts`:

```typescript
export interface CardImportQuery {
  pageNum?: number;
  pageSize?: number;
  eid?: string;
  iccid?: string;
  providerName?: string;
  companyName?: string;
  projectName?: string;
  allocate?: string;
}

export interface CardImportVO {
  eid: string;
  iccid: string;
  eimFqdn: string;
  cardProviderName: string;
  providerName: string;
  productionBatch: string;
  companyName: string;
  projectName: string;
  [key: string]: any;
}

export interface AllocationForm {
  productionBatch?: string;
  count?: number;
  projectId?: string;
}
```

- [ ] **Step 2: 创建卡入库API接口文件**

Create `apps/web-antd/src/api/system/cardImport/index.ts`:

```typescript
import type { AllocationForm, CardImportQuery } from './model';
import type { PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  cardImportList = '/manager/seed/list',
  providerList = '/manager/provider/list',
  companyAll = '/manager/company/all',
  projectAll = '/manager/company',
  batchAll = '/manager/seed/batch/all',
  batchInventory = '/manager/seed/batch',
  downloadFail = '/manager/seed/importError',
  cardProvider = '/manager/seed/cardProviderName',
  tenantList = '/system/tenant/list',
  importTemplate = '/manager/seed/importTemplate',
}

export function cardImportList(params?: CardImportQuery) {
  return alovaInstance.get<PageResult<any>>(Api.cardImportList, { params });
}

export function providerList() {
  return alovaInstance.get<any>(Api.providerList);
}

export function companyList() {
  return alovaInstance.get<any>(Api.companyAll);
}

export function projectList(companyId: string) {
  return alovaInstance.get<any>(`${Api.projectAll}/${companyId}/project/all`);
}

export function allBatchList() {
  return alovaInstance.get<any>(Api.batchAll);
}

export function batchAllowableNumber(productionBatch: string) {
  return alovaInstance.get<any>(`${Api.batchInventory}/${productionBatch}/inventory`);
}

export function handleAllocation(productionBatch: string, data: AllocationForm) {
  return alovaInstance.postWithMsg<void>(`${Api.batchInventory}/${productionBatch}`, data);
}

export function downloadFailRecord(errorToken: string) {
  return alovaInstance.post<any>(`${Api.downloadFail}/${errorToken}`);
}

export function cardProviderList() {
  return alovaInstance.get<any>(Api.cardProvider);
}

export function tenantList() {
  return alovaInstance.get<any>(Api.tenantList);
}
```

- [ ] **Step 3: 创建共享字典hooks**

Create `apps/web-antd/src/views/system/cardImport/hooks/useGetDict.ts`:

```typescript
import { providerList, cardProviderList, companyList, projectList, allBatchList, tenantList } from '#/api/system/cardImport';

export async function getProviderDict() {
  const res = await providerList();
  return (res.rows || []).map((item: any) => ({
    label: item.dpSource,
    value: item.id,
  }));
}

export async function getCardProviderDict() {
  const res = await cardProviderList();
  return (res.data || []).map((item: any) => ({
    label: item,
    value: item,
  }));
}

export async function getCompanyDict() {
  const res = await companyList();
  return (res.data || []).map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
}

export async function getProjectDict(companyId: string) {
  const res = await projectList(companyId);
  return (res.data || []).map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
}

export async function getBatchDict() {
  const res = await allBatchList();
  return (res.data || []).map((item: any) => ({
    label: item,
    value: item,
  }));
}

export async function getTenantDict() {
  const res = await tenantList();
  return (res.rows || []).map((item: any) => ({
    label: item.companyName,
    value: item.tenantId,
  }));
}
```

- [ ] **Step 4: 提交**

```bash
git add apps/web-antd/src/api/system/cardImport/ apps/web-antd/src/views/system/cardImport/hooks/
git commit -m "feat: 迁移卡入库模块API层和共享hooks"
```

---

## Task 6: 卡入库管理 — 视图层

**Files:**
- Create: `apps/web-antd/src/views/system/cardImport/data.ts`
- Create: `apps/web-antd/src/views/system/cardImport/index.vue`
- Create: `apps/web-antd/src/views/system/cardImport/allocation-modal.vue`
- Create: `apps/web-antd/src/views/system/cardImport/batch-import-modal.vue`

- [ ] **Step 1: 创建数据定义文件**

Create `apps/web-antd/src/views/system/cardImport/data.ts`:

```typescript
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'eid',
    label: 'EID',
  },
  {
    component: 'Input',
    fieldName: 'iccid',
    label: '预制种子号',
  },
  {
    component: 'Input',
    fieldName: 'eimFqdn',
    label: '预制EIM',
  },
  {
    component: 'Input',
    fieldName: 'cardProviderName',
    label: '制卡商',
  },
  {
    component: 'Input',
    fieldName: 'projectName',
    label: '所属项目',
  },
  {
    component: 'Input',
    fieldName: 'tenantName',
    label: '所属租户',
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: 'EID', field: 'eid' },
  { title: '预制种子号ICCID', field: 'iccid' },
  { title: '预制EIM', field: 'eimFqdn' },
  { title: '制卡商', field: 'cardProviderName' },
  { title: '运营商', field: 'providerName' },
  { title: '生产批次', field: 'productionBatch' },
  { title: '所属项目', field: 'projectName' },
  { title: '所属租户', field: 'companyName' },
  { title: '操作人', field: 'operator' },
  { title: '入库时间', field: 'creationTime' },
];
```

- [ ] **Step 2: 创建卡数分配弹窗**

Create `apps/web-antd/src/views/system/cardImport/allocation-modal.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { batchAllowableNumber, handleAllocation } from '#/api/system/cardImport';
import { getBatchDict, getProjectDict, getTenantDict } from './hooks/useGetDict';

const emit = defineEmits<{ reload: [] }>();

const allowNum = ref(0);
const tenantId = ref('');
const batchDict = ref<any[]>([]);
const companyDict = ref<any[]>([]);
const projectDict = ref<any[]>([]);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Select',
      fieldName: 'productionBatch',
      label: '批次',
      rules: 'required',
      componentProps: {
        options: [],
        placeholder: '请选择',
        onChange: async (val: any) => {
          if (val) {
            const res = await batchAllowableNumber(val);
            allowNum.value = res.data?.count ?? 0;
          } else {
            allowNum.value = 0;
          }
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'allowNum',
      label: '允许分配数量',
      componentProps: { disabled: true, placeholder: '选择批次后显示' },
    },
    {
      component: 'Select',
      fieldName: 'tenantId',
      label: '所属租户',
      rules: 'required',
      componentProps: {
        options: [],
        placeholder: '请选择',
        onChange: async (val: any) => {
          if (val) {
            projectDict.value = await getProjectDict(val);
            formApi.updateSchema([
              {
                fieldName: 'projectId',
                componentProps: { options: projectDict.value },
              },
            ]);
          }
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'projectId',
      label: '所属项目',
      rules: 'required',
      componentProps: { options: [], placeholder: '请先选择租户' },
    },
    {
      component: 'InputNumber',
      fieldName: 'count',
      label: '数量',
      rules: 'required',
      componentProps: { min: 1 },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    allowNum.value = 0;
    tenantId.value = '';
    batchDict.value = await getBatchDict();
    companyDict.value = await getTenantDict();
    formApi.updateSchema([
      { fieldName: 'productionBatch', componentProps: { options: batchDict.value } },
      { fieldName: 'tenantId', componentProps: { options: companyDict.value } },
    ]);
    await formApi.resetForm();
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    if (values.productionBatch) {
      await handleAllocation(values.productionBatch as string, {
        productionBatch: values.productionBatch,
        count: values.count,
        projectId: values.projectId,
      });
    }
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
  <BasicModal title="卡数分配" class="w-[600px]">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 3: 创建批量导入弹窗**

Create `apps/web-antd/src/views/system/cardImport/batch-import-modal.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Table, Pagination, Upload, Alert } from 'antdv-next';

import { useAccessStore } from '#/stores';

const emit = defineEmits<{ reload: [] }>();

const fileList = ref<any[]>([]);
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const errorToken = ref('');
const uploadSuccess = ref(false);

const tableColumns = [
  { title: 'EID', dataIndex: 'eid' },
  { title: '预制种子号ICCID', dataIndex: 'iccid' },
  { title: '预制EIM', dataIndex: 'eimFqdn' },
  { title: '制卡商', dataIndex: 'cardProviderName' },
  { title: '运营商', dataIndex: 'providerName' },
  { title: '批次', dataIndex: 'productionBatch' },
  { title: '所属租户', dataIndex: 'companyName' },
  { title: '所属项目', dataIndex: 'projectName' },
  { title: '数据校验', dataIndex: 'result' },
];

function sliceData() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
}

function handleUploadSuccess(res: any) {
  if (res.code === 200) {
    uploadSuccess.value = true;
    tableData.value = res.data?.importResultList || [];
    errorToken.value = res.data?.errorToken || '';
    totalItems.value = tableData.value.length;
    sliceData();
    message.success('导入完成');
  } else {
    message.error('文件上传失败');
    uploadSuccess.value = false;
  }
}

function handlePageChange(page: number) {
  currentPage.value = page;
  sliceData();
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  sliceData();
}

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  width: 1200,
  onConfirm: () => {
    if (uploadSuccess.value) {
      emit('reload');
    }
    init();
    modalApi.close();
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      init();
    }
  },
});

function init() {
  tableData.value = [];
  paginatedData.value = [];
  totalItems.value = 0;
  fileList.value = [];
  errorToken.value = '';
  uploadSuccess.value = false;
}

const uploadHeaders = {
  Authorization: `Bearer ${useAccessStore().accessToken}`,
};
</script>

<template>
  <BasicModal title="批量导入">
    <Upload
      v-model:file-list="fileList"
      accept=".xlsx"
      :max-count="1"
      :action="`${import.meta.env.VITE_GLOB_API_URL}/manager/seed/importWithOptions`"
      :headers="uploadHeaders"
      @change="handleUploadSuccess"
    >
      <a-button>上传文件</a-button>
    </Upload>
    <Alert class="mt-4" type="info" show-icon message="温馨提示：请按照模板格式输入信息，数据量不要超过10000条；只支持xlsx格式文件" />
    <div v-if="paginatedData.length > 0" class="mt-4">
      <p>导入失败记录</p>
      <Table :columns="tableColumns" :data-source="paginatedData" :pagination="false" row-key="eid" />
      <Pagination
        class="mt-4"
        :current="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        :page-size-options="['10', '20', '30', '50']"
        show-quick-jumper
        show-size-changer
        @change="handlePageChange"
        @showSizeChange="handleSizeChange"
      />
    </div>
  </BasicModal>
</template>
```

- [ ] **Step 4: 创建卡入库列表主页面**

Create `apps/web-antd/src/views/system/cardImport/index.vue`:

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Space } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { cardImportList } from '#/api/system/cardImport';

import AllocationModal from './allocation-modal.vue';
import BatchImportModal from './batch-import-modal.vue';
import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 88,
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
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await cardImportList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'eid',
  },
  id: 'system-cardImport-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [AllocationModalComp, allocationApi] = useVbenModal({ connectedComponent: AllocationModal });
const [BatchImportModalComp, importApi] = useVbenModal({ connectedComponent: BatchImportModal });

function handleAllocation() {
  allocationApi.open();
}

function handleBatchImport() {
  importApi.open();
}

function handleDownloadTemplate() {
  window.open(`${import.meta.env.VITE_GLOB_API_URL}/manager/seed/importTemplate`);
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="卡入库管理">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAllocation">卡数分配</a-button>
          <a-button type="primary" @click="handleBatchImport">批量导入</a-button>
          <a-button @click="handleDownloadTemplate">下载批量导入模板</a-button>
        </Space>
      </template>
    </BasicTable>
    <AllocationModalComp @reload="tableApi.query()" />
    <BatchImportModalComp @reload="tableApi.query()" />
  </Page>
</template>
```

- [ ] **Step 5: 完成**

---

## Task 12: 设备管理 — EIM LIST Tab

**Files:**
- Create: `apps/web-antd/src/views/system/device/detail/module/eim.vue`

- [ ] **Step 1: 创建EIM LIST Tab**

Create `apps/web-antd/src/views/system/device/detail/module/eim.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { eimAdd, eimDelete, eimDetail, eimEdit, eimList, updateEim } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { getDictOptions } from '#/utils/dict';

const deviceStore = useDeviceStore();
const loading = ref(true);
const tableData = ref<any[]>([]);
const isEdit = ref(false);
const eimId = ref('');

async function getList() {
  loading.value = true;
  const eid = deviceStore.currentEid;
  try {
    const res = await eimList(eid);
    tableData.value = res.rows || [];
  } finally {
    loading.value = false;
  }
}

async function handleSynchronize() {
  const eid = deviceStore.currentEid;
  await updateEim(eid);
  await getList();
}

async function handleAdd() {
  isEdit.value = false;
  eimId.value = '';
  await formApi.resetForm();
  modalApi.open();
}

async function handleUpdate(record: any) {
  isEdit.value = true;
  eimId.value = record.eimId;
  const eid = deviceStore.currentEid;
  const res = await eimDetail(eid, record.eimId);
  const data = res.data;
  if (!data.counterValue) data.counterValue = '0';
  if (!data.eimPublicKey) {
    data.authenticationMethod = '1';
  } else {
    data.authenticationMethod = '0';
  }
  await formApi.setValues(data);
  modalApi.open();
}

async function handleDelete(record: any) {
  const eid = deviceStore.currentEid;
  await eimDelete(eid, record.eimId);
  await getList();
}

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 180 },
  schema: [
    {
      component: 'Input',
      fieldName: 'eimId',
      label: 'EIMId',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'eimFqdn',
      label: 'EIM地址',
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'eimIdType',
      label: 'EIMIdType',
      rules: 'required',
      componentProps: { options: getDictOptions('sys_eim_id'), placeholder: '请选择' },
    },
    {
      component: 'Input',
      fieldName: 'counterValue',
      label: 'counterValue',
    },
    {
      component: 'Input',
      fieldName: 'associationToken',
      label: 'associationToken',
      componentProps: { disabled: true },
    },
    {
      component: 'RadioGroup',
      fieldName: 'authenticationMethod',
      label: 'authenticationMethod',
      rules: 'required',
      defaultValue: '0',
      componentProps: { options: getDictOptions('sye_eim_method') },
    },
    {
      component: 'Input',
      fieldName: 'eimPublicKey',
      label: 'eimPublicKey',
      dependencies: {
        show(values) { return values.authenticationMethod === '0'; },
        triggerFields: ['authenticationMethod'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'trustedEimPkTls',
      label: 'trustedPublicKeyDataTls',
    },
    {
      component: 'Select',
      fieldName: 'eimSupportedProtocol',
      label: 'eimSupportedProtocol',
      rules: 'required',
      componentProps: { options: getDictOptions('sys_eim_sp'), placeholder: '请选择' },
    },
    {
      component: 'Input',
      fieldName: 'euiccCipkId',
      label: 'euiccCiPKld',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  class: 'w-[700px]',
  onClosed: async () => {
    await formApi.resetForm();
  },
  onConfirm: handleConfirm,
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const eid = deviceStore.currentEid;
    if (!isEdit.value) {
      await eimAdd(eid, values);
    } else {
      await eimEdit(eid, eimId.value, values);
    }
    await getList();
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

onMounted(() => {
  getList();
});
</script>

<template>
  <a-card>
    <template #extra>
      <Space>
        <a-button type="primary" @click="handleAdd">新增EIM</a-button>
        <a-button type="primary" @click="handleSynchronize">同步数据</a-button>
      </Space>
    </template>
    <a-table :data-source="tableData" :loading="loading" row-key="eimId">
      <a-table-column title="EIMId" data-index="eimId" />
      <a-table-column title="EIMIdType" data-index="eimIdType" />
      <a-table-column title="操作" fixed="right">
        <template #default="{ record }">
          <Space>
            <a-button type="link" size="small" @click="handleUpdate(record)">更新</a-button>
            <Popconfirm title="确认删除？删除后无法撤回" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger>删除</a-button>
            </Popconfirm>
          </Space>
        </template>
      </a-table-column>
    </a-table>
  </a-card>

  <BasicModal :title="isEdit ? '更新EIM' : '新增EIM'">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 2: 完成**

---

## Task 13: 设备管理 — 下载业务号页

**Files:**
- Create: `apps/web-antd/src/views/system/device/detail/add.vue`

- [ ] **Step 1: 创建下载业务号页**

Create `apps/web-antd/src/views/system/device/detail/add.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { message, Progress, Upload, Select } from 'antdv-next';
import { useRouter } from 'vue-router';

import { dpDownload, eimDownload, eimProfile, idDownload, toDownload, toResult } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { getDictOptions } from '#/utils/dict';

const router = useRouter();
const deviceStore = useDeviceStore();

const form = ref({ method: '0', code: undefined, issuer: undefined });
const progress = ref(0);
const errorCode = ref('');
const downloadData = ref<any>({});
const issuerList = ref<any[]>([]);

async function getIssuerList() {
  const res = await eimProfile();
  issuerList.value = res.data || [];
}

const radioOptions = getDictOptions('sys_code_method');

async function profileDownload() {
  progress.value = 0;
  errorCode.value = '';
  downloadData.value = {};
  const eid = deviceStore.currentEid;

  try {
    if (form.value.method === '0') {
      await dpDownload(eid);
    } else if (form.value.method === '3') {
      await idDownload(eid, form.value.issuer!);
    } else {
      const trigger = form.value.code;
      await toDownload(eid, { trigger });
    }
    errorCode.value = '200';
    message.success('开始下载资源，请稍等...');
    pollProgress(eid);
  } catch {
    errorCode.value = '500';
  }
}

async function pollProgress(eid: string) {
  const res = await eimDownload(eid);
  progress.value = res.data ?? 0;
  if (progress.value < 100) {
    setTimeout(() => pollProgress(eid), 500);
  } else {
    const result = await toResult(eid);
    downloadData.value = result.data || {};
  }
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  getIssuerList();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">返回</a-button>
    </div>
    <a-card title="下载业务号">
      <a-form layout="vertical" class="max-w-lg">
        <a-form-item label="请求方式：">
          <a-radio-group v-model:value="form.method">
            <a-radio v-for="item in radioOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="form.method === '1'" label="输入QRcode：">
          <a-textarea v-model:value="form.code" placeholder="请输入QRcode" />
        </a-form-item>

        <a-form-item v-if="form.method === '3'" label="资源运营商：">
          <Select
            v-model:value="form.issuer"
            placeholder="请选择资源运营商"
            :options="issuerList.map((i: any) => ({ label: i.issuer, value: i.id }))"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="profileDownload">
            {{ form.method === '0' || form.method === '3' ? '获取并下载资源' : '识别并下载资源' }}
          </a-button>
        </a-form-item>

        <a-form-item v-if="errorCode === '200'" label="下载进度：">
          <Progress :percent="progress" />
        </a-form-item>
        <a-form-item v-if="errorCode === '500'" label="下载进度：">
          <span style="color: red">下载失败，请重新扫码或联系客服人员</span>
        </a-form-item>

        <template v-if="progress >= 100 && downloadData">
          <a-form-item>
            <span style="font-size: 16px; font-weight: bold">{{ downloadData.iccid }}-详细信息</span>
          </a-form-item>
          <a-form-item><span>运营商：{{ downloadData.issue }}</span></a-form-item>
          <a-form-item><span>所属地：{{ downloadData.country }}</span></a-form-item>
          <a-form-item><span>ICCID：{{ downloadData.iccid }}</span></a-form-item>
        </template>
      </a-form>
    </a-card>
  </Page>
</template>
```

- [ ] **Step 2: 完成**

---

## Task 14: 设备管理 — 批量下载资源页

**Files:**
- Create: `apps/web-antd/src/views/system/device/download/index.vue`

- [ ] **Step 1: 创建批量下载资源页**

Create `apps/web-antd/src/views/system/device/download/index.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { InputNumber, RadioGroup, RadioButton, Select, Table, Pagination } from 'antdv-next';
import { useRouter } from 'vue-router';

import { batchAllocationAndDownload, batchListByProjectId } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

const router = useRouter();
const deviceStore = useDeviceStore();

const form = ref({ count: 0, productionBatch: undefined, use: false });
const batchDict = ref<any[]>([]);
const batchCountSum = ref(0);
const companyAndProject = ref('');
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

function sliceData() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
}

async function getData() {
  const list = deviceStore.downloadList;
  tableData.value = [...list];
  if (!list.length) return;

  const firstItem = list[0];
  const projectId = firstItem.projectId || '';
  companyAndProject.value = `当前企业${firstItem.companyName}的项目${firstItem.projectName}`;

  const res = await batchListByProjectId(projectId);
  const batches = res.data || [];
  batchCountSum.value = 0;
  batchDict.value = batches.map((item: any) => {
    batchCountSum.value += item.canBeInstalledCount || 0;
    return { label: item.productionBatch, value: item.productionBatch };
  });

  sliceData();
}

function allocation() {
  tableData.value.forEach((item: any) => {
    item.productionBatch = form.value.productionBatch;
    item.count = form.value.count;
  });
  sliceData();
}

async function handleDownload() {
  allocation();
  const data = {
    use: form.value.use,
    deviceList: tableData.value.map((item: any) => ({
      eid: item.eid,
      productionBatch: item.productionBatch,
      projectId: item.projectId,
      count: item.count,
    })),
  };
  await batchAllocationAndDownload(data);
  deviceStore.clearDownloadList();
  router.push({ path: '/system/task' });
}

function handlePageChange(page: number) {
  currentPage.value = page;
  sliceData();
}

function handleSizeChange(current: number, size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  sliceData();
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  getData();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">返回</a-button>
    </div>
    <a-card>
      <p class="mb-4">{{ companyAndProject }}，共有{{ batchCountSum }}个可分配资源</p>

      <div class="mb-4 flex items-center gap-4">
        <span>单个设备分配资源数：</span>
        <InputNumber v-model:value="form.count" :min="0" />
        <span>批次：</span>
        <Select v-model:value="form.productionBatch" :options="batchDict" placeholder="请选择批次" class="w-48" />
        <a-button type="primary" @click="allocation">分配适用</a-button>
        <span>资源立即启用：</span>
        <RadioGroup v-model:value="form.use">
          <RadioButton :value="true">是</RadioButton>
          <RadioButton :value="false">否</RadioButton>
        </RadioGroup>
      </div>

      <a-button type="primary" class="mb-4" @click="handleDownload">资源分配并执行下载工作</a-button>

      <Table :data-source="paginatedData" row-key="eid" :pagination="false">
        <a-table-column title="EID" data-index="eid" />
        <a-table-column title="预制种子号" data-index="iccid" />
        <a-table-column title="归属企业" data-index="companyName" />
        <a-table-column title="归属项目" data-index="projectName" />
        <a-table-column title="设备名称" data-index="name" />
        <a-table-column title="批次">
          <template #default="{ record }">
            <Select v-model:value="record.productionBatch" :options="batchDict" class="w-32" />
          </template>
        </a-table-column>
        <a-table-column title="分配资源数量">
          <template #default="{ record }">
            <InputNumber v-model:value="record.count" :min="0" />
          </template>
        </a-table-column>
        <a-table-column title="ICCID" data-index="iccidList" />
      </Table>
      <Pagination
        v-if="totalItems > 0"
        class="mt-4"
        :current="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        :page-size-options="['10', '20', '30', '50']"
        show-quick-jumper
        show-size-changer
        @change="handlePageChange"
        @showSizeChange="handleSizeChange"
      />
    </a-card>
  </Page>
</template>
```

- [ ] **Step 2: 完成**

## Task 7: Profile来源管理 — API层

**Files:**
- Create: `apps/web-antd/src/api/system/profile/index.ts`
- Create: `apps/web-antd/src/api/system/profile/model.d.ts`

- [ ] **Step 1: 创建Profile类型定义文件**

Create `apps/web-antd/src/api/system/profile/model.d.ts`:

```typescript
export interface ProfileQuery {
  pageNum?: number;
  pageSize?: number;
  dpSource?: string;
  iccid?: string;
  eid?: string;
  state?: string;
  companyId?: string;
  projectId?: string;
  assigned?: boolean;
  installed?: boolean;
}

export interface ProfileVO {
  dpSource: string;
  iccid: string;
  imsi: string;
  isdpAid: string;
  eid: string;
  nick: string;
  profileClass: string;
  type: string;
  providerName: string;
  state: string;
  createTime: string;
  updateTime: string;
  carrierName: string;
  productionBatch: string;
  assignedState: string;
  companyName: string;
  projectName: string;
  installedState: string;
}

export interface AllocationForm {
  productionBatch?: string;
  projectId?: string;
  size?: number;
}
```

- [ ] **Step 2: 创建Profile API接口文件**

Create `apps/web-antd/src/api/system/profile/index.ts`:

```typescript
import type { AllocationForm, ProfileQuery } from './model';
import type { ID, PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  profileList = '/manager/profile/list',
  profileSync = '/manager/profile/sync',
  profileBatch = '/manager/profile/productionBatch',
  profileAssign = '/manager/profile/assign',
  root = '/manager/profile',
}

export function profileList(params?: ProfileQuery) {
  return alovaInstance.get<PageResult<any>>(Api.profileList, { params });
}

export function handleSync() {
  return alovaInstance.postWithMsg<void>(Api.profileSync);
}

export function allBatchList() {
  return alovaInstance.get<any>(Api.profileBatch);
}

export function batchAllowableNumber(productionBatch: string) {
  return alovaInstance.get<any>(`${Api.profileBatch}/${productionBatch}`);
}

export function handleAllocation(data: AllocationForm) {
  return alovaInstance.postWithMsg<void>(Api.profileAssign, data);
}

export function updateProfileApn(id: ID, apnId: ID) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${id}/apn/${apnId}`);
}
```

- [ ] **Step 3: 完成**

---

## Task 8: Profile来源管理 — 视图层

**Files:**
- Create: `apps/web-antd/src/views/system/profile/data.ts`
- Create: `apps/web-antd/src/views/system/profile/index.vue`
- Create: `apps/web-antd/src/views/system/profile/allocation-modal.vue`
- Create: `apps/web-antd/src/views/system/profile/batch-import-modal.vue`
- Create: `apps/web-antd/src/views/system/profile/apn-modal.vue`

- [ ] **Step 1: 创建数据定义文件**

Create `apps/web-antd/src/views/system/profile/data.ts`:

```typescript
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'dpSource',
    label: 'DP+来源',
  },
  {
    component: 'Input',
    fieldName: 'iccid',
    label: 'ICCID',
  },
  {
    component: 'Input',
    fieldName: 'eid',
    label: 'EID',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions('sys_profile_state'),
    },
    fieldName: 'state',
    label: '状态',
  },
  {
    component: 'Input',
    fieldName: 'projectName',
    label: '所属项目',
  },
  {
    component: 'Input',
    fieldName: 'tenantName',
    label: '所属租户',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions('sys_allocate_status'),
    },
    fieldName: 'assigned',
    label: '分配状态',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions('sys_installed_status'),
    },
    fieldName: 'installed',
    label: '下号状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: '运营商', field: 'carrierName', width: 200 },
  { title: '批次', field: 'productionBatch', width: 200 },
  { title: 'APNID', field: 'apnId', width: 200 },
  { title: 'APN', field: 'apn', width: 200 },
  { title: '地区码', field: 'apnLocal', width: 200 },
  {
    title: '分配状态',
    field: 'assignedState',
    width: 200,
    slots: {
      default: ({ row }) => renderDict(row.assignedState, 'sys_allocate_status'),
    },
  },
  { title: '所属企业', field: 'companyName', width: 200 },
  { title: '所属项目', field: 'projectName', width: 200 },
  {
    title: '下号状态',
    field: 'installedState',
    width: 200,
    slots: {
      default: ({ row }) => renderDict(row.installedState, 'sys_installed_status'),
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];
```

- [ ] **Step 2: 创建资源分配弹窗**

Create `apps/web-antd/src/views/system/profile/allocation-modal.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { allBatchList, batchAllowableNumber, handleAllocation } from '#/api/system/profile';
import { getCompanyDict, getProjectDict } from '#/views/system/cardImport/hooks/useGetDict';

const emit = defineEmits<{ reload: [] }>();

const allowNum = ref(0);
const company = ref('');

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 100 },
  schema: [
    {
      component: 'Select',
      fieldName: 'productionBatch',
      label: '批次',
      rules: 'required',
      componentProps: {
        options: [],
        placeholder: '请选择',
        onChange: async (val: any) => {
          if (val) {
            const res = await batchAllowableNumber(val);
            allowNum.value = res.data ?? 0;
          } else {
            allowNum.value = 0;
          }
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'allowNum',
      label: '允许分配数量',
      componentProps: { disabled: true, placeholder: '选择批次后显示' },
    },
    {
      component: 'Select',
      fieldName: 'company',
      label: '归属企业',
      componentProps: {
        options: [],
        placeholder: '请选择',
        onChange: async (val: any) => {
          if (val) {
            const projectDict = await getProjectDict(val);
            formApi.updateSchema([
              { fieldName: 'projectId', componentProps: { options: projectDict } },
            ]);
          }
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'projectId',
      label: '归属项目',
      rules: 'required',
      componentProps: { options: [], placeholder: '请先选择归属企业' },
    },
    {
      component: 'InputNumber',
      fieldName: 'size',
      label: '数量',
      rules: 'required',
      componentProps: { min: 1 },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    allowNum.value = 0;
    company.value = '';
    const res = await allBatchList();
    const batchDict = (res.data || []).map((item: any) => ({ label: item, value: item }));
    const companyDict = await getCompanyDict();
    formApi.updateSchema([
      { fieldName: 'productionBatch', componentProps: { options: batchDict } },
      { fieldName: 'company', componentProps: { options: companyDict } },
    ]);
    await formApi.resetForm();
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    await handleAllocation({
      productionBatch: values.productionBatch,
      projectId: values.projectId,
      size: values.size,
    });
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
  <BasicModal title="资源分配" class="w-[600px]">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 3: 创建批量导入弹窗**

Create `apps/web-antd/src/views/system/profile/batch-import-modal.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Table, Pagination, Upload, Alert } from 'antdv-next';

import { useAccessStore } from '#/stores';

const emit = defineEmits<{ reload: [] }>();

const fileList = ref<any[]>([]);
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const errorToken = ref('');
const uploadSuccess = ref(false);

const tableColumns = [
  { title: 'ICCID', dataIndex: 'iccid' },
  { title: '运营商', dataIndex: 'carrierName' },
  { title: '批次', dataIndex: 'productionBatch' },
  { title: 'DP+来源', dataIndex: 'dpSource' },
  { title: '数据校验', dataIndex: 'result' },
];

function sliceData() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
}

function handleUploadChange(info: any) {
  const res = info.file?.response;
  if (res) {
    if (res.code === 200) {
      uploadSuccess.value = true;
      tableData.value = res.data?.importResultList || [];
      errorToken.value = res.data?.errorToken || '';
      totalItems.value = tableData.value.length;
      sliceData();
      message.success('导入完成');
    } else {
      message.error('文件上传失败');
    }
  }
}

function handlePageChange(page: number) {
  currentPage.value = page;
  sliceData();
}

function handleSizeChange(current: number, size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  sliceData();
}

function init() {
  tableData.value = [];
  paginatedData.value = [];
  totalItems.value = 0;
  fileList.value = [];
  errorToken.value = '';
  uploadSuccess.value = false;
}

const uploadHeaders = {
  Authorization: `Bearer ${useAccessStore().accessToken}`,
};

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  width: 1200,
  onConfirm: () => {
    if (uploadSuccess.value) {
      emit('reload');
    }
    init();
    modalApi.close();
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) init();
  },
});
</script>

<template>
  <BasicModal title="批量导入">
    <Upload
      v-model:file-list="fileList"
      accept=".xlsx"
      :max-count="1"
      :action="`${import.meta.env.VITE_GLOB_API_URL}/manager/profile/import`"
      :headers="uploadHeaders"
      @change="handleUploadChange"
    >
      <a-button>上传文件</a-button>
    </Upload>
    <Alert class="mt-4" type="info" show-icon message="温馨提示：请按照模板格式输入信息，数据量不要超过10000条；只支持xlsx格式文件" />
    <div v-if="paginatedData.length > 0" class="mt-4">
      <p>导入失败记录</p>
      <Table :columns="tableColumns" :data-source="paginatedData" :pagination="false" row-key="iccid" />
      <Pagination
        class="mt-4"
        :current="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        :page-size-options="['10', '20', '30', '50']"
        show-quick-jumper
        show-size-changer
        @change="handlePageChange"
        @showSizeChange="handleSizeChange"
      />
    </div>
  </BasicModal>
</template>
```

- [ ] **Step 4: 创建APN更新弹窗**

Create `apps/web-antd/src/views/system/profile/apn-modal.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { updateProfileApn } from '#/api/system/profile';
import { listApn } from '#/api/system/apn';

const emit = defineEmits<{ reload: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 80 },
  schema: [
    {
      component: 'Input',
      fieldName: 'iccid',
      label: 'ICCID',
      componentProps: { disabled: true },
    },
    {
      component: 'ApiSelect',
      fieldName: 'apnId',
      label: 'APNID',
      rules: 'required',
      componentProps: {
        api: async () => {
          const res = await listApn();
          return (res.rows || []).map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
        },
        placeholder: '请选择APN',
      },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { row?: any };
    if (data?.row) {
      await formApi.setValues({
        iccid: data.row.iccid,
        id: data.row.id,
        apnId: undefined,
      });
    }
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    await updateProfileApn(values.id, values.apnId);
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
  <BasicModal title="APN更新" class="w-[550px]">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 5: 创建Profile列表主页面**

Create `apps/web-antd/src/views/system/profile/index.vue`:

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Space } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { handleSync, profileList } from '#/api/system/profile';

import AllocationModal from './allocation-modal.vue';
import ApnModalComp from './apn-modal.vue';
import BatchImportModal from './batch-import-modal.vue';
import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 88,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await profileList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'iccid' },
  id: 'system-profile-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [AllocationModalComp, allocationApi] = useVbenModal({ connectedComponent: AllocationModal });
const [BatchImportModalComp, importApi] = useVbenModal({ connectedComponent: BatchImportModal });
const [ApnModal, apnApi] = useVbenModal({ connectedComponent: ApnModalComp });

async function handleDataSync() {
  await handleSync();
  await tableApi.query();
}

function handleAllocation() {
  allocationApi.open();
}

function handleBatchImport() {
  importApi.open();
}

function handleApnUpdate(row: any) {
  apnApi.setData({ row });
  apnApi.open();
}

function handleDownloadTemplate() {
  window.open(`${import.meta.env.VITE_GLOB_API_URL}/manager/profile/import/template`);
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="Profile来源管理">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleDataSync">同步数据</a-button>
          <a-button type="primary" @click="handleAllocation">资源分配</a-button>
          <a-button type="primary" @click="handleBatchImport">批量导入</a-button>
          <a-button @click="handleDownloadTemplate">下载批量导入模板</a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <action-button @click.stop="handleApnUpdate(row)">更新</action-button>
        </Space>
      </template>
    </BasicTable>
    <AllocationModalComp @reload="tableApi.query()" />
    <BatchImportModalComp @reload="tableApi.query()" />
    <ApnModal @reload="tableApi.query()" />
  </Page>
</template>
```

- [ ] **Step 6: 完成**

---

## Task 9: 设备管理 — API层 + Store

**Files:**
- Create: `apps/web-antd/src/api/system/device/index.ts`
- Create: `apps/web-antd/src/api/system/device/model.d.ts`
- Create: `apps/web-antd/src/store/device.ts`

- [ ] **Step 1: 创建设备类型定义文件**

Create `apps/web-antd/src/api/system/device/model.d.ts`:

```typescript
export interface DeviceQuery {
  pageNum?: number;
  pageSize?: number;
  eid?: string;
  iccid?: string;
  online?: number;
  eimFqdn?: string;
  companyId?: string;
  projectId?: string;
}

export interface DeviceVO {
  id: number;
  eid: string;
  iccid: string;
  companyName: string;
  projectName: string;
  name: string;
  profileCount: number;
  online: number;
  eimFqdn: string;
  creationTime: string;
}

export interface ChangeEimForm {
  eimId?: string;
  eimFqdn?: string;
  eimIdType?: string;
  counterValue?: string;
  associationToken?: string;
  authenticationMethod?: string;
  eimPublicKey?: string;
}

export interface DeviceForm {
  eid?: string;
  eimIdOriginal?: string;
  eimId?: string;
  eimFqdn?: string;
  eimIdType?: string;
  counterValue?: string;
  associationToken?: string;
  authenticationMethod?: string | number;
  eimPublicKey?: string;
  eimCertificate?: any;
  trustedEimPkTls?: string;
  eimSupportedProtocol?: string;
  euiccCipkId?: string;
}

export interface AllocationAndDownload {
  use?: boolean;
  deviceList?: {
    eid?: string;
    productionBatch?: string;
    projectId?: string;
    count?: string;
  }[];
}
```

- [ ] **Step 2: 创建设备API接口文件**

Create `apps/web-antd/src/api/system/device/index.ts`:

```typescript
import type { AllocationAndDownload, DeviceQuery } from './model';
import type { ID, PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  deviceList = '/manager/device/list',
  deviceRoot = '/manager/device',
  eimProfile = '/eimProfile',
  batchDownload = '/manager/device/batch/profileDownload',
  batchImport = '/manager/device/batch/profileDownload/import',
  profileBatch = '/manager/profile/productionBatch',
}

// 设备列表
export function deviceList(params?: DeviceQuery) {
  return alovaInstance.get<PageResult<any>>(Api.deviceList, { params });
}

// 设备详情
export function deviceDetail(eid: ID) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}`);
}

// 同步数据
export function updateDetail(eid: ID) {
  return alovaInstance.post<any>(`${Api.deviceRoot}/${eid}/profile/list`);
}

// 修改设备名称
export function deviceName(eid: ID, data: { name: string }) {
  return alovaInstance.post<void>(`${Api.deviceRoot}/${eid}/name`, data);
}

// 修改企业名称
export function companyName(eid: ID, data: { name: string }) {
  return alovaInstance.post<void>(`${Api.deviceRoot}/${eid}/companyName`, data);
}

// 启用业务号
export function toEnable(eid: ID, iccid: string) {
  return alovaInstance.patch<void>(`${Api.deviceRoot}/${eid}/profile/${iccid}/enable`);
}

// 停用业务号
export function toDisable(eid: ID, iccid: string) {
  return alovaInstance.patch<void>(`${Api.deviceRoot}/${eid}/profile/${iccid}/disable`);
}

// 删除业务号
export function toDelete(eid: ID, iccid: string) {
  return alovaInstance.deleteWithMsg<void>(`${Api.deviceRoot}/${eid}/profile/${iccid}`);
}

// 运营信息列表
export function operationLog(eid: ID, params?: any) {
  return alovaInstance.get<PageResult<any>>(`${Api.deviceRoot}/${eid}/log/list`, { params });
}

// EIM列表
export function eimList(eid: ID) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}/eim/list`);
}

// EIM详情
export function eimDetail(eid: ID, eimId: string) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}/eim/${eimId}`);
}

// 新增EIM
export function eimAdd(eid: ID, data: any) {
  return alovaInstance.postWithMsg<void>(`${Api.deviceRoot}/${eid}/eim`, data);
}

// 修改EIM
export function eimEdit(eid: ID, eimId: string, data: any) {
  return alovaInstance.patchWithMsg<void>(`${Api.deviceRoot}/${eid}/eim/${eimId}`, data);
}

// 替换EIM
export function eimChange(eid: ID, eimId: string, data: any) {
  return alovaInstance.post<void>(`${Api.deviceRoot}/${eid}/eim/${eimId}/change`, data);
}

// 删除EIM
export function eimDelete(eid: ID, eimId: string) {
  return alovaInstance.deleteWithMsg<void>(`${Api.deviceRoot}/${eid}/eim/${eimId}`);
}

// 同步EIM
export function updateEim(eid: ID) {
  return alovaInstance.post<any>(`${Api.deviceRoot}/${eid}/eim/listEim`);
}

// 查询下载进度
export function eimDownload(eid: ID) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}/profileDownload`);
}

// 获取并下载业务号
export function dpDownload(eid: ID) {
  return alovaInstance.post<any>(`${Api.deviceRoot}/${eid}/dp/profileDownload`);
}

// 识别并下载业务号
export function toDownload(eid: ID, data: any) {
  return alovaInstance.post<any>(`${Api.deviceRoot}/${eid}/profileDownload`, data);
}

// 使用运营商资源下载
export function idDownload(eid: ID, id: ID) {
  return alovaInstance.get<any>(`${Api.eimProfile}/${eid}/use/${id}`);
}

// 下载结果
export function toResult(eid: ID) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}/profileDownload/result`);
}

// 修改APN
export function updateProfileApn(eid: ID, iccid: string, apnId: ID) {
  return alovaInstance.patchWithMsg<void>(`${Api.deviceRoot}/${eid}/profile/${iccid}/apn/${apnId}`);
}

// 获取运营商列表
export function eimProfile() {
  return alovaInstance.get<any>(Api.eimProfile);
}

// 获取指定项目下的批次
export function batchListByProjectId(projectId: string) {
  return alovaInstance.get<any>(`${Api.profileBatch}/${projectId}`);
}

// 获取指定批次的可分配数量
export function countByBatchId(productionBatch: string) {
  return alovaInstance.get<any>(`/manager/profile/canBeAssignCount/${productionBatch}`);
}

// 批量下发资源
export function batchAllocationAndDownload(data: AllocationAndDownload) {
  return alovaInstance.postWithMsg<void>(Api.batchDownload, data);
}
```

- [ ] **Step 3: 创建设备Store（替代localStorage）**

Create `apps/web-antd/src/store/device.ts`:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDeviceStore = defineStore('app-device', () => {
  const currentEid = ref('');
  const downloadList = ref<any[]>([]);

  function setCurrentEid(eid: string) {
    currentEid.value = eid;
  }

  function setDownloadList(list: any[]) {
    downloadList.value = list;
  }

  function clearDownloadList() {
    downloadList.value = [];
  }

  return {
    currentEid,
    downloadList,
    clearDownloadList,
    setCurrentEid,
    setDownloadList,
  };
});
```

- [ ] **Step 4: 完成**

---

## Task 10: 设备管理 — 列表页和弹窗

**Files:**
- Create: `apps/web-antd/src/views/system/device/data.ts`
- Create: `apps/web-antd/src/views/system/device/index.vue`
- Create: `apps/web-antd/src/views/system/device/batch-import-modal.vue`
- Create: `apps/web-antd/src/views/system/device/change-eim-modal.vue`

- [ ] **Step 1: 创建数据定义文件**

Create `apps/web-antd/src/views/system/device/data.ts`:

```typescript
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'eid',
    label: 'EID',
  },
  {
    component: 'Input',
    fieldName: 'iccid',
    label: '预制种子号',
  },
  {
    component: 'Input',
    fieldName: 'eimFqdn',
    label: 'EIMId',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions('sys_device_status'),
    },
    fieldName: 'online',
    label: '在线状态',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '设备名称',
  },
  {
    component: 'Input',
    fieldName: 'projectName',
    label: '所属项目',
  },
  {
    component: 'Input',
    fieldName: 'tenantName',
    label: '所属租户',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'EID', field: 'eid' },
  { title: '预制种子号', field: 'iccid' },
  { title: 'EIMId', field: 'eimFqdn' },
  { title: '设备名称', field: 'name' },
  {
    title: '在线状态',
    field: 'online',
    slots: {
      default: ({ row }) => renderDict(row.online, 'sys_device_status'),
    },
  },
  { title: '所属项目', field: 'projectName' },
  { title: '所属租户', field: 'companyName' },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];
```

- [ ] **Step 2: 创建导入分配资源弹窗**

Create `apps/web-antd/src/views/system/device/batch-import-modal.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Table, Pagination, Upload, Alert, RadioGroup, RadioButton } from 'antdv-next';

import { useAccessStore } from '#/stores';

const emit = defineEmits<{ reload: [] }>();

const fileList = ref<any[]>([]);
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const errorToken = ref('');
const uploadSuccess = ref(false);
const enable = ref(false);

const tableColumns = [
  { title: 'EID', dataIndex: 'eid' },
  { title: '批次', dataIndex: 'productionBatch' },
  { title: '资源码号', dataIndex: 'iccidList' },
  { title: '数据校验', dataIndex: 'result' },
];

function sliceData() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
}

function handleUploadChange(info: any) {
  const res = info.file?.response;
  if (res) {
    if (res.code === 200) {
      uploadSuccess.value = true;
      tableData.value = res.data?.importResultList || [];
      errorToken.value = res.data?.errorToken || '';
      totalItems.value = tableData.value.length;
      sliceData();
      message.success('导入完成');
    } else {
      message.error('文件上传失败');
    }
  }
}

function handlePageChange(page: number) {
  currentPage.value = page;
  sliceData();
}

function handleSizeChange(current: number, size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  sliceData();
}

function init() {
  tableData.value = [];
  paginatedData.value = [];
  totalItems.value = 0;
  fileList.value = [];
  errorToken.value = '';
  uploadSuccess.value = false;
  enable.value = false;
}

const uploadHeaders = {
  Authorization: `Bearer ${useAccessStore().accessToken}`,
};

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  width: 1200,
  onConfirm: () => {
    if (uploadSuccess.value) {
      emit('reload');
    }
    init();
    modalApi.close();
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) init();
  },
});
</script>

<template>
  <BasicModal title="导入分配资源">
    <div class="mb-4">
      <span class="mr-2">资源立即启用：</span>
      <RadioGroup v-model:value="enable">
        <RadioButton :value="true">是</RadioButton>
        <RadioButton :value="false">否</RadioButton>
      </RadioGroup>
    </div>
    <Upload
      v-model:file-list="fileList"
      accept=".xlsx"
      :max-count="1"
      :action="`${import.meta.env.VITE_GLOB_API_URL}/manager/device/batch/profileDownload/import/${enable.value}`"
      :headers="uploadHeaders"
      @change="handleUploadChange"
    >
      <a-button>上传文件</a-button>
    </Upload>
    <Alert class="mt-4" type="info" show-icon message="温馨提示：请按照模板格式输入信息，数据量不要超过10000条；只支持xlsx格式文件；默认每个设备分配1个资源码号" />
    <div v-if="paginatedData.length > 0" class="mt-4">
      <Table :columns="tableColumns" :data-source="paginatedData" :pagination="false" row-key="eid" />
      <Pagination
        class="mt-4"
        :current="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        :page-size-options="['10', '20', '30', '50']"
        show-quick-jumper
        show-size-changer
        @change="handlePageChange"
        @showSizeChange="handleSizeChange"
      />
    </div>
  </BasicModal>
</template>
```

- [ ] **Step 3: 创建替换EIM弹窗**

Create `apps/web-antd/src/views/system/device/change-eim-modal.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { eimChange, eimList } from '#/api/system/device';
import { getDictOptions } from '#/utils/dict';

const emit = defineEmits<{ reload: [] }>();

const eidList = ref<string[]>([]);
const eimIdList = ref<any[]>([]);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 180 },
  schema: [
    {
      component: 'Select',
      fieldName: 'eimIdOriginal',
      label: '原EIMId',
      rules: 'required',
      componentProps: { options: [], placeholder: '请选择原EIMId' },
    },
    {
      component: 'Input',
      fieldName: 'eimId',
      label: 'EIMId',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'eimFqdn',
      label: 'EIM地址',
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'eimIdType',
      label: 'EIMIdType',
      rules: 'required',
      componentProps: { options: getDictOptions('sys_eim_id'), placeholder: '请选择' },
    },
    {
      component: 'Input',
      fieldName: 'counterValue',
      label: 'counterValue',
    },
    {
      component: 'Input',
      fieldName: 'associationToken',
      label: 'associationToken',
      componentProps: { disabled: true },
    },
    {
      component: 'RadioGroup',
      fieldName: 'authenticationMethod',
      label: 'authenticationMethod',
      rules: 'required',
      defaultValue: '0',
      componentProps: { options: getDictOptions('sye_eim_method') },
    },
    {
      component: 'Input',
      fieldName: 'eimPublicKey',
      label: 'eimPublicKey',
      dependencies: {
        show(values) {
          return values.authenticationMethod === '0';
        },
        triggerFields: ['authenticationMethod'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'trustedEimPkTls',
      label: 'trustedPublicKeyDataTls',
    },
    {
      component: 'Select',
      fieldName: 'eimSupportedProtocol',
      label: 'eimSupportedProtocol',
      rules: 'required',
      componentProps: { options: getDictOptions('sys_eim_sp'), placeholder: '请选择' },
    },
    {
      component: 'Input',
      fieldName: 'euiccCipkId',
      label: 'euiccCiPKld',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  class: 'w-[700px]',
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    const data = modalApi.getData() as { eidList?: string[] };
    eidList.value = data?.eidList || [];
    eimIdList.value = [];
    for (const eid of eidList.value) {
      const res = await eimList(eid);
      (res.rows || []).forEach((val: any) => {
        eimIdList.value.push({ label: val.eimId, value: val.eimId });
      });
    }
    formApi.updateSchema([
      { fieldName: 'eimIdOriginal', componentProps: { options: eimIdList.value } },
    ]);
    await formApi.resetForm();
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    for (const eid of eidList.value) {
      await eimChange(eid, values.eimIdOriginal, values);
    }
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
  <BasicModal title="替换EIM">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 4: 创建设备列表主页面**

Create `apps/web-antd/src/views/system/device/index.vue`:

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DeviceVO } from '#/api/system/device/model';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Space } from 'antdv-next';
import { useRouter } from 'vue-router';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deviceList } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

import BatchImportModal from './batch-import-modal.vue';
import ChangeEimModal from './change-eim-modal.vue';
import { columns, querySchema } from './data';

const router = useRouter();
const deviceStore = useDeviceStore();
const showSelect = ref(false);
const selectType = ref('');
const selectArray = ref<DeviceVO[]>([]);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 88,
    componentProps: { allowClear: true },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: { highlight: true, reserve: true },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await deviceList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'system-device-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [BatchImportModalComp, importApi] = useVbenModal({ connectedComponent: BatchImportModal });
const [ChangeEimModalComp, eimApi] = useVbenModal({ connectedComponent: ChangeEimModal });

function handleSelect(type: string) {
  showSelect.value = true;
  selectType.value = type;
}

async function handleConfirmSelect() {
  const rows = tableApi.grid.getCheckboxRecords();
  selectArray.value = rows;
  if (selectType.value === 'download') {
    deviceStore.setDownloadList(rows);
    router.push({ path: '/system/device/download' });
  } else if (selectType.value === 'eim') {
    const eids = rows.map((row: DeviceVO) => row.eid);
    eimApi.setData({ eidList: eids });
    eimApi.open();
  }
}

function cancelSelect() {
  showSelect.value = false;
  selectType.value = '';
  selectArray.value = [];
  tableApi.grid.clearCheckboxRow();
}

function handleView(row: DeviceVO) {
  deviceStore.setCurrentEid(row.eid);
  router.push({ path: '/system/device/detail', query: { id: row.eid } });
}

function handleDownloadTemplate() {
  window.open(`${import.meta.env.VITE_GLOB_API_URL}/manager/device/batch/profileDownload/importTemplate`);
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="设备列表">
      <template #toolbar-tools>
        <Space v-if="!showSelect">
          <a-button type="primary" @click="handleSelect('eim')">替换EIM</a-button>
          <a-button type="primary" @click="handleSelect('download')">批量下载资源</a-button>
          <a-button type="primary" @click="importApi.open()">导入分配资源</a-button>
          <a-button @click="handleDownloadTemplate">下载批量导入模板</a-button>
        </Space>
        <Space v-else>
          <a-button type="primary" :disabled="!selectArray.length" @click="handleConfirmSelect">确认</a-button>
          <a-button @click="cancelSelect">取消</a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <action-button @click.stop="handleView(row)">详细</action-button>
        </Space>
      </template>
    </BasicTable>
    <BatchImportModalComp @reload="tableApi.query()" />
    <ChangeEimModalComp @reload="tableApi.query()" />
  </Page>
</template>
```

- [ ] **Step 5: 完成**

---

## Task 12: 设备管理 — EIM LIST Tab

**Files:**
- Create: `apps/web-antd/src/views/system/device/detail/module/eim.vue`

- [ ] **Step 1: 创建EIM LIST Tab**

Create `apps/web-antd/src/views/system/device/detail/module/eim.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { eimAdd, eimDelete, eimDetail, eimEdit, eimList, updateEim } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { getDictOptions } from '#/utils/dict';

const deviceStore = useDeviceStore();
const loading = ref(true);
const tableData = ref<any[]>([]);
const isEdit = ref(false);
const eimId = ref('');

async function getList() {
  loading.value = true;
  const eid = deviceStore.currentEid;
  try {
    const res = await eimList(eid);
    tableData.value = res.rows || [];
  } finally {
    loading.value = false;
  }
}

async function handleSynchronize() {
  const eid = deviceStore.currentEid;
  await updateEim(eid);
  await getList();
}

async function handleAdd() {
  isEdit.value = false;
  eimId.value = '';
  await formApi.resetForm();
  modalApi.open();
}

async function handleUpdate(record: any) {
  isEdit.value = true;
  eimId.value = record.eimId;
  const eid = deviceStore.currentEid;
  const res = await eimDetail(eid, record.eimId);
  const data = res.data;
  if (!data.counterValue) data.counterValue = '0';
  if (!data.eimPublicKey) {
    data.authenticationMethod = '1';
  } else {
    data.authenticationMethod = '0';
  }
  await formApi.setValues(data);
  modalApi.open();
}

async function handleDelete(record: any) {
  const eid = deviceStore.currentEid;
  await eimDelete(eid, record.eimId);
  await getList();
}

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 180 },
  schema: [
    {
      component: 'Input',
      fieldName: 'eimId',
      label: 'EIMId',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'eimFqdn',
      label: 'EIM地址',
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'eimIdType',
      label: 'EIMIdType',
      rules: 'required',
      componentProps: { options: getDictOptions('sys_eim_id'), placeholder: '请选择' },
    },
    {
      component: 'Input',
      fieldName: 'counterValue',
      label: 'counterValue',
    },
    {
      component: 'Input',
      fieldName: 'associationToken',
      label: 'associationToken',
      componentProps: { disabled: true },
    },
    {
      component: 'RadioGroup',
      fieldName: 'authenticationMethod',
      label: 'authenticationMethod',
      rules: 'required',
      defaultValue: '0',
      componentProps: { options: getDictOptions('sye_eim_method') },
    },
    {
      component: 'Input',
      fieldName: 'eimPublicKey',
      label: 'eimPublicKey',
      dependencies: {
        show(values) { return values.authenticationMethod === '0'; },
        triggerFields: ['authenticationMethod'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'trustedEimPkTls',
      label: 'trustedPublicKeyDataTls',
    },
    {
      component: 'Select',
      fieldName: 'eimSupportedProtocol',
      label: 'eimSupportedProtocol',
      rules: 'required',
      componentProps: { options: getDictOptions('sys_eim_sp'), placeholder: '请选择' },
    },
    {
      component: 'Input',
      fieldName: 'euiccCipkId',
      label: 'euiccCiPKld',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  class: 'w-[700px]',
  onClosed: async () => {
    await formApi.resetForm();
  },
  onConfirm: handleConfirm,
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const eid = deviceStore.currentEid;
    if (!isEdit.value) {
      await eimAdd(eid, values);
    } else {
      await eimEdit(eid, eimId.value, values);
    }
    await getList();
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

onMounted(() => {
  getList();
});
</script>

<template>
  <a-card>
    <template #extra>
      <Space>
        <a-button type="primary" @click="handleAdd">新增EIM</a-button>
        <a-button type="primary" @click="handleSynchronize">同步数据</a-button>
      </Space>
    </template>
    <a-table :data-source="tableData" :loading="loading" row-key="eimId">
      <a-table-column title="EIMId" data-index="eimId" />
      <a-table-column title="EIMIdType" data-index="eimIdType" />
      <a-table-column title="操作" fixed="right">
        <template #default="{ record }">
          <Space>
            <a-button type="link" size="small" @click="handleUpdate(record)">更新</a-button>
            <Popconfirm title="确认删除？删除后无法撤回" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger>删除</a-button>
            </Popconfirm>
          </Space>
        </template>
      </a-table-column>
    </a-table>
  </a-card>

  <BasicModal :title="isEdit ? '更新EIM' : '新增EIM'">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 2: 完成**

---

## Task 13: 设备管理 — 下载业务号页

**Files:**
- Create: `apps/web-antd/src/views/system/device/detail/add.vue`

- [ ] **Step 1: 创建下载业务号页**

Create `apps/web-antd/src/views/system/device/detail/add.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { message, Progress, Upload, Select } from 'antdv-next';
import { useRouter } from 'vue-router';

import { dpDownload, eimDownload, eimProfile, idDownload, toDownload, toResult } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { getDictOptions } from '#/utils/dict';

const router = useRouter();
const deviceStore = useDeviceStore();

const form = ref({ method: '0', code: undefined, issuer: undefined });
const progress = ref(0);
const errorCode = ref('');
const downloadData = ref<any>({});
const issuerList = ref<any[]>([]);

async function getIssuerList() {
  const res = await eimProfile();
  issuerList.value = res.data || [];
}

const radioOptions = getDictOptions('sys_code_method');

async function profileDownload() {
  progress.value = 0;
  errorCode.value = '';
  downloadData.value = {};
  const eid = deviceStore.currentEid;

  try {
    if (form.value.method === '0') {
      await dpDownload(eid);
    } else if (form.value.method === '3') {
      await idDownload(eid, form.value.issuer!);
    } else {
      const trigger = form.value.code;
      await toDownload(eid, { trigger });
    }
    errorCode.value = '200';
    message.success('开始下载资源，请稍等...');
    pollProgress(eid);
  } catch {
    errorCode.value = '500';
  }
}

async function pollProgress(eid: string) {
  const res = await eimDownload(eid);
  progress.value = res.data ?? 0;
  if (progress.value < 100) {
    setTimeout(() => pollProgress(eid), 500);
  } else {
    const result = await toResult(eid);
    downloadData.value = result.data || {};
  }
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  getIssuerList();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">返回</a-button>
    </div>
    <a-card title="下载业务号">
      <a-form layout="vertical" class="max-w-lg">
        <a-form-item label="请求方式：">
          <a-radio-group v-model:value="form.method">
            <a-radio v-for="item in radioOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="form.method === '1'" label="输入QRcode：">
          <a-textarea v-model:value="form.code" placeholder="请输入QRcode" />
        </a-form-item>

        <a-form-item v-if="form.method === '3'" label="资源运营商：">
          <Select
            v-model:value="form.issuer"
            placeholder="请选择资源运营商"
            :options="issuerList.map((i: any) => ({ label: i.issuer, value: i.id }))"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="profileDownload">
            {{ form.method === '0' || form.method === '3' ? '获取并下载资源' : '识别并下载资源' }}
          </a-button>
        </a-form-item>

        <a-form-item v-if="errorCode === '200'" label="下载进度：">
          <Progress :percent="progress" />
        </a-form-item>
        <a-form-item v-if="errorCode === '500'" label="下载进度：">
          <span style="color: red">下载失败，请重新扫码或联系客服人员</span>
        </a-form-item>

        <template v-if="progress >= 100 && downloadData">
          <a-form-item>
            <span style="font-size: 16px; font-weight: bold">{{ downloadData.iccid }}-详细信息</span>
          </a-form-item>
          <a-form-item><span>运营商：{{ downloadData.issue }}</span></a-form-item>
          <a-form-item><span>所属地：{{ downloadData.country }}</span></a-form-item>
          <a-form-item><span>ICCID：{{ downloadData.iccid }}</span></a-form-item>
        </template>
      </a-form>
    </a-card>
  </Page>
</template>
```

- [ ] **Step 2: 完成**

---

## Task 14: 设备管理 — 批量下载资源页

**Files:**
- Create: `apps/web-antd/src/views/system/device/download/index.vue`

- [ ] **Step 1: 创建批量下载资源页**

Create `apps/web-antd/src/views/system/device/download/index.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { InputNumber, RadioGroup, RadioButton, Select, Table, Pagination } from 'antdv-next';
import { useRouter } from 'vue-router';

import { batchAllocationAndDownload, batchListByProjectId } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

const router = useRouter();
const deviceStore = useDeviceStore();

const form = ref({ count: 0, productionBatch: undefined, use: false });
const batchDict = ref<any[]>([]);
const batchCountSum = ref(0);
const companyAndProject = ref('');
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

function sliceData() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
}

async function getData() {
  const list = deviceStore.downloadList;
  tableData.value = [...list];
  if (!list.length) return;

  const firstItem = list[0];
  const projectId = firstItem.projectId || '';
  companyAndProject.value = `当前企业${firstItem.companyName}的项目${firstItem.projectName}`;

  const res = await batchListByProjectId(projectId);
  const batches = res.data || [];
  batchCountSum.value = 0;
  batchDict.value = batches.map((item: any) => {
    batchCountSum.value += item.canBeInstalledCount || 0;
    return { label: item.productionBatch, value: item.productionBatch };
  });

  sliceData();
}

function allocation() {
  tableData.value.forEach((item: any) => {
    item.productionBatch = form.value.productionBatch;
    item.count = form.value.count;
  });
  sliceData();
}

async function handleDownload() {
  allocation();
  const data = {
    use: form.value.use,
    deviceList: tableData.value.map((item: any) => ({
      eid: item.eid,
      productionBatch: item.productionBatch,
      projectId: item.projectId,
      count: item.count,
    })),
  };
  await batchAllocationAndDownload(data);
  deviceStore.clearDownloadList();
  router.push({ path: '/system/task' });
}

function handlePageChange(page: number) {
  currentPage.value = page;
  sliceData();
}

function handleSizeChange(current: number, size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  sliceData();
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  getData();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">返回</a-button>
    </div>
    <a-card>
      <p class="mb-4">{{ companyAndProject }}，共有{{ batchCountSum }}个可分配资源</p>

      <div class="mb-4 flex items-center gap-4">
        <span>单个设备分配资源数：</span>
        <InputNumber v-model:value="form.count" :min="0" />
        <span>批次：</span>
        <Select v-model:value="form.productionBatch" :options="batchDict" placeholder="请选择批次" class="w-48" />
        <a-button type="primary" @click="allocation">分配适用</a-button>
        <span>资源立即启用：</span>
        <RadioGroup v-model:value="form.use">
          <RadioButton :value="true">是</RadioButton>
          <RadioButton :value="false">否</RadioButton>
        </RadioGroup>
      </div>

      <a-button type="primary" class="mb-4" @click="handleDownload">资源分配并执行下载工作</a-button>

      <Table :data-source="paginatedData" row-key="eid" :pagination="false">
        <a-table-column title="EID" data-index="eid" />
        <a-table-column title="预制种子号" data-index="iccid" />
        <a-table-column title="归属企业" data-index="companyName" />
        <a-table-column title="归属项目" data-index="projectName" />
        <a-table-column title="设备名称" data-index="name" />
        <a-table-column title="批次">
          <template #default="{ record }">
            <Select v-model:value="record.productionBatch" :options="batchDict" class="w-32" />
          </template>
        </a-table-column>
        <a-table-column title="分配资源数量">
          <template #default="{ record }">
            <InputNumber v-model:value="record.count" :min="0" />
          </template>
        </a-table-column>
        <a-table-column title="ICCID" data-index="iccidList" />
      </Table>
      <Pagination
        v-if="totalItems > 0"
        class="mt-4"
        :current="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        :page-size-options="['10', '20', '30', '50']"
        show-quick-jumper
        show-size-changer
        @change="handlePageChange"
        @showSizeChange="handleSizeChange"
      />
    </a-card>
  </Page>
</template>
```

- [ ] **Step 2: 完成**

## Task 11: 设备管理 — 详情页子组件

**Files:**
- Create: `apps/web-antd/src/views/system/device/detail/index.vue`
- Create: `apps/web-antd/src/views/system/device/detail/add.vue`
- Create: `apps/web-antd/src/views/system/device/detail/module/basic.vue`
- Create: `apps/web-antd/src/views/system/device/detail/module/operation.vue`
- Create: `apps/web-antd/src/views/system/device/detail/module/apn-modal.vue`

- [ ] **Step 1: 创建设备详情主页（Tab容器）**

Create `apps/web-antd/src/views/system/device/detail/index.vue`:

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router';

import Basic from './module/basic.vue';
import Operation from './module/operation.vue';
import Eim from './module/eim.vue';

const router = useRouter();
const activeKey = ref('basic');

function backTo() {
  router.go(-1);
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">返回</a-button>
    </div>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="basic" tab="基本信息">
        <Basic />
      </a-tab-pane>
      <a-tab-pane key="operation" tab="运营信息">
        <Operation />
      </a-tab-pane>
      <a-tab-pane key="eim" tab="EIM LIST">
        <Eim />
      </a-tab-pane>
    </a-tabs>
  </Page>
</template>
```

- [ ] **Step 2: 创建基本信息Tab**

Create `apps/web-antd/src/views/system/device/detail/module/basic.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Switch } from 'antdv-next';
import { useRouter } from 'vue-router';

import { deviceDetail, toDelete, toDisable, toEnable, updateDetail } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { renderDict } from '#/utils/render';

import ApnModal from './apn-modal.vue';

const router = useRouter();
const deviceStore = useDeviceStore();
const loading = ref(true);
const detailData = ref<any>({});
const tableData = ref<any[]>([]);

const [ApnModalComp, apnApi] = useVbenModal({ connectedComponent: ApnModal });

async function getList() {
  loading.value = true;
  const eid = deviceStore.currentEid;
  try {
    const res = await deviceDetail(eid);
    detailData.value = res.data;
    tableData.value = (res.data.profileList || []).map((item: any) => ({
      ...item,
      state: String(item.state),
    }));
  } finally {
    loading.value = false;
  }
}

async function handleSync() {
  const eid = deviceStore.currentEid;
  await updateDetail(eid);
  await getList();
}

async function handleEnable(row: any) {
  const eid = deviceStore.currentEid;
  await toEnable(eid, row.iccid);
  await getList();
  return true;
}

async function handleDisable(row: any) {
  const eid = deviceStore.currentEid;
  await toDisable(eid, row.iccid);
  await getList();
  return true;
}

async function handleDelete(row: any) {
  const eid = deviceStore.currentEid;
  await toDelete(eid, row.iccid);
  await getList();
}

function handleAdd() {
  router.push({ path: '/system/device/add' });
}

function handleEditApn(row: any) {
  apnApi.setData({ row });
  apnApi.open();
}

onMounted(() => {
  getList();
});
</script>

<template>
  <div>
    <div class="flex justify-around">
      <div class="flex-1 ml-8">
        <div class="mb-2">EID: {{ detailData.eid || '--' }}</div>
        <div class="mb-2">设备SN: {{ detailData.name || '--' }}</div>
        <div class="mb-2">预制种子号: {{ detailData.iccid || '--' }}</div>
        <div class="mb-2">创建时间: {{ detailData.creationTime || '--' }}</div>
      </div>
      <div class="flex-1">
        <div class="mb-2">EIM: {{ detailData.eimFqdn || '--' }}</div>
        <div class="mb-2">在线状态: <component :is="() => renderDict(detailData.online, 'sys_device_status')" /></div>
        <div class="mb-2">激活时间: {{ detailData.activationTime || '--' }}</div>
      </div>
    </div>

    <a-card title="业务号信息" class="mt-4">
      <template #extra>
        <Space>
          <a-button type="primary" @click="handleAdd">下载业务号</a-button>
          <a-button type="primary" @click="handleSync">同步数据</a-button>
        </Space>
      </template>
      <a-table :data-source="tableData" :loading="loading" row-key="iccid" :pagination="{ pageSize: 10 }">
        <a-table-column title="运营商" data-index="issuer" />
        <a-table-column title="ICCID" data-index="iccid" />
        <a-table-column title="状态">
          <template #default="{ record }">
            <component :is="() => renderDict(record.state, 'sys_profile_status')" />
          </template>
        </a-table-column>
        <a-table-column title="APNID" data-index="apnId" />
        <a-table-column title="APN名称" data-index="apnName" />
        <a-table-column title="APN" data-index="apn" />
        <a-table-column title="操作" fixed="right">
          <template #default="{ record }">
            <Space>
              <Switch
                :checked="record.state === '1'"
                checked-children="启用"
                un-checked-children="停用"
                @change="record.state === '1' ? handleDisable(record) : handleEnable(record)"
              />
              <a-button type="link" size="small" @click="handleEditApn(record)">APN更新</a-button>
              <Popconfirm title="确认删除？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger>删除</a-button>
              </Popconfirm>
            </Space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
    <ApnModalComp @reload="getList()" />
  </div>
</template>
```

- [ ] **Step 3: 创建运营信息Tab**

Create `apps/web-antd/src/views/system/device/detail/module/operation.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { operationLog } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

const deviceStore = useDeviceStore();
const loading = ref(true);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
});

async function getList() {
  loading.value = true;
  const eid = deviceStore.currentEid;
  try {
    const res = await operationLog(eid, queryParams.value);
    tableData.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getList();
});
</script>

<template>
  <a-card>
    <template #extra>
      <a-button type="primary" @click="getList">同步数据</a-button>
    </template>
    <a-table
      :data-source="tableData"
      :loading="loading"
      row-key="creationTime"
      :pagination="{ current: queryParams.pageNum, pageSize: queryParams.pageSize, total }"
      @change="(pag: any) => { queryParams.pageNum = pag.current; queryParams.pageSize = pag.pageSize; getList(); }"
    >
      <a-table-column title="创建时间" data-index="creationTime" :width="300" />
      <a-table-column title="动作" data-index="name" :width="200" />
      <a-table-column title="描述" data-index="message" />
    </a-table>
  </a-card>
</template>
```

- [ ] **Step 4: 创建APN更新弹窗**

Create `apps/web-antd/src/views/system/device/detail/module/apn-modal.vue`:

```vue
<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { updateProfileApn } from '#/api/system/device';
import { listApn } from '#/api/system/apn';
import { useDeviceStore } from '#/store/device';

const emit = defineEmits<{ reload: [] }>();
const deviceStore = useDeviceStore();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 80 },
  schema: [
    {
      component: 'Input',
      fieldName: 'iccid',
      label: 'ICCID',
      componentProps: { disabled: true },
    },
    {
      component: 'ApiSelect',
      fieldName: 'apnId',
      label: 'APNID',
      rules: 'required',
      componentProps: {
        api: async () => {
          const res = await listApn();
          return (res.rows || []).map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
        },
        placeholder: '请选择APN',
      },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { row?: any };
    if (data?.row) {
      await formApi.setValues({
        iccid: data.row.iccid,
        apnId: undefined,
      });
    }
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const eid = deviceStore.currentEid;
    await updateProfileApn(eid, values.iccid, values.apnId);
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
  <BasicModal title="APN更新" class="w-[550px]">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 5: 完成**

---

## Task 12: 设备管理 — EIM LIST Tab

**Files:**
- Create: `apps/web-antd/src/views/system/device/detail/module/eim.vue`

- [ ] **Step 1: 创建EIM LIST Tab**

Create `apps/web-antd/src/views/system/device/detail/module/eim.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { eimAdd, eimDelete, eimDetail, eimEdit, eimList, updateEim } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { getDictOptions } from '#/utils/dict';

const deviceStore = useDeviceStore();
const loading = ref(true);
const tableData = ref<any[]>([]);
const isEdit = ref(false);
const eimId = ref('');

async function getList() {
  loading.value = true;
  const eid = deviceStore.currentEid;
  try {
    const res = await eimList(eid);
    tableData.value = res.rows || [];
  } finally {
    loading.value = false;
  }
}

async function handleSynchronize() {
  const eid = deviceStore.currentEid;
  await updateEim(eid);
  await getList();
}

async function handleAdd() {
  isEdit.value = false;
  eimId.value = '';
  await formApi.resetForm();
  modalApi.open();
}

async function handleUpdate(record: any) {
  isEdit.value = true;
  eimId.value = record.eimId;
  const eid = deviceStore.currentEid;
  const res = await eimDetail(eid, record.eimId);
  const data = res.data;
  if (!data.counterValue) data.counterValue = '0';
  if (!data.eimPublicKey) {
    data.authenticationMethod = '1';
  } else {
    data.authenticationMethod = '0';
  }
  await formApi.setValues(data);
  modalApi.open();
}

async function handleDelete(record: any) {
  const eid = deviceStore.currentEid;
  await eimDelete(eid, record.eimId);
  await getList();
}

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 180 },
  schema: [
    {
      component: 'Input',
      fieldName: 'eimId',
      label: 'EIMId',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'eimFqdn',
      label: 'EIM地址',
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'eimIdType',
      label: 'EIMIdType',
      rules: 'required',
      componentProps: { options: getDictOptions('sys_eim_id'), placeholder: '请选择' },
    },
    {
      component: 'Input',
      fieldName: 'counterValue',
      label: 'counterValue',
    },
    {
      component: 'Input',
      fieldName: 'associationToken',
      label: 'associationToken',
      componentProps: { disabled: true },
    },
    {
      component: 'RadioGroup',
      fieldName: 'authenticationMethod',
      label: 'authenticationMethod',
      rules: 'required',
      defaultValue: '0',
      componentProps: { options: getDictOptions('sye_eim_method') },
    },
    {
      component: 'Input',
      fieldName: 'eimPublicKey',
      label: 'eimPublicKey',
      dependencies: {
        show(values) { return values.authenticationMethod === '0'; },
        triggerFields: ['authenticationMethod'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'trustedEimPkTls',
      label: 'trustedPublicKeyDataTls',
    },
    {
      component: 'Select',
      fieldName: 'eimSupportedProtocol',
      label: 'eimSupportedProtocol',
      rules: 'required',
      componentProps: { options: getDictOptions('sys_eim_sp'), placeholder: '请选择' },
    },
    {
      component: 'Input',
      fieldName: 'euiccCipkId',
      label: 'euiccCiPKld',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  class: 'w-[700px]',
  onClosed: async () => {
    await formApi.resetForm();
  },
  onConfirm: handleConfirm,
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const eid = deviceStore.currentEid;
    if (!isEdit.value) {
      await eimAdd(eid, values);
    } else {
      await eimEdit(eid, eimId.value, values);
    }
    await getList();
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

onMounted(() => {
  getList();
});
</script>

<template>
  <a-card>
    <template #extra>
      <Space>
        <a-button type="primary" @click="handleAdd">新增EIM</a-button>
        <a-button type="primary" @click="handleSynchronize">同步数据</a-button>
      </Space>
    </template>
    <a-table :data-source="tableData" :loading="loading" row-key="eimId">
      <a-table-column title="EIMId" data-index="eimId" />
      <a-table-column title="EIMIdType" data-index="eimIdType" />
      <a-table-column title="操作" fixed="right">
        <template #default="{ record }">
          <Space>
            <a-button type="link" size="small" @click="handleUpdate(record)">更新</a-button>
            <Popconfirm title="确认删除？删除后无法撤回" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger>删除</a-button>
            </Popconfirm>
          </Space>
        </template>
      </a-table-column>
    </a-table>
  </a-card>

  <BasicModal :title="isEdit ? '更新EIM' : '新增EIM'">
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 2: 完成**

---

## Task 13: 设备管理 — 下载业务号页

**Files:**
- Create: `apps/web-antd/src/views/system/device/detail/add.vue`

- [ ] **Step 1: 创建下载业务号页**

Create `apps/web-antd/src/views/system/device/detail/add.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { message, Progress, Upload, Select } from 'antdv-next';
import { useRouter } from 'vue-router';

import { dpDownload, eimDownload, eimProfile, idDownload, toDownload, toResult } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { getDictOptions } from '#/utils/dict';

const router = useRouter();
const deviceStore = useDeviceStore();

const form = ref({ method: '0', code: undefined, issuer: undefined });
const progress = ref(0);
const errorCode = ref('');
const downloadData = ref<any>({});
const issuerList = ref<any[]>([]);

async function getIssuerList() {
  const res = await eimProfile();
  issuerList.value = res.data || [];
}

const radioOptions = getDictOptions('sys_code_method');

async function profileDownload() {
  progress.value = 0;
  errorCode.value = '';
  downloadData.value = {};
  const eid = deviceStore.currentEid;

  try {
    if (form.value.method === '0') {
      await dpDownload(eid);
    } else if (form.value.method === '3') {
      await idDownload(eid, form.value.issuer!);
    } else {
      const trigger = form.value.code;
      await toDownload(eid, { trigger });
    }
    errorCode.value = '200';
    message.success('开始下载资源，请稍等...');
    pollProgress(eid);
  } catch {
    errorCode.value = '500';
  }
}

async function pollProgress(eid: string) {
  const res = await eimDownload(eid);
  progress.value = res.data ?? 0;
  if (progress.value < 100) {
    setTimeout(() => pollProgress(eid), 500);
  } else {
    const result = await toResult(eid);
    downloadData.value = result.data || {};
  }
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  getIssuerList();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">返回</a-button>
    </div>
    <a-card title="下载业务号">
      <a-form layout="vertical" class="max-w-lg">
        <a-form-item label="请求方式：">
          <a-radio-group v-model:value="form.method">
            <a-radio v-for="item in radioOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="form.method === '1'" label="输入QRcode：">
          <a-textarea v-model:value="form.code" placeholder="请输入QRcode" />
        </a-form-item>

        <a-form-item v-if="form.method === '3'" label="资源运营商：">
          <Select
            v-model:value="form.issuer"
            placeholder="请选择资源运营商"
            :options="issuerList.map((i: any) => ({ label: i.issuer, value: i.id }))"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="profileDownload">
            {{ form.method === '0' || form.method === '3' ? '获取并下载资源' : '识别并下载资源' }}
          </a-button>
        </a-form-item>

        <a-form-item v-if="errorCode === '200'" label="下载进度：">
          <Progress :percent="progress" />
        </a-form-item>
        <a-form-item v-if="errorCode === '500'" label="下载进度：">
          <span style="color: red">下载失败，请重新扫码或联系客服人员</span>
        </a-form-item>

        <template v-if="progress >= 100 && downloadData">
          <a-form-item>
            <span style="font-size: 16px; font-weight: bold">{{ downloadData.iccid }}-详细信息</span>
          </a-form-item>
          <a-form-item><span>运营商：{{ downloadData.issue }}</span></a-form-item>
          <a-form-item><span>所属地：{{ downloadData.country }}</span></a-form-item>
          <a-form-item><span>ICCID：{{ downloadData.iccid }}</span></a-form-item>
        </template>
      </a-form>
    </a-card>
  </Page>
</template>
```

- [ ] **Step 2: 完成**

---

## Task 14: 设备管理 — 批量下载资源页

**Files:**
- Create: `apps/web-antd/src/views/system/device/download/index.vue`

- [ ] **Step 1: 创建批量下载资源页**

Create `apps/web-antd/src/views/system/device/download/index.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { InputNumber, RadioGroup, RadioButton, Select, Table, Pagination } from 'antdv-next';
import { useRouter } from 'vue-router';

import { batchAllocationAndDownload, batchListByProjectId } from '#/api/system/device';
import { useDeviceStore } from '#/store/device';

const router = useRouter();
const deviceStore = useDeviceStore();

const form = ref({ count: 0, productionBatch: undefined, use: false });
const batchDict = ref<any[]>([]);
const batchCountSum = ref(0);
const companyAndProject = ref('');
const tableData = ref<any[]>([]);
const paginatedData = ref<any[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

function sliceData() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedData.value = tableData.value.slice(start, end);
}

async function getData() {
  const list = deviceStore.downloadList;
  tableData.value = [...list];
  if (!list.length) return;

  const firstItem = list[0];
  const projectId = firstItem.projectId || '';
  companyAndProject.value = `当前企业${firstItem.companyName}的项目${firstItem.projectName}`;

  const res = await batchListByProjectId(projectId);
  const batches = res.data || [];
  batchCountSum.value = 0;
  batchDict.value = batches.map((item: any) => {
    batchCountSum.value += item.canBeInstalledCount || 0;
    return { label: item.productionBatch, value: item.productionBatch };
  });

  sliceData();
}

function allocation() {
  tableData.value.forEach((item: any) => {
    item.productionBatch = form.value.productionBatch;
    item.count = form.value.count;
  });
  sliceData();
}

async function handleDownload() {
  allocation();
  const data = {
    use: form.value.use,
    deviceList: tableData.value.map((item: any) => ({
      eid: item.eid,
      productionBatch: item.productionBatch,
      projectId: item.projectId,
      count: item.count,
    })),
  };
  await batchAllocationAndDownload(data);
  deviceStore.clearDownloadList();
  router.push({ path: '/system/task' });
}

function handlePageChange(page: number) {
  currentPage.value = page;
  sliceData();
}

function handleSizeChange(current: number, size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  sliceData();
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  getData();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">返回</a-button>
    </div>
    <a-card>
      <p class="mb-4">{{ companyAndProject }}，共有{{ batchCountSum }}个可分配资源</p>

      <div class="mb-4 flex items-center gap-4">
        <span>单个设备分配资源数：</span>
        <InputNumber v-model:value="form.count" :min="0" />
        <span>批次：</span>
        <Select v-model:value="form.productionBatch" :options="batchDict" placeholder="请选择批次" class="w-48" />
        <a-button type="primary" @click="allocation">分配适用</a-button>
        <span>资源立即启用：</span>
        <RadioGroup v-model:value="form.use">
          <RadioButton :value="true">是</RadioButton>
          <RadioButton :value="false">否</RadioButton>
        </RadioGroup>
      </div>

      <a-button type="primary" class="mb-4" @click="handleDownload">资源分配并执行下载工作</a-button>

      <Table :data-source="paginatedData" row-key="eid" :pagination="false">
        <a-table-column title="EID" data-index="eid" />
        <a-table-column title="预制种子号" data-index="iccid" />
        <a-table-column title="归属企业" data-index="companyName" />
        <a-table-column title="归属项目" data-index="projectName" />
        <a-table-column title="设备名称" data-index="name" />
        <a-table-column title="批次">
          <template #default="{ record }">
            <Select v-model:value="record.productionBatch" :options="batchDict" class="w-32" />
          </template>
        </a-table-column>
        <a-table-column title="分配资源数量">
          <template #default="{ record }">
            <InputNumber v-model:value="record.count" :min="0" />
          </template>
        </a-table-column>
        <a-table-column title="ICCID" data-index="iccidList" />
      </Table>
      <Pagination
        v-if="totalItems > 0"
        class="mt-4"
        :current="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        :page-size-options="['10', '20', '30', '50']"
        show-quick-jumper
        show-size-changer
        @change="handlePageChange"
        @showSizeChange="handleSizeChange"
      />
    </a-card>
  </Page>
</template>
```

- [ ] **Step 2: 完成**

