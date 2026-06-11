# P4 — eUICC 模块重构 + OpenAPI 日志 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 4 个相对独立的子任务 — 库存管理重构（P4.1）、eUICC 管理重构（P4.2，最复杂，含 APN 同步与下载流程改造）、任务列表迁移（P4.3）、OpenAPI 日志（P4.4）。视觉上沿用 P1-P3 的统一风格：彩色 Tag、渐变卡片、清晰的状态标识。

**Architecture:** 增量改造现有模块（cardImport/device/task），并新建 openapi-log 模块。所有改动不破坏现有路由 — 旧路径仍然可用，新菜单只是"挪位置"。下载业务号流程改造是核心：在 `device/detail/add.vue` 用 4 个 Tab 重新组织 — 默认 Tab 是"从租户资源池下载"，其他保留兼容。

**Tech Stack:** Vue 3 + TypeScript + Vben Admin 5 + Ant Design Vue (antdv-next) + Tailwind CSS + Alova + vxe-table

---

## 文件结构

### 新建文件

```
apps/web-antd/src/
├── api/system/openapi-log/
│   ├── index.ts
│   └── model.d.ts
├── views/openapi-log/
│   ├── index.vue
│   ├── data.tsx
│   └── log-detail-drawer.vue                        # 请求/响应详情侧拉
└── views/system/cardImport/
    └── single-add-modal.vue                         # 单卡添加（新增）
```

### 修改文件

```
apps/web-antd/src/api/system/cardImport/index.ts      # 新增 singleAddCard（如后端支持）
apps/web-antd/src/views/system/cardImport/index.vue   # 新字段、单卡添加按钮、分配重构
apps/web-antd/src/views/system/cardImport/data.ts     # 列字段优化
apps/web-antd/src/views/system/cardImport/allocation-modal.vue # 支持 ids 列表分配

apps/web-antd/src/views/system/device/index.vue       # 列字段优化（imsi/IMEI 等）
apps/web-antd/src/views/system/device/data.ts         # 列字段优化
apps/web-antd/src/views/system/device/detail/module/basic.vue # 启用码号→ APN 同步弹窗
apps/web-antd/src/views/system/device/detail/add.vue  # ★★ 下载流程重构（4 Tab）

apps/web-antd/src/router/routes/modules/eim.ts        # 追加 eUICC 一级菜单 + OpenAPI 日志

apps/web-antd/src/views/system/task/data.ts           # 新增"操作类型"列（占位）
apps/web-antd/src/views/system/task/index.vue         # 新增导出按钮
```

---

## Task 1：OpenAPI 日志 API 层

**Files:**
- Create: `apps/web-antd/src/api/system/openapi-log/model.d.ts`
- Create: `apps/web-antd/src/api/system/openapi-log/index.ts`

- [ ] **Step 1.1：model.d.ts**

```ts
import type { PageQuery } from '#/api/common';

/** OpenAPI 调用日志视图对象 */
export interface OpenApiLogVO {
  id: number;
  tenantId?: string;
  userId?: number;
  userName?: string;
  apiName?: string;
  requestMethod?: string;
  requestUri?: string;
  requestIp?: string;
  requestParams?: string;
  responseBody?: string;
  success?: boolean;
  errorMsg?: string;
  costTime?: number;
  traceId?: string;
  createTime: string;
}

export interface OpenApiLogQuery extends PageQuery {
  tenantId?: string;
  userName?: string;
  apiName?: string;
  requestMethod?: string;
  success?: boolean;
  startCreateTime?: string;
  endCreateTime?: string;
}
```

- [ ] **Step 1.2：index.ts**

```ts
import type { OpenApiLogQuery, OpenApiLogVO } from './model';
import type { PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  list = '/manager/openapi-log/list',
}

/** 分页查询 OpenAPI 调用日志 */
export function openApiLogList(params?: OpenApiLogQuery) {
  return alovaInstance.get<PageResult<OpenApiLogVO>>(Api.list, { params });
}
```

---

## Task 2：OpenAPI 日志页面

**Files:**
- Create: `apps/web-antd/src/views/openapi-log/data.tsx`
- Create: `apps/web-antd/src/views/openapi-log/log-detail-drawer.vue`
- Create: `apps/web-antd/src/views/openapi-log/index.vue`

- [ ] **Step 2.1：data.tsx**

```tsx
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

const METHOD_COLOR: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'purple',
};

export function getMethodColor(m?: string) {
  if (!m) return 'default';
  return METHOD_COLOR[m.toUpperCase()] ?? 'default';
}

export const METHOD_OPTIONS = Object.keys(METHOD_COLOR).map((m) => ({
  label: m,
  value: m,
}));

export const SUCCESS_OPTIONS = [
  { value: true, label: '成功' },
  { value: false, label: '失败' },
];

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'tenantId', label: '租户ID' },
  { component: 'Input', fieldName: 'userName', label: '调用用户' },
  { component: 'Input', fieldName: 'apiName', label: '接口名称' },
  {
    component: 'Select',
    fieldName: 'requestMethod',
    label: 'HTTP方法',
    componentProps: {
      allowClear: true,
      options: METHOD_OPTIONS,
      placeholder: '请选择',
    },
  },
  {
    component: 'Select',
    fieldName: 'success',
    label: '是否成功',
    componentProps: {
      allowClear: true,
      options: SUCCESS_OPTIONS,
      placeholder: '请选择',
    },
  },
  { component: 'RangePicker', fieldName: 'createTime', label: '调用时间' },
];

export const columns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 60 },
  { title: '租户', field: 'tenantId', width: 140 },
  { title: '调用用户', field: 'userName', width: 110 },
  { title: '接口名称', field: 'apiName', minWidth: 200, showOverflow: true },
  {
    title: '方法',
    field: 'requestMethod',
    width: 80,
    slots: { default: 'method' },
  },
  { title: 'URI', field: 'requestUri', minWidth: 200, showOverflow: true },
  { title: '请求IP', field: 'requestIp', width: 130 },
  {
    title: '结果',
    field: 'success',
    width: 80,
    slots: { default: 'success' },
  },
  { title: '耗时(ms)', field: 'costTime', width: 100 },
  { title: '调用时间', field: 'createTime', width: 170 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 100,
  },
];
```

- [ ] **Step 2.2：log-detail-drawer.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, DescriptionsItem, Tag } from 'antdv-next';

import type { OpenApiLogVO } from '#/api/system/openapi-log/model';

import { getMethodColor } from './data';

const log = ref<OpenApiLogVO | null>(null);

const [BasicDrawer, drawerApi] = useVbenDrawer({
  title: '日志详情',
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    log.value = drawerApi.getData() as OpenApiLogVO;
  },
  onClosed: () => {
    log.value = null;
  },
});
</script>

<template>
  <BasicDrawer class="w-[680px]">
    <div v-if="log" class="space-y-4">
      <!-- 基本信息 -->
      <Descriptions :column="2" bordered size="small">
        <DescriptionsItem label="租户">{{ log.tenantId || '--' }}</DescriptionsItem>
        <DescriptionsItem label="用户">{{ log.userName || '--' }}</DescriptionsItem>
        <DescriptionsItem label="接口" :span="2">
          {{ log.apiName || '--' }}
        </DescriptionsItem>
        <DescriptionsItem label="方法">
          <Tag :color="getMethodColor(log.requestMethod)">
            {{ log.requestMethod }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem label="结果">
          <Tag :color="log.success ? 'green' : 'red'">
            {{ log.success ? '成功' : '失败' }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem label="URI" :span="2">
          <code class="text-xs">{{ log.requestUri || '--' }}</code>
        </DescriptionsItem>
        <DescriptionsItem label="请求IP">{{ log.requestIp || '--' }}</DescriptionsItem>
        <DescriptionsItem label="耗时">
          <Tag color="cyan">{{ log.costTime ?? 0 }} ms</Tag>
        </DescriptionsItem>
        <DescriptionsItem label="TraceID" :span="2">
          <code class="text-xs">{{ log.traceId || '--' }}</code>
        </DescriptionsItem>
        <DescriptionsItem label="调用时间" :span="2">
          {{ log.createTime }}
        </DescriptionsItem>
      </Descriptions>

      <!-- 请求参数 -->
      <div>
        <div class="mb-2 text-sm font-semibold">请求参数</div>
        <pre
          class="max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs dark:bg-gray-800"
        >{{ log.requestParams || '(无)' }}</pre>
      </div>

      <!-- 响应摘要 -->
      <div>
        <div class="mb-2 text-sm font-semibold">响应摘要</div>
        <pre
          class="max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs dark:bg-gray-800"
        >{{ log.responseBody || '(无)' }}</pre>
      </div>

      <!-- 错误信息 -->
      <div v-if="log.errorMsg">
        <div class="mb-2 text-sm font-semibold text-rose-600">异常信息</div>
        <pre
          class="max-h-40 overflow-auto rounded bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
        >{{ log.errorMsg }}</pre>
      </div>
    </div>
  </BasicDrawer>
</template>
```

- [ ] **Step 2.3：index.vue**

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { openApiLogList } from '#/api/system/openapi-log';
import type { OpenApiLogVO } from '#/api/system/openapi-log/model';

import { columns, getMethodColor, querySchema } from './data';
import LogDetailDrawer from './log-detail-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 88, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [
    [
      'createTime',
      ['startCreateTime', 'endCreateTime'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await openApiLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'openapi-log-index',
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });

const [DetailDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: LogDetailDrawer,
});

function handleView(row: OpenApiLogVO) {
  drawerApi.setData(row);
  drawerApi.open();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="OpenAPI 调用日志">
      <template #method="{ row }">
        <Tag :color="getMethodColor(row.requestMethod)">
          {{ row.requestMethod }}
        </Tag>
      </template>
      <template #success="{ row }">
        <Tag :color="row.success ? 'green' : 'red'">
          {{ row.success ? '成功' : '失败' }}
        </Tag>
      </template>
      <template #action="{ row }">
        <a-button type="link" size="small" @click="handleView(row)">
          详情
        </a-button>
      </template>
    </BasicTable>
    <DetailDrawer />
  </Page>
</template>
```

---

## Task 3：库存管理列字段优化 + 单卡添加

**Files:**
- Modify: `apps/web-antd/src/views/system/cardImport/data.ts`
- Create: `apps/web-antd/src/views/system/cardImport/single-add-modal.vue`
- Modify: `apps/web-antd/src/views/system/cardImport/index.vue`

- [ ] **Step 3.1：data.ts — 优化列字段（加入入库人/入库时间美化）**

完全替换 `apps/web-antd/src/views/system/cardImport/data.ts`：

```ts
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Tag } from 'antdv-next';
import { h } from 'vue';

import { getCardProviderDict } from './hooks/useGetDict';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'eid', label: 'EID' },
  { component: 'Input', fieldName: 'iccid', label: '预制种子号' },
  { component: 'Input', fieldName: 'eimFqdn', label: '预制EIM' },
  {
    component: 'ApiSelect',
    componentProps: {
      api: getCardProviderDict,
      labelField: 'label',
      valueField: 'value',
      placeholder: '请选择制卡商',
    },
    fieldName: 'cardProviderName',
    label: '制卡商',
  },
  { component: 'Input', fieldName: 'tenantName', label: '分配租户' },
  { component: 'Input', fieldName: 'operator', label: '入库人' },
  {
    component: 'RangePicker',
    fieldName: 'creationTime',
    label: '入库时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: '导入批次', field: 'productionBatch', width: 130 },
  { title: 'EID', field: 'eid', minWidth: 180 },
  { title: '预制种子号', field: 'iccid', minWidth: 180 },
  { title: '制卡商', field: 'cardProviderName', width: 110 },
  { title: '入库人', field: 'operator', width: 110 },
  { title: '入库时间', field: 'creationTime', width: 170 },
  {
    title: '分配租户',
    field: 'companyName',
    width: 160,
    formatter: ({ cellValue }) => cellValue || '--',
    slots: { default: 'companyName' },
  },
  {
    title: '分配人',
    field: 'allocator',
    width: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '分配时间',
    field: 'allocateTime',
    width: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 120,
  },
];
```

- [ ] **Step 3.2：single-add-modal.vue（单卡添加）**

```vue
<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { alovaInstance } from '#/utils/http';

const emit = defineEmits<{ reload: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 110 },
  schema: [
    {
      component: 'Input',
      fieldName: 'eid',
      label: 'EID',
      rules: 'required',
      componentProps: { placeholder: '请输入 EID' },
    },
    {
      component: 'Input',
      fieldName: 'iccid',
      label: '预制种子号',
      rules: 'required',
      componentProps: { placeholder: '请输入 ICCID' },
    },
    {
      component: 'Input',
      fieldName: 'eimFqdn',
      label: '预制 EIM',
      componentProps: { placeholder: '请输入 EIM FQDN' },
    },
    {
      component: 'Input',
      fieldName: 'cardProviderName',
      label: '制卡商',
      componentProps: { placeholder: '请输入制卡商名称' },
    },
    {
      component: 'Input',
      fieldName: 'productionBatch',
      label: '生产批次',
      rules: 'required',
      componentProps: { placeholder: '请输入批次号' },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => formApi.resetForm(),
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    // 单卡添加复用 importWithOptions（仅一条）。如后端有专门接口可替换。
    // 这里直接 POST 到 /manager/seed 的添加接口（如后端无此接口，提示用户用批量导入）
    await alovaInstance.postWithMsg<void>('/manager/seed', values);
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
  <BasicModal title="单卡添加" class="w-[520px]">
    <div
      class="mb-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    >
      手动录入单张卡的入库信息。如需批量录入，请使用"批量导入"。
    </div>
    <BasicForm />
  </BasicModal>
</template>
```

注：单卡添加接口后端如无 `POST /manager/seed`，需协调；当前 plan 假设其存在。如调用失败 alovaInstance 会自动弹错误提示。

- [ ] **Step 3.3：index.vue — 加单卡添加按钮 + 行级"分配"操作**

完全替换 `apps/web-antd/src/views/system/cardImport/index.vue`：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { cardImportList } from '#/api/system/cardImport';

import AllocationModal from './allocation-modal.vue';
import BatchImportModal from './batch-import-modal.vue';
import SingleAddModal from './single-add-modal.vue';
import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 88, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [
    [
      'creationTime',
      ['startCreationTime', 'endCreationTime'],
      ['YYYY-MM-DDT00:00:00.000', 'YYYY-MM-DDT23:59:59.999'],
    ],
  ],
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
        return await cardImportList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'eid' },
  id: 'system-cardImport-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [AllocationModalComp, allocationApi] = useVbenModal({
  connectedComponent: AllocationModal,
});
const [BatchImportModalComp, importApi] = useVbenModal({
  connectedComponent: BatchImportModal,
});
const [SingleAddModalComp, singleAddApi] = useVbenModal({
  connectedComponent: SingleAddModal,
});

function handleAllocation(row?: any) {
  allocationApi.setData({ productionBatch: row?.productionBatch });
  allocationApi.open();
}

function handleBatchAllocation() {
  const rows = tableApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    window.message.warning('请先勾选要分配的卡');
    return;
  }
  // 同批次校验
  const firstBatch = rows[0].productionBatch;
  const allSameBatch = rows.every((r: any) => r.productionBatch === firstBatch);
  if (!allSameBatch) {
    window.message.warning('批量分配的卡必须属于同一生产批次');
    return;
  }
  allocationApi.setData({ productionBatch: firstBatch });
  allocationApi.open();
}

function handleBatchImport() {
  importApi.open();
}

function handleSingleAdd() {
  singleAddApi.open();
}

function handleDownloadTemplate() {
  window.open(
    `${import.meta.env.VITE_GLOB_API_URL}/manager/seed/importTemplate`,
  );
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="库存管理">
      <template #toolbar-tools>
        <Space>
          <a-button @click="handleDownloadTemplate">下载导入模板</a-button>
          <a-button type="primary" @click="handleBatchImport">批量导入</a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            @click="handleBatchAllocation"
          >
            批量分配
          </a-button>
          <a-button type="primary" @click="handleAllocation()">
            按批次分配
          </a-button>
          <a-button type="primary" @click="handleSingleAdd">单卡添加</a-button>
        </Space>
      </template>

      <template #companyName="{ row }">
        <Tag v-if="row.companyName" color="blue">{{ row.companyName }}</Tag>
        <span v-else class="text-gray-400">未分配</span>
      </template>

      <template #action="{ row }">
        <Space>
          <action-button
            v-if="!row.companyName"
            variant="link"
            color="blue"
            @click.stop="handleAllocation(row)"
          >
            分配
          </action-button>
        </Space>
      </template>
    </BasicTable>
    <AllocationModalComp @reload="tableApi.query()" />
    <BatchImportModalComp @reload="tableApi.query()" />
    <SingleAddModalComp @reload="tableApi.query()" />
  </Page>
</template>
```

---

## Task 4：eUICC 设备列表字段优化

**Files:**
- Modify: `apps/web-antd/src/views/system/device/data.ts`

- [ ] **Step 4.1：data.ts**

完全替换 `apps/web-antd/src/views/system/device/data.ts`：

```ts
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'eid', label: 'EID' },
  { component: 'Input', fieldName: 'iccid', label: '预制种子号' },
  { component: 'Input', fieldName: 'imei', label: 'IMEI' },
  { component: 'Input', fieldName: 'eimFqdn', label: 'EIMId' },
  {
    component: 'Select',
    componentProps: { options: getDictOptions('sys_device_status') },
    fieldName: 'online',
    label: '在线状态',
  },
  { component: 'Input', fieldName: 'name', label: '设备名称' },
  { component: 'Input', fieldName: 'projectName', label: '所属项目' },
  { component: 'Input', fieldName: 'tenantName', label: '所属租户' },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'EID', field: 'eid', minWidth: 180 },
  { title: '预制种子号', field: 'iccid', width: 180 },
  {
    title: '当前码号',
    field: 'currentIccid',
    width: 180,
    formatter: ({ row }) => row.currentIccid || row.iccid || '--',
  },
  { title: 'IMEI', field: 'imei', width: 150 },
  {
    title: '在线状态',
    field: 'online',
    width: 100,
    slots: {
      default: ({ row }) => renderDict(row.online, 'sys_device_status'),
    },
  },
  { title: '设备名称', field: 'name', width: 140 },
  { title: '所属租户', field: 'companyName', width: 160 },
  { title: '所属项目', field: 'projectName', width: 140 },
  { title: '创建时间', field: 'creationTime', width: 170 },
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

---

## Task 5：启用码号 → APN 同步确认弹窗集成

**Files:**
- Modify: `apps/web-antd/src/views/system/device/detail/module/basic.vue`

将原"点击 Switch 直接启用"流程改为：启用成功后弹 P2 的 `apn-sync-confirm-modal.vue` 让用户确认 APN。

- [ ] **Step 5.1：完整替换 basic.vue**

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Card, Popconfirm, Space, Switch, Table } from 'antdv-next';
import { useRoute, useRouter } from 'vue-router';

import {
  deviceDetail,
  toDelete,
  toDisable,
  toEnable,
  updateDetail,
  updateProfileApn,
} from '#/api/system/device';
import { useDeviceStore } from '#/store/device';
import { renderDict } from '#/utils/render';
import ApnSyncConfirmModal from '#/views/system/apn/components/apn-sync-confirm-modal.vue';

import ApnModal from './apn-modal.vue';

const route = useRoute();
const router = useRouter();
const deviceStore = useDeviceStore();
const loading = ref(true);
const detailData = ref<any>({});
const tableData = ref<any[]>([]);

function getEid(): string {
  return deviceStore.currentEid || (route.query.id as string) || '';
}

const [ApnModalComp, apnApi] = useVbenModal({ connectedComponent: ApnModal });

const [ApnSyncModalComp, apnSyncApi] = useVbenModal({
  connectedComponent: ApnSyncConfirmModal,
});

async function getList() {
  const eid = getEid();
  if (!eid) return;
  loading.value = true;
  try {
    const res = await deviceDetail(eid);
    detailData.value = res || {};
    tableData.value = (res?.profileList || []).map((item: any) => ({
      ...item,
      state: String(item.state),
    }));
  } finally {
    loading.value = false;
  }
}

async function handleSync() {
  const eid = getEid();
  await updateDetail(eid);
  await getList();
}

/**
 * 启用码号：先调启用接口，成功后弹 APN 同步确认弹窗
 * 用户选择 APN 与是否同步下发后，再调 updateProfileApn
 */
async function handleEnable(row: any) {
  const eid = getEid();
  await toEnable(eid, row.iccid);
  await getList();

  // 弹 APN 同步确认 — 需要 carrierCode（从 profile 获取）
  if (row.carrierCode || row.providerName) {
    apnSyncApi.setData({
      carrierCode: row.carrierCode || row.issuer || '',
      carrierName: row.providerName || row.issuer || '',
      defaultApnId: row.apnId,
      defaultApnName: row.apnName || row.apn,
      bizHint: `ICCID ${row.iccid} 已启用，请确认 APN 配置`,
    });
    apnSyncApi.open();
  }
  return true;
}

async function handleDisable(row: any) {
  await toDisable(getEid(), row.iccid);
  await getList();
  return true;
}

async function handleDelete(row: any) {
  await toDelete(getEid(), row.iccid);
  await getList();
}

function handleAdd() {
  const eid = getEid();
  router.push({ path: '/system/device/add', query: { id: eid } });
}

function handleEditApn(row: any) {
  apnApi.setData({ row });
  apnApi.open();
}

/**
 * 用户在 APN 同步确认弹窗中确认后回调
 * payload = { apnId, sync }
 */
async function handleApnSyncConfirm(payload: { apnId: string; sync: boolean }) {
  if (!payload.sync) {
    // 不同步：仅更新 profile 的 APN 关联，不下发到设备
    // 后端 updateProfileApn 同时承担"修改 + 下发"职责，sync=false 时可通过备用参数控制
    // 此处保留：直接调用 updateProfileApn，由后端判断是否下发
  }
  // 找到刚启用的那条 profile（取 state === '1' 的）
  const enabledRow = tableData.value.find((p) => p.state === '1');
  if (enabledRow) {
    await updateProfileApn(getEid(), enabledRow.iccid, payload.apnId);
    await getList();
  }
}

const tableColumns = [
  { title: '运营商', dataIndex: 'issuer' },
  { title: 'ICCID', dataIndex: 'iccid' },
  {
    title: '状态',
    key: 'state',
    customRender: ({ record }: any) =>
      renderDict(record.state ?? '', 'sys_profile_status'),
  },
  { title: 'APNID', dataIndex: 'apnId' },
  { title: 'APN名称', dataIndex: 'apnName' },
  { title: 'APN', dataIndex: 'apn' },
  { title: '操作', key: 'action', fixed: 'right' },
];

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
        <div class="mb-2">
          预制种子号: {{ detailData.iccid || '--' }}
        </div>
        <div class="mb-2">
          创建时间: {{ detailData.creationTime || '--' }}
        </div>
      </div>
      <div class="flex-1">
        <div class="mb-2">EIM: {{ detailData.eimFqdn || '--' }}</div>
        <div class="mb-2">
          在线状态:
          <component
            :is="() => renderDict(detailData.online ?? '', 'sys_device_status')"
          />
        </div>
        <div class="mb-2">
          激活时间: {{ detailData.activationTime || '--' }}
        </div>
      </div>
    </div>
    <Card title="业务号信息" class="mt-4">
      <template #extra>
        <Space>
          <a-button type="primary" @click="handleAdd">下载业务号</a-button>
          <a-button type="primary" @click="handleSync">同步数据</a-button>
        </Space>
      </template>
      <Table
        :data-source="tableData"
        :loading="loading"
        row-key="iccid"
        :pagination="{ pageSize: 10 }"
        :columns="tableColumns"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Space>
              <Switch
                :checked="record.state === '1'"
                checked-children="启用"
                un-checked-children="停用"
                @change="
                  record.state === '1'
                    ? handleDisable(record)
                    : handleEnable(record)
                "
              />
              <a-button type="link" size="small" @click="handleEditApn(record)">
                APN更新
              </a-button>
              <Popconfirm
                title="确认删除？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>
    <ApnModalComp @reload="getList()" />
    <ApnSyncModalComp @confirm="handleApnSyncConfirm" />
  </div>
</template>
```

---

## Task 6：下载业务号流程改造（4 Tab 单设备下载页）

**Files:**
- Modify: `apps/web-antd/src/views/system/device/detail/add.vue`

> 注：现有的 `add.vue` 可能已存在，重构为 4 Tab 设计。如果原文件不存在，按本 plan 创建。

- [ ] **Step 6.1：完整替换/创建 add.vue**

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Card,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Tabs,
  TabPane,
  Tag,
} from 'antdv-next';
import { useRoute, useRouter } from 'vue-router';

import { apnByCarrier } from '#/api/system/apn';
import {
  batchAllocationAndDownload,
  dpDownload,
  eimProfile,
  idDownload,
  toDownload,
} from '#/api/system/device';

const route = useRoute();
const router = useRouter();

const eid = ref<string>('');
const activeTab = ref<string>('pool');

// =========== Tab 1: 租户资源池 ===========
const carrierList = ref<any[]>([]);
const carrierLoading = ref(false);
const selectedCarrierId = ref<number | undefined>(undefined);
const previewProfile = ref<any>(null);
const previewLoading = ref(false);

async function loadCarriers() {
  carrierLoading.value = true;
  try {
    const list = await eimProfile();
    carrierList.value = list || [];
  } finally {
    carrierLoading.value = false;
  }
}

async function previewFromPool() {
  if (!selectedCarrierId.value) {
    window.message.warning('请选择运营商');
    return;
  }
  previewLoading.value = true;
  try {
    const data = await idDownload(eid.value, selectedCarrierId.value);
    previewProfile.value = data;
  } catch (error) {
    console.error(error);
    previewProfile.value = null;
  } finally {
    previewLoading.value = false;
  }
}

async function confirmDownloadFromPool() {
  if (!previewProfile.value) {
    window.message.warning('请先点击"预览"获取码号');
    return;
  }
  // idDownload 已触发下载（后端语义）。如果是"预览 + 确认"分两步，需后端配合。
  // 当前实现：预览即下载。
  window.message.success('下载任务已创建，请前往任务列表查看进度');
  router.push({ path: '/system/task' });
}

// =========== Tab 2: DP+ 直连 ===========
const dpLoading = ref(false);
async function handleDpDownload() {
  dpLoading.value = true;
  try {
    await dpDownload(eid.value);
    window.message.success('已触发 DP+ 下载');
    router.push({ path: '/system/task' });
  } finally {
    dpLoading.value = false;
  }
}

// =========== Tab 3: 识别码 ===========
const activationCode = ref<string>('');
const codeLoading = ref(false);
async function handleCodeDownload() {
  if (!activationCode.value) {
    window.message.warning('请输入激活码');
    return;
  }
  codeLoading.value = true;
  try {
    await toDownload(eid.value, { trigger: activationCode.value });
    window.message.success('已触发下载');
    router.push({ path: '/system/task' });
  } finally {
    codeLoading.value = false;
  }
}

// =========== Tab 4: 指定批次 ===========
const batchForm = ref({
  projectId: '',
  productionBatch: '',
  count: 1,
});
const batchLoading = ref(false);
async function handleBatchDownload() {
  if (!batchForm.value.productionBatch) {
    window.message.warning('请输入批次');
    return;
  }
  batchLoading.value = true;
  try {
    await batchAllocationAndDownload({
      use: true,
      deviceList: [
        {
          eid: eid.value,
          productionBatch: batchForm.value.productionBatch,
          projectId: batchForm.value.projectId,
          count: String(batchForm.value.count),
        },
      ],
    });
    window.message.success('已触发下载');
    router.push({ path: '/system/task' });
  } finally {
    batchLoading.value = false;
  }
}

function backTo() {
  router.go(-1);
}

onMounted(() => {
  eid.value = (route.query.id as string) || '';
  loadCarriers();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-2">
      <a-button type="link" @click="backTo">← 返回</a-button>
    </div>

    <Card>
      <div class="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <span>当前设备 EID:</span>
        <Tag color="blue">{{ eid || '--' }}</Tag>
      </div>

      <Tabs v-model:activeKey="activeTab" type="card">
        <!-- Tab 1: 租户资源池下载 -->
        <TabPane key="pool" tab="🎯 从租户资源池下载">
          <div class="space-y-4 p-2">
            <div
              class="rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
            >
              选择运营商后，系统将从租户码号资源池中随机选取一个可用码号供下载。
            </div>

            <div class="flex items-center gap-3">
              <span>运营商：</span>
              <Select
                v-model:value="selectedCarrierId"
                :loading="carrierLoading"
                placeholder="请选择运营商"
                style="width: 280px"
                :options="
                  carrierList.map((c) => ({
                    label: c.issuer,
                    value: c.id,
                  }))
                "
              />
              <a-button
                type="primary"
                :loading="previewLoading"
                @click="previewFromPool"
              >
                预览码号
              </a-button>
            </div>

            <Spin :spinning="previewLoading">
              <Card v-if="previewProfile" size="small" class="bg-emerald-50/40">
                <div class="space-y-2">
                  <div class="text-sm font-semibold">已获取以下码号：</div>
                  <div class="flex flex-wrap gap-3 text-sm">
                    <div>
                      <span class="text-gray-500">ICCID：</span>
                      <code>{{ previewProfile.iccid || '--' }}</code>
                    </div>
                    <div>
                      <span class="text-gray-500">运营商：</span>
                      <Tag color="blue">
                        {{ previewProfile.issue || previewProfile.issuer || '--' }}
                      </Tag>
                    </div>
                    <div v-if="previewProfile.country">
                      <span class="text-gray-500">所属地：</span>
                      {{ previewProfile.country }}
                    </div>
                  </div>
                  <a-button type="primary" @click="confirmDownloadFromPool">
                    确认下载
                  </a-button>
                </div>
              </Card>
              <Empty
                v-else-if="!previewLoading"
                description="尚未预览码号"
                class="my-8"
              />
            </Spin>
          </div>
        </TabPane>

        <!-- Tab 2: DP+ -->
        <TabPane key="dp" tab="🔗 DP+ 直连下载">
          <div class="space-y-4 p-2">
            <div
              class="rounded bg-purple-50 px-3 py-2 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
            >
              从 SM-DP+ 直接获取 MatchingId 并触发下载。
            </div>
            <a-button
              type="primary"
              :loading="dpLoading"
              @click="handleDpDownload"
            >
              触发 DP+ 下载
            </a-button>
          </div>
        </TabPane>

        <!-- Tab 3: 激活码 -->
        <TabPane key="code" tab="🔑 激活码下载">
          <div class="space-y-4 p-2">
            <div
              class="rounded bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            >
              手动输入 SM-DP+ 激活码触发下载。
            </div>
            <Input
              v-model:value="activationCode"
              placeholder="请输入激活码（trigger string）"
              style="width: 480px"
            />
            <div>
              <a-button
                type="primary"
                :loading="codeLoading"
                @click="handleCodeDownload"
              >
                识别并下载
              </a-button>
            </div>
          </div>
        </TabPane>

        <!-- Tab 4: 指定批次 -->
        <TabPane key="batch" tab="📦 从指定批次下载">
          <div class="space-y-4 p-2">
            <div
              class="rounded bg-teal-50 px-3 py-2 text-xs text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
            >
              指定项目和批次，从该批次的资源池中分配并下载到当前设备。
            </div>
            <Space direction="vertical" style="width: 100%" :size="12">
              <div class="flex items-center gap-3">
                <span class="w-24 text-right">项目ID：</span>
                <Input
                  v-model:value="batchForm.projectId"
                  placeholder="请输入项目ID"
                  style="width: 320px"
                />
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-right">生产批次：</span>
                <Input
                  v-model:value="batchForm.productionBatch"
                  placeholder="请输入批次号"
                  style="width: 320px"
                />
              </div>
              <div class="flex items-center gap-3">
                <span class="w-24 text-right">数量：</span>
                <Input
                  v-model:value="batchForm.count"
                  type="number"
                  placeholder="分配数量"
                  style="width: 120px"
                />
              </div>
              <div>
                <a-button
                  type="primary"
                  :loading="batchLoading"
                  @click="handleBatchDownload"
                >
                  分配并下载
                </a-button>
              </div>
            </Space>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>
```

---

## Task 7：任务列表 — 导出 + 操作类型列

**Files:**
- Modify: `apps/web-antd/src/views/system/task/data.ts`
- Modify: `apps/web-antd/src/views/system/task/index.vue`

- [ ] **Step 7.1：data.ts 加"操作类型"列**

完全替换：

```ts
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

const SOURCE_MAP: Record<string, { color: string; text: string }> = {
  MANUAL:  { color: 'blue',   text: '手动' },
  BATCH:   { color: 'purple', text: '批量' },
  OPENAPI: { color: 'cyan',   text: 'OpenAPI' },
};

export function getTaskSourceMeta(s?: string) {
  if (!s) return { color: 'default', text: '--' };
  return SOURCE_MAP[s] ?? { color: 'default', text: s };
}

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Select',
    componentProps: { options: getDictOptions('sys_task_status') },
    fieldName: 'state',
    label: '任务状态',
  },
  { component: 'Input', fieldName: 'operatorUser', label: '操作人' },
  { component: 'RangePicker', fieldName: 'creationTime', label: '操作时间' },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'ICCID', field: 'iccid', minWidth: 180 },
  { title: 'EID', field: 'eid', minWidth: 240 },
  {
    title: '操作类型',
    field: 'source',
    width: 100,
    slots: { default: 'source' },
  },
  { title: '进度', field: 'downloadRate', width: 80 },
  { title: '创建时间', field: 'creationTime', width: 170 },
  {
    title: '状态',
    field: 'state',
    width: 100,
    slots: {
      default: ({ row }) => renderDict(row.state, 'sys_task_status'),
    },
  },
  { title: '操作时间', field: 'operatorTime', width: 170 },
  { title: '操作人', field: 'operatorUser', width: 110 },
];
```

- [ ] **Step 7.2：index.vue 加导出按钮 + 操作类型 slot**

完全替换：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { cancelTask, taskList } from '#/api/system/task';
import { commonExport } from '#/api/helper';
import { useBlobExport } from '#/utils/file/export';

import { columns, getTaskSourceMeta, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80, componentProps: { allowClear: true } },
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
    checkMethod: ({ row }) => row.state === 0 || row.state === '0',
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
  rowConfig: { keyField: 'id' },
  id: 'system-task-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

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

// 导出
function taskExport(data: Record<string, any>) {
  return commonExport('/manager/device/task/export', data);
}
const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(taskExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('任务列表');
  exportBlob({ data: formValues, fileName });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="任务列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :loading="exportLoading"
            :disabled="exportLoading"
            @click="handleExport"
          >
            导出
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            type="primary"
            danger
            @click="handleCancelTask"
          >
            取消任务
          </a-button>
        </Space>
      </template>
      <template #source="{ row }">
        <Tag :color="getTaskSourceMeta(row.source).color">
          {{ getTaskSourceMeta(row.source).text }}
        </Tag>
      </template>
    </BasicTable>
  </Page>
</template>
```

---

## Task 8：菜单路由 — 追加 eUICC 管理一级菜单 + OpenAPI 日志

**Files:**
- Modify: `apps/web-antd/src/router/routes/modules/eim.ts`

在现有 `ProfilePoolGroup` 之后追加 2 个路由组：

- [ ] **Step 8.1：追加 EuiccGroup 和 OpenApiLogGroup**

读取 `apps/web-antd/src/router/routes/modules/eim.ts`，在 `ProfilePoolGroup` 对象后面追加：

```ts
  // ============ eUICC 管理（P4 新增一级菜单） ============
  {
    name: 'EuiccGroup',
    path: '/euicc',
    component: BasicLayout,
    redirect: '/system/cardImport',
    meta: {
      title: 'eUICC管理',
      icon: 'lucide:cpu',
      order: 20,
    },
    children: [
      {
        name: 'EuiccInventory',
        path: '/euicc/inventory',
        component: () => import('#/views/system/cardImport/index.vue'),
        meta: {
          title: '库存管理',
          icon: 'lucide:archive',
          keepAlive: true,
        },
      },
      {
        name: 'EuiccDevice',
        path: '/euicc/device',
        component: () => import('#/views/system/device/index.vue'),
        meta: {
          title: 'eUICC管理',
          icon: 'lucide:smartphone',
          keepAlive: true,
        },
      },
      {
        name: 'EuiccTask',
        path: '/euicc/task',
        component: () => import('#/views/system/task/index.vue'),
        meta: {
          title: '任务列表',
          icon: 'lucide:list-checks',
          keepAlive: true,
        },
      },
    ],
  },
  // ============ OpenAPI 日志（独立菜单） ============
  {
    name: 'OpenApiLogGroup',
    path: '/openapi-log',
    component: BasicLayout,
    redirect: '/openapi-log/index',
    meta: {
      title: 'OpenAPI日志',
      icon: 'lucide:activity',
      order: 23,
    },
    children: [
      {
        name: 'OpenApiLogIndex',
        path: '/openapi-log/index',
        component: () => import('#/views/openapi-log/index.vue'),
        meta: {
          title: 'OpenAPI日志',
          icon: 'lucide:activity',
          keepAlive: true,
          hideInMenu: true,
        },
      },
    ],
  },
```

注意：保持数组语法（前一项后加逗号）。

---

## Task 9：端到端冒烟验证

- [ ] **Step 9.1：拉起开发服务**

```bash
cd d:/Project/esim.eim.web && pnpm dev:antd
```

- [ ] **Step 9.2：访问页面**

| URL | 期望 |
|---|---|
| `/euicc/inventory` | 库存管理新字段（导入批次/入库人/分配租户等），4 个工具栏按钮：下载模板/批量导入/批量分配/按批次分配/单卡添加 |
| `/euicc/device` | eUICC 列表新字段（当前码号/IMEI/创建时间） |
| `/euicc/task` | 任务列表有彩色"操作类型" Tag + 导出按钮 |
| `/openapi-log/index` | OpenAPI 日志页，方法/结果彩色 Tag，点"详情"出抽屉显示请求/响应/异常 |
| 设备详情 → 启用某条 profile | 启用成功后自动弹 APN 同步确认弹窗 |
| 设备详情 → 下载业务号 | 跳转到 4 Tab 页面，默认"从租户资源池下载" |

- [ ] **Step 9.3：交互验证**

- [ ] 库存：单卡添加 → 填表 → 保存 → 列表刷新
- [ ] 库存：勾选不同批次行 → 批量分配 → 提示"必须同批次"
- [ ] eUICC：启用码号 → 弹 APN 同步确认 → 选 APN + 勾选同步 → 确认 → 不报错
- [ ] 下载业务号：Tab 1 选运营商 → 预览 → 出现 ICCID/运营商信息 → 确认下载 → 跳转任务列表
- [ ] 下载业务号：Tab 2/3/4 可正常调用对应接口（看 task 列表新增任务即可）
- [ ] OpenAPI 日志：点"详情" → 抽屉打开 → 看到 Descriptions + 请求参数代码块

---

## 完成标准

- [ ] OpenAPI 日志页可用，详情抽屉显示完整
- [ ] 库存管理：列字段升级 + 单卡添加 + 三种分配模式（单/批量/按批次）
- [ ] eUICC 列表字段优化（当前码号/IMEI 等）
- [ ] 启用码号 → 自动弹 P2 提供的 APN 同步确认 Modal → 同步下发
- [ ] 下载业务号页改造为 4 Tab，默认"从租户资源池"
- [ ] 任务列表加导出 + 操作类型彩色 Tag
- [ ] eUICC 管理一级菜单 + OpenAPI 日志菜单生效

---

## 后续

P4 完成后整个 eIM 调整需求全部落地。可以一并：
1. 协调后端补齐字段：`POST /manager/seed`（单卡添加）、`task source` 字段、`ProfileVO.poolStatus`/`carrierCode`/`apnName`
2. 后端入库 system_menu，前端 mock 路由可退役
3. 提供字典 SQL：`eim_task_source` 等
