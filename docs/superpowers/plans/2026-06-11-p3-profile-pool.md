# P3 — 码号资源池管理 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建"码号资源管理"一级菜单，包含 4 个子页面（资源总池、租户资源池、资源调配、调配日志），实现平台总池→租户池的两级码号资源模型。视觉上用彩色 Tag 表达池状态，统计卡片用 4 色梯度，调配页采用左右双栏对照设计。同时清理现有 Profile 来源管理页与新池模块重叠的"资源分配"入口。

**Architecture:** 新建独立 `api/system/profile-pool/` API 模块和 `views/profile-pool/` 视图模块。共享池状态映射/统计卡片组件下沉到 `utils/poolStatus.ts`。菜单走前端静态路由（与 P1 license 一样开发期 mock，后端入库后退役）。后端接口已完整就绪（`/manager/profile/pool/*` 共 6 个接口）。

**Tech Stack:** Vue 3 + TypeScript + Vben Admin 5 + Ant Design Vue (antdv-next) + Tailwind CSS + Alova + vxe-table

---

## 文件结构

### 新建文件

```
apps/web-antd/src/
├── api/system/profile-pool/
│   ├── index.ts                              # 6 API 函数
│   └── model.d.ts                            # 类型定义
├── utils/poolStatus.ts                       # 池状态映射常量 + 帮助函数
└── views/profile-pool/
    ├── total/                                # 资源总池
    │   ├── index.vue
    │   ├── data.tsx
    │   ├── allocate-modal.vue                # 分配到租户
    │   └── stats-card.vue                    # 共享：4 色统计卡片
    ├── tenant/                               # 租户资源池
    │   ├── index.vue
    │   └── data.tsx
    ├── transfer/                             # 资源调配
    │   ├── index.vue                         # 左右双栏布局
    │   └── transfer-modal.vue                # 调配确认
    └── log/                                  # 调配日志
        ├── index.vue
        └── data.tsx
```

### 修改文件

```
apps/web-antd/src/router/routes/modules/eim.ts   # 追加 4 个子路由
apps/web-antd/src/views/system/profile/index.vue # 移除"资源分配"按钮
apps/web-antd/src/api/system/profile/model.d.ts  # 扩展 ProfileQuery 加 poolStatus
```

### 字典依赖

无强依赖。池状态映射全部用前端常量；运营商、批次走现有接口。

---

## Task 1：创建 API 层

**Files:**
- Create: `apps/web-antd/src/api/system/profile-pool/model.d.ts`
- Create: `apps/web-antd/src/api/system/profile-pool/index.ts`

- [ ] **Step 1.1：创建类型定义**

创建 `apps/web-antd/src/api/system/profile-pool/model.d.ts`：

```ts
import type { PageQuery } from '#/api/common';

/** 池状态枚举（前后端约定） */
export type ProfilePoolStatus =
  | 'UNASSIGNED'    // 未分配（平台总池中尚未分配给任何租户）
  | 'ASSIGNED'      // 已分配（已划归租户但租户尚未下载）
  | 'DOWNLOADED'    // 已下载（已被设备下载使用）
  | 'RECYCLEABLE';  // 可回收（已删除/可再次入池）

/** 资源池统计视图对象 */
export interface ProfilePoolStatsVO {
  unassignedCount: number;
  assignedCount: number;
  downloadedCount: number;
  recycleableCount: number;
}

/** 平台总池 → 租户池 分配请求体 */
export interface ProfileAllocateBO {
  productionBatch: string;
  size: number;
  tenantId: string;
  projectId?: string;
}

/** 租户间调配请求体 */
export interface ProfileTransferBO {
  profileId: string;
  fromTenantId: string;
  toTenantId: string;
  toProjectId?: string;
  remark?: string;
}

/** 批量回收请求体 */
export interface ProfileBatchRecycleBO {
  profileIds: string[];
}

/** 调配日志视图对象 */
export interface ProfileAllocationLogVO {
  id: number;
  profileId: string;
  iccid: string;
  fromTenantId?: string;
  toTenantId?: string;
  fromProjectId?: string;
  toProjectId?: string;
  actionType: string;        // ALLOCATE / TRANSFER / RECYCLE
  beforeStatus?: string;
  afterStatus?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createTime: string;
}

/** 调配日志查询 */
export interface ProfileAllocationLogQuery extends PageQuery {
  profileId?: string;
  iccid?: string;
  toTenantId?: string;
  actionType?: string;
}
```

- [ ] **Step 1.2：创建 API 函数**

创建 `apps/web-antd/src/api/system/profile-pool/index.ts`：

```ts
import type {
  ProfileAllocateBO,
  ProfileAllocationLogQuery,
  ProfileAllocationLogVO,
  ProfileBatchRecycleBO,
  ProfilePoolStatsVO,
  ProfileTransferBO,
} from './model';
import type { ID, PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  stats = '/manager/profile/pool/stats',
  allocate = '/manager/profile/pool/allocate',
  transfer = '/manager/profile/pool/transfer',
  recycle = '/manager/profile/pool/recycle',
  batchRecycle = '/manager/profile/pool/batch-recycle',
  log = '/manager/profile/pool/allocation-log',
}

/** 资源池统计（tenantId 为空串则查平台维度） */
export function poolStats(tenantId: string = '') {
  return alovaInstance.get<ProfilePoolStatsVO>(Api.stats, {
    params: { tenantId },
  });
}

/** 平台总池 → 租户池 分配 */
export function poolAllocate(data: ProfileAllocateBO) {
  return alovaInstance.postWithMsg<void>(Api.allocate, data);
}

/** 租户间调配 */
export function poolTransfer(data: ProfileTransferBO) {
  return alovaInstance.postWithMsg<void>(Api.transfer, data);
}

/** 单个回收 */
export function poolRecycle(profileId: ID) {
  return alovaInstance.postWithMsg<void>(`${Api.recycle}/${profileId}`);
}

/** 批量回收 */
export function poolBatchRecycle(data: ProfileBatchRecycleBO) {
  return alovaInstance.postWithMsg<void>(Api.batchRecycle, data);
}

/** 调配日志分页查询 */
export function allocationLogList(params?: ProfileAllocationLogQuery) {
  return alovaInstance.get<PageResult<ProfileAllocationLogVO>>(Api.log, {
    params,
  });
}
```

- [ ] **Step 1.3：扩展现有 profile 模型加 poolStatus 字段（查询 + 响应）**

修改 `apps/web-antd/src/api/system/profile/model.d.ts`，**仅替换 `ProfileQuery` 和 `ProfileVO` 两个接口**为：

```ts
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
  // 新增 — 资源池过滤
  poolStatus?: string;
  assignedTenantId?: string;
  productionBatch?: string;
  carrierName?: string;
}

export interface ProfileVO {
  id?: number | string;       // 新增（用于回收/调配的主键）
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
  // 新增 — 资源池字段
  poolStatus?: string;        // UNASSIGNED/ASSIGNED/DOWNLOADED/RECYCLEABLE
  apnId?: string;
  apn?: string;
  apnLocal?: string;
  projectId?: string;
  tenantName?: string;
}
```

（其余 `AllocationForm`, `UserProfile`, `UpdatePasswordParam` 接口保持不变）

---

## Task 2：池状态工具

**Files:**
- Create: `apps/web-antd/src/utils/poolStatus.ts`

- [ ] **Step 2.1：创建工具文件**

创建 `apps/web-antd/src/utils/poolStatus.ts`：

```ts
/** 平台总池状态映射 */
export const POOL_STATUS_MAP: Record<string, { color: string; text: string }> = {
  UNASSIGNED:  { color: 'default', text: '未分配' },
  ASSIGNED:    { color: 'blue',    text: '已分配' },
  DOWNLOADED:  { color: 'green',   text: '已下载' },
  RECYCLEABLE: { color: 'orange',  text: '可回收' },
};

export function getPoolStatusMeta(status?: string) {
  if (!status) return { color: 'default', text: '--' };
  return POOL_STATUS_MAP[status] ?? { color: 'default', text: status };
}

export const POOL_STATUS_OPTIONS = Object.entries(POOL_STATUS_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);

/** 租户资源池状态映射（语义略不同：空闲/已下载/已删除） */
export const TENANT_POOL_STATUS_MAP: Record<
  string,
  { color: string; text: string }
> = {
  ASSIGNED:    { color: 'cyan',   text: '空闲' },
  DOWNLOADED:  { color: 'green',  text: '已下载' },
  RECYCLEABLE: { color: 'red',    text: '已删除' },
};

export function getTenantPoolStatusMeta(status?: string) {
  if (!status) return { color: 'default', text: '--' };
  return TENANT_POOL_STATUS_MAP[status] ?? { color: 'default', text: status };
}

export const TENANT_POOL_STATUS_OPTIONS = Object.entries(
  TENANT_POOL_STATUS_MAP,
).map(([value, { text }]) => ({ value, label: text }));

/** 调配动作类型映射 */
export const ALLOCATION_ACTION_MAP: Record<
  string,
  { color: string; text: string }
> = {
  ALLOCATE: { color: 'blue',   text: '分配' },
  TRANSFER: { color: 'purple', text: '调配' },
  RECYCLE:  { color: 'orange', text: '回收' },
};

export function getAllocationActionMeta(action?: string) {
  if (!action) return { color: 'default', text: '--' };
  return ALLOCATION_ACTION_MAP[action] ?? { color: 'default', text: action };
}

export const ALLOCATION_ACTION_OPTIONS = Object.entries(
  ALLOCATION_ACTION_MAP,
).map(([value, { text }]) => ({ value, label: text }));
```

---

## Task 3：通用统计卡片组件

**Files:**
- Create: `apps/web-antd/src/views/profile-pool/total/stats-card.vue`

NOTE: 文件放在 `total/` 目录但会被 `tenant/` 等多个页面 import。Vue 不强求位置；P4 也可能复用。

- [ ] **Step 3.1：创建 stats-card.vue**

创建 `apps/web-antd/src/views/profile-pool/total/stats-card.vue`：

```vue
<script setup lang="ts">
import { Card, Statistic } from 'antdv-next';

interface StatItem {
  /** 统计值 */
  value: number;
  /** 标题 */
  title: string;
  /** 渐变背景（CSS gradient 字符串） */
  gradient: string;
}

defineProps<{
  loading?: boolean;
  items: StatItem[];
}>();
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4"
    :class="`md:grid-cols-2 xl:grid-cols-${items.length}`"
  >
    <Card
      v-for="(it, idx) in items"
      :key="idx"
      :body-style="{ padding: '20px 24px' }"
      :loading="loading"
      class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      :style="{ background: it.gradient, color: '#fff' }"
    >
      <Statistic
        :value="it.value"
        :value-style="{ color: '#fff', fontSize: '28px', fontWeight: 600 }"
      >
        <template #title>
          <span class="text-white/85">{{ it.title }}</span>
        </template>
      </Statistic>
    </Card>
  </div>
</template>
```

---

## Task 4：资源总池页

**Files:**
- Create: `apps/web-antd/src/views/profile-pool/total/data.tsx`
- Create: `apps/web-antd/src/views/profile-pool/total/index.vue`
- Create: `apps/web-antd/src/views/profile-pool/total/allocate-modal.vue`

- [ ] **Step 4.1：data.tsx**

创建 `apps/web-antd/src/views/profile-pool/total/data.tsx`：

```tsx
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { POOL_STATUS_OPTIONS } from '#/utils/poolStatus';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'iccid', label: 'ICCID' },
  { component: 'Input', fieldName: 'carrierName', label: '运营商' },
  { component: 'Input', fieldName: 'productionBatch', label: '生产批次' },
  {
    component: 'Select',
    fieldName: 'poolStatus',
    label: '池状态',
    componentProps: {
      allowClear: true,
      options: POOL_STATUS_OPTIONS,
      placeholder: '请选择',
    },
  },
  { component: 'Input', fieldName: 'tenantName', label: '分配租户' },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'ICCID', field: 'iccid', minWidth: 180 },
  { title: '运营商', field: 'carrierName', width: 140 },
  { title: '生产批次', field: 'productionBatch', width: 140 },
  { title: 'DP+来源', field: 'dpSource', width: 120 },
  { title: 'APN', field: 'apn', width: 100 },
  {
    title: '池状态',
    field: 'poolStatus',
    width: 110,
    slots: { default: 'poolStatus' },
  },
  { title: '分配租户', field: 'companyName', width: 160 },
  { title: '归属项目', field: 'projectName', width: 140 },
  { title: '更新时间', field: 'updateTime', width: 170 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 160,
  },
];
```

- [ ] **Step 4.2：allocate-modal.vue（分配到租户）**

创建 `apps/web-antd/src/views/profile-pool/total/allocate-modal.vue`：

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { poolAllocate } from '#/api/system/profile-pool';
import { batchAllowableNumber } from '#/api/system/profile';
import {
  getProjectDict,
  getTenantDict,
} from '#/views/system/cardImport/hooks/useGetDict';

const emit = defineEmits<{ reload: [] }>();

const canAssign = ref<number>(0);
const presetBatch = ref<string | undefined>(undefined);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: { labelWidth: 110 },
  schema: [
    {
      component: 'Input',
      fieldName: 'productionBatch',
      label: '生产批次',
      rules: 'required',
      componentProps: {
        placeholder: '请输入批次号',
        onChange: async (e: any) => {
          const val = typeof e === 'string' ? e : e?.target?.value;
          if (val) {
            const data = await batchAllowableNumber(val);
            canAssign.value = (data as any)?.data ?? data ?? 0;
          } else {
            canAssign.value = 0;
          }
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'canAssignDisplay',
      label: '可分配数量',
      componentProps: {
        disabled: true,
        placeholder: '输入批次后显示',
      },
    },
    {
      component: 'Select',
      fieldName: 'tenantId',
      label: '目标租户',
      rules: 'required',
      componentProps: {
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择租户',
        options: [],
        onChange: async (tenantId: any) => {
          if (tenantId) {
            const opts = await getProjectDict(tenantId);
            formApi.updateSchema([
              { fieldName: 'projectId', componentProps: { options: opts } },
            ]);
            formApi.setValues({ projectId: undefined });
          }
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'projectId',
      label: '目标项目',
      componentProps: {
        placeholder: '请先选择租户',
        options: [],
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'size',
      label: '分配数量',
      rules: 'required',
      componentProps: {
        min: 1,
        style: 'width: 100%',
        placeholder: '请输入数量',
      },
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: async () => {
    await formApi.resetForm();
    canAssign.value = 0;
    presetBatch.value = undefined;
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);

    const data = modalApi.getData() as { productionBatch?: string } | undefined;
    presetBatch.value = data?.productionBatch;

    // 加载租户下拉
    const tenants = await getTenantDict();
    formApi.updateSchema([
      { fieldName: 'tenantId', componentProps: { options: tenants } },
    ]);

    // 若有预填批次，自动加载可分配数量
    if (presetBatch.value) {
      await formApi.setValues({ productionBatch: presetBatch.value });
      const res = await batchAllowableNumber(presetBatch.value);
      canAssign.value = (res as any)?.data ?? res ?? 0;
    }

    modalApi.modalLoading(false);
  },
});

// 把 canAssign 推到表单展示字段
import { watch } from 'vue';
watch(canAssign, (v) => {
  formApi.setValues({ canAssignDisplay: String(v) });
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    if (values.size > canAssign.value) {
      window.message.warning(`分配数量不能超过可分配数量 ${canAssign.value}`);
      return;
    }
    await poolAllocate({
      productionBatch: values.productionBatch,
      tenantId: values.tenantId,
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
  <BasicModal title="分配到租户池" class="w-[520px]">
    <div
      class="mb-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    >
      将指定批次的码号分配给目标租户的资源池。分配后租户即可在自己的池中下载使用。
    </div>
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 4.3：index.vue（资源总池主页）**

创建 `apps/web-antd/src/views/profile-pool/total/index.vue`：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { profileList } from '#/api/system/profile';
import {
  poolBatchRecycle,
  poolRecycle,
  poolStats,
} from '#/api/system/profile-pool';
import type { ProfilePoolStatsVO } from '#/api/system/profile-pool/model';
import { getPoolStatusMeta } from '#/utils/poolStatus';

import AllocateModal from './allocate-modal.vue';
import StatsCard from './stats-card.vue';
import { columns, querySchema } from './data';

// ============ 统计卡片 ============
const stats = ref<ProfilePoolStatsVO | null>(null);
const statsLoading = ref(false);

async function loadStats() {
  statsLoading.value = true;
  try {
    stats.value = await poolStats('');
  } catch (error) {
    console.error(error);
  } finally {
    statsLoading.value = false;
  }
}

const statItems = () => [
  {
    title: '未分配',
    value: stats.value?.unassignedCount ?? 0,
    gradient: 'linear-gradient(135deg, #a8a8a8 0%, #d0d0d0 100%)',
  },
  {
    title: '已分配',
    value: stats.value?.assignedCount ?? 0,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    title: '已下载',
    value: stats.value?.downloadedCount ?? 0,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    title: '可回收',
    value: stats.value?.recycleableCount ?? 0,
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
];

// ============ 表格 ============
const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80, componentProps: { allowClear: true } },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    checkMethod: ({ row }) =>
      row.poolStatus === 'DOWNLOADED' || row.poolStatus === 'RECYCLEABLE',
  },
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
  rowConfig: { keyField: 'id' },
  id: 'profile-pool-total-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [AllocateModalComp, allocateApi] = useVbenModal({
  connectedComponent: AllocateModal,
});

async function handleAllocate(row?: any) {
  allocateApi.setData({ productionBatch: row?.productionBatch });
  allocateApi.open();
}

async function handleRecycle(row: any) {
  await poolRecycle(row.id);
  await Promise.all([tableApi.query(), loadStats()]);
}

async function handleBatchRecycle() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((r: any) => String(r.id));
  if (ids.length === 0) {
    window.message.warning('请先选择要回收的码号');
    return;
  }
  window.modal.confirm({
    title: '批量回收',
    content: `确认回收选中的 ${ids.length} 条码号？回收后将变为"可回收"状态。`,
    onOk: async () => {
      await poolBatchRecycle({ profileIds: ids });
      await Promise.all([tableApi.query(), loadStats()]);
    },
  });
}

async function refreshAll() {
  await Promise.all([tableApi.query(), loadStats()]);
}

onMounted(() => loadStats());
</script>

<template>
  <Page :auto-content-height="false">
    <!-- 统计卡片 -->
    <div class="mb-4">
      <StatsCard :loading="statsLoading" :items="statItems()" />
    </div>

    <!-- 表格 -->
    <BasicTable table-title="资源总池">
      <template #toolbar-tools>
        <Space>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            @click="handleBatchRecycle"
          >
            批量回收
          </a-button>
          <a-button type="primary" @click="handleAllocate()">分配到租户</a-button>
        </Space>
      </template>

      <template #poolStatus="{ row }">
        <Tag :color="getPoolStatusMeta(row.poolStatus).color">
          {{ getPoolStatusMeta(row.poolStatus).text }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <action-button
            v-if="row.poolStatus === 'UNASSIGNED'"
            variant="link"
            color="blue"
            @click.stop="handleAllocate(row)"
          >
            分配
          </action-button>
          <Popconfirm
            v-if="
              row.poolStatus === 'DOWNLOADED' ||
              row.poolStatus === 'RECYCLEABLE'
            "
            placement="left"
            title="确认回收？"
            @confirm="handleRecycle(row)"
          >
            <action-button danger @click.stop="">回收</action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <AllocateModalComp @reload="refreshAll" />
  </Page>
</template>
```

---

## Task 5：租户资源池页

**Files:**
- Create: `apps/web-antd/src/views/profile-pool/tenant/data.tsx`
- Create: `apps/web-antd/src/views/profile-pool/tenant/index.vue`

- [ ] **Step 5.1：data.tsx**

创建 `apps/web-antd/src/views/profile-pool/tenant/data.tsx`：

```tsx
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { TENANT_POOL_STATUS_OPTIONS } from '#/utils/poolStatus';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'iccid', label: 'ICCID' },
  { component: 'Input', fieldName: 'carrierName', label: '运营商' },
  {
    component: 'Select',
    fieldName: 'poolStatus',
    label: '池状态',
    componentProps: {
      allowClear: true,
      options: TENANT_POOL_STATUS_OPTIONS,
      placeholder: '请选择',
    },
  },
  { component: 'Input', fieldName: 'projectName', label: '所属项目' },
];

export const columns: VxeGridProps['columns'] = [
  { title: 'ICCID', field: 'iccid', minWidth: 180 },
  { title: '运营商', field: 'carrierName', width: 140 },
  { title: '生产批次', field: 'productionBatch', width: 140 },
  { title: '归属项目', field: 'projectName', width: 160 },
  {
    title: '池状态',
    field: 'poolStatus',
    width: 110,
    slots: { default: 'poolStatus' },
  },
  { title: '关联 EID', field: 'eid', minWidth: 180 },
  { title: '更新时间', field: 'updateTime', width: 170 },
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

- [ ] **Step 5.2：index.vue**

创建 `apps/web-antd/src/views/profile-pool/tenant/index.vue`：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import { Card, Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { profileList } from '#/api/system/profile';
import { poolRecycle, poolStats } from '#/api/system/profile-pool';
import type { ProfilePoolStatsVO } from '#/api/system/profile-pool/model';
import { useTenantStore } from '#/store/tenant';
import { getTenantPoolStatusMeta } from '#/utils/poolStatus';

import StatsCard from '../total/stats-card.vue';
import { columns, querySchema } from './data';

// ============ 租户选择 ============
const tenantStore = useTenantStore();
const selectedTenantId = ref<string>('');

const tenantOptions = computed(() =>
  tenantStore.tenantList.map((t) => ({
    label: t.companyName,
    value: t.tenantId,
  })),
);

// ============ 统计 ============
const stats = ref<ProfilePoolStatsVO | null>(null);
const statsLoading = ref(false);

async function loadStats() {
  if (!selectedTenantId.value) return;
  statsLoading.value = true;
  try {
    stats.value = await poolStats(selectedTenantId.value);
  } catch (error) {
    console.error(error);
  } finally {
    statsLoading.value = false;
  }
}

// 租户池只关心：空闲(已分配未下载) / 已下载 / 已删除
const statItems = () => [
  {
    title: '空闲',
    value: stats.value?.assignedCount ?? 0,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    title: '已下载',
    value: stats.value?.downloadedCount ?? 0,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    title: '已删除',
    value: stats.value?.recycleableCount ?? 0,
    gradient: 'linear-gradient(135deg, #ff6a88 0%, #ff99ac 100%)',
  },
];

// ============ 表格 ============
const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 80, componentProps: { allowClear: true } },
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
        return await profileList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          assignedTenantId: selectedTenantId.value,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-pool-tenant-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

async function handleRecycle(row: any) {
  await poolRecycle(row.id);
  await Promise.all([tableApi.query(), loadStats()]);
}

watch(selectedTenantId, async () => {
  await Promise.all([tableApi.query(), loadStats()]);
});

onMounted(async () => {
  if (tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
  const first = tenantStore.tenantList[0];
  if (first) selectedTenantId.value = first.tenantId;
});
</script>

<template>
  <Page :auto-content-height="false">
    <!-- 租户选择 -->
    <Card
      :body-style="{ padding: '14px 18px' }"
      class="mb-4 shadow-sm transition hover:shadow-md"
    >
      <div class="flex items-center gap-3">
        <span class="text-base font-semibold">租户：</span>
        <a-select
          v-model:value="selectedTenantId"
          :options="tenantOptions"
          show-search
          option-filter-prop="label"
          placeholder="请选择租户"
          style="width: 280px"
        />
      </div>
    </Card>

    <!-- 统计卡片 -->
    <div class="mb-4">
      <StatsCard :loading="statsLoading" :items="statItems()" />
    </div>

    <!-- 表格 -->
    <BasicTable table-title="租户资源池">
      <template #poolStatus="{ row }">
        <Tag :color="getTenantPoolStatusMeta(row.poolStatus).color">
          {{ getTenantPoolStatusMeta(row.poolStatus).text }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <Popconfirm
            v-if="
              row.poolStatus === 'DOWNLOADED' ||
              row.poolStatus === 'RECYCLEABLE'
            "
            placement="left"
            title="确认回收？"
            @confirm="handleRecycle(row)"
          >
            <action-button danger @click.stop="">回收</action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
  </Page>
</template>
```

---

## Task 6：资源调配页（左右双栏）

**Files:**
- Create: `apps/web-antd/src/views/profile-pool/transfer/index.vue`
- Create: `apps/web-antd/src/views/profile-pool/transfer/transfer-modal.vue`

设计：左侧选择源租户 + 显示其资源池表格（可多选），右侧选择目标租户+项目，中间"→ 调配选中"按钮。

- [ ] **Step 6.1：transfer-modal.vue（调配确认）**

创建 `apps/web-antd/src/views/profile-pool/transfer/transfer-modal.vue`：

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Input, Tag } from 'antdv-next';

import { poolTransfer } from '#/api/system/profile-pool';

interface TransferData {
  fromTenantId: string;
  fromTenantName: string;
  toTenantId: string;
  toTenantName: string;
  toProjectId?: string;
  rows: Array<{ id: string; iccid: string }>;
}

const emit = defineEmits<{ done: [] }>();

const data = ref<TransferData | null>(null);
const remark = ref<string>('');
const submitting = ref<boolean>(false);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => {
    data.value = null;
    remark.value = '';
    submitting.value = false;
  },
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    data.value = modalApi.getData() as TransferData;
  },
});

async function handleConfirm() {
  if (!data.value || data.value.rows.length === 0) return;
  try {
    modalApi.lock(true);
    submitting.value = true;
    // 多条逐个调用 transfer
    for (const r of data.value.rows) {
      await poolTransfer({
        profileId: r.id,
        fromTenantId: data.value.fromTenantId,
        toTenantId: data.value.toTenantId,
        toProjectId: data.value.toProjectId,
        remark: remark.value,
      });
    }
    window.message.success(`成功调配 ${data.value.rows.length} 条`);
    emit('done');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
    submitting.value = false;
  }
}
</script>

<template>
  <BasicModal title="确认调配" class="w-[520px]">
    <div v-if="data" class="space-y-4">
      <!-- 来源 / 去向 -->
      <div class="rounded border border-gray-200 p-3 dark:border-gray-700">
        <div class="grid grid-cols-[1fr_auto_1fr] gap-3">
          <div class="text-center">
            <div class="mb-1 text-xs text-gray-500">来源租户</div>
            <Tag color="orange">{{ data.fromTenantName }}</Tag>
          </div>
          <div class="flex items-center text-2xl text-gray-400">→</div>
          <div class="text-center">
            <div class="mb-1 text-xs text-gray-500">目标租户</div>
            <Tag color="blue">{{ data.toTenantName }}</Tag>
          </div>
        </div>
      </div>

      <!-- 数量预览 -->
      <div
        class="rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
      >
        共选择 <span class="font-semibold">{{ data.rows.length }}</span> 条码号进行调配
      </div>

      <!-- 备注 -->
      <div>
        <div class="mb-2 text-sm font-medium">备注（可选）</div>
        <Input.TextArea
          v-model:value="remark"
          :rows="3"
          :maxlength="200"
          show-count
          placeholder="可填写调配原因等说明"
        />
      </div>
    </div>
  </BasicModal>
</template>
```

- [ ] **Step 6.2：index.vue（调配主页）**

创建 `apps/web-antd/src/views/profile-pool/transfer/index.vue`：

```vue
<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref, watch } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Card, Empty, Select, Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { profileList } from '#/api/system/profile';
import { useTenantStore } from '#/store/tenant';
import { getProjectDict } from '#/views/system/cardImport/hooks/useGetDict';

import TransferModal from './transfer-modal.vue';

const tenantStore = useTenantStore();

const sourceTenantId = ref<string>('');
const targetTenantId = ref<string>('');
const targetProjectId = ref<string | undefined>(undefined);
const targetProjectOptions = ref<Array<{ label: string; value: string }>>([]);

const tenantOptions = computed(() =>
  tenantStore.tenantList.map((t) => ({
    label: t.companyName,
    value: t.tenantId,
  })),
);

const sourceTenantName = computed(() => {
  const t = tenantStore.tenantList.find(
    (x) => x.tenantId === sourceTenantId.value,
  );
  return t?.companyName ?? '';
});

const targetTenantName = computed(() => {
  const t = tenantStore.tenantList.find(
    (x) => x.tenantId === targetTenantId.value,
  );
  return t?.companyName ?? '';
});

const canTransfer = computed(
  () =>
    sourceTenantId.value &&
    targetTenantId.value &&
    sourceTenantId.value !== targetTenantId.value,
);

// ============ 源租户表格 ============
const sourceColumns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'ICCID', field: 'iccid', minWidth: 160 },
  { title: '运营商', field: 'carrierName', width: 120 },
  { title: '批次', field: 'productionBatch', width: 120 },
  { title: '项目', field: 'projectName', width: 140 },
];

const sourceGridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: false,
    // 只能选可调配的码号（已分配未下载）
    checkMethod: ({ row }) => row.poolStatus === 'ASSIGNED',
  },
  columns: sourceColumns,
  height: 480,
  keepSource: true,
  pagerConfig: { pageSize: 20 },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        if (!sourceTenantId.value) {
          return { rows: [], total: 0 };
        }
        return await profileList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          assignedTenantId: sourceTenantId.value,
          poolStatus: 'ASSIGNED',
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-pool-transfer-source',
  showOverflow: 'tooltip',
};

const [SourceTable, sourceTableApi] = useVbenVxeGrid({
  gridOptions: sourceGridOptions,
});

watch(sourceTenantId, () => sourceTableApi.query());

// ============ 目标租户项目联动 ============
watch(targetTenantId, async (newId) => {
  targetProjectId.value = undefined;
  if (newId) {
    targetProjectOptions.value = await getProjectDict(newId);
  } else {
    targetProjectOptions.value = [];
  }
});

// ============ 调配 ============
const [TransferModalComp, transferApi] = useVbenModal({
  connectedComponent: TransferModal,
});

function handleTransfer() {
  const rows = sourceTableApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    window.message.warning('请先在左侧勾选要调配的码号');
    return;
  }
  transferApi.setData({
    fromTenantId: sourceTenantId.value,
    fromTenantName: sourceTenantName.value,
    toTenantId: targetTenantId.value,
    toTenantName: targetTenantName.value,
    toProjectId: targetProjectId.value,
    rows: rows.map((r: any) => ({ id: String(r.id), iccid: r.iccid })),
  });
  transferApi.open();
}

async function onTransferDone() {
  await sourceTableApi.query();
}

onMounted(async () => {
  if (tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
});
</script>

<template>
  <Page :auto-content-height="false">
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_120px_1fr]">
      <!-- 左：源租户 -->
      <Card
        :body-style="{ padding: '16px' }"
        title="📤 源租户（选择要转出的码号）"
        :head-style="{
          background:
            'linear-gradient(90deg, rgba(250,173,20,0.08) 0%, transparent 100%)',
        }"
        class="shadow-sm"
      >
        <div class="mb-3">
          <Select
            v-model:value="sourceTenantId"
            :options="tenantOptions"
            show-search
            option-filter-prop="label"
            placeholder="选择源租户"
            style="width: 100%"
          />
        </div>
        <SourceTable v-if="sourceTenantId" />
        <Empty v-else description="请先选择源租户" />
      </Card>

      <!-- 中：调配按钮 -->
      <div class="flex flex-col items-center justify-center gap-4 py-12">
        <div class="text-5xl text-gray-300">→</div>
        <Button
          type="primary"
          size="large"
          :disabled="!canTransfer"
          @click="handleTransfer"
        >
          调配选中
        </Button>
        <div
          v-if="
            sourceTenantId &&
            targetTenantId &&
            sourceTenantId === targetTenantId
          "
          class="text-center text-xs text-rose-500"
        >
          源与目标不能相同
        </div>
      </div>

      <!-- 右：目标租户 -->
      <Card
        :body-style="{ padding: '16px' }"
        title="📥 目标租户（选择接收方）"
        :head-style="{
          background:
            'linear-gradient(90deg, rgba(24,144,255,0.08) 0%, transparent 100%)',
        }"
        class="shadow-sm"
      >
        <div class="space-y-3">
          <div>
            <div class="mb-2 text-sm font-medium">目标租户</div>
            <Select
              v-model:value="targetTenantId"
              :options="tenantOptions"
              show-search
              option-filter-prop="label"
              placeholder="选择目标租户"
              style="width: 100%"
            />
          </div>
          <div>
            <div class="mb-2 text-sm font-medium">目标项目（可选）</div>
            <Select
              v-model:value="targetProjectId"
              :options="targetProjectOptions"
              allow-clear
              placeholder="不选则保留原项目归属"
              style="width: 100%"
              :disabled="!targetTenantId"
            />
          </div>

          <!-- 选中预览 -->
          <div
            v-if="canTransfer"
            class="mt-4 rounded bg-emerald-50 px-3 py-2 text-xs dark:bg-emerald-900/20"
          >
            <div class="flex items-center gap-2">
              <Tag color="orange">{{ sourceTenantName }}</Tag>
              <span>→</span>
              <Tag color="blue">{{ targetTenantName }}</Tag>
            </div>
            <div class="mt-1 text-emerald-700 dark:text-emerald-300">
              确认调配前请先在左侧勾选码号
            </div>
          </div>
        </div>
      </Card>
    </div>

    <TransferModalComp @done="onTransferDone" />
  </Page>
</template>
```

---

## Task 7：调配日志页

**Files:**
- Create: `apps/web-antd/src/views/profile-pool/log/data.tsx`
- Create: `apps/web-antd/src/views/profile-pool/log/index.vue`

- [ ] **Step 7.1：data.tsx**

创建 `apps/web-antd/src/views/profile-pool/log/data.tsx`：

```tsx
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ALLOCATION_ACTION_OPTIONS } from '#/utils/poolStatus';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'iccid', label: 'ICCID' },
  { component: 'Input', fieldName: 'profileId', label: 'Profile ID' },
  { component: 'Input', fieldName: 'toTenantId', label: '目标租户ID' },
  {
    component: 'Select',
    fieldName: 'actionType',
    label: '动作类型',
    componentProps: {
      allowClear: true,
      options: ALLOCATION_ACTION_OPTIONS,
      placeholder: '请选择',
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 60 },
  { title: 'ICCID', field: 'iccid', minWidth: 180 },
  { title: 'Profile ID', field: 'profileId', width: 140 },
  {
    title: '动作',
    field: 'actionType',
    width: 100,
    slots: { default: 'actionType' },
  },
  { title: '源租户', field: 'fromTenantId', width: 160 },
  { title: '目标租户', field: 'toTenantId', width: 160 },
  {
    title: '状态变更',
    field: 'beforeStatus',
    width: 160,
    slots: { default: 'statusChange' },
  },
  { title: '操作人', field: 'operatorName', width: 110 },
  { title: '备注', field: 'remark', minWidth: 160, showOverflow: true },
  { title: '时间', field: 'createTime', width: 170 },
];
```

- [ ] **Step 7.2：index.vue**

创建 `apps/web-antd/src/views/profile-pool/log/index.vue`：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { allocationLogList } from '#/api/system/profile-pool';
import { getAllocationActionMeta, getPoolStatusMeta } from '#/utils/poolStatus';

import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: { labelWidth: 88, componentProps: { allowClear: true } },
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
        return await allocationLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'profile-pool-log-index',
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="资源调配日志">
      <template #actionType="{ row }">
        <Tag :color="getAllocationActionMeta(row.actionType).color">
          {{ getAllocationActionMeta(row.actionType).text }}
        </Tag>
      </template>
      <template #statusChange="{ row }">
        <div class="flex items-center gap-1">
          <Tag :color="getPoolStatusMeta(row.beforeStatus).color">
            {{ getPoolStatusMeta(row.beforeStatus).text }}
          </Tag>
          <span class="text-gray-400">→</span>
          <Tag :color="getPoolStatusMeta(row.afterStatus).color">
            {{ getPoolStatusMeta(row.afterStatus).text }}
          </Tag>
        </div>
      </template>
    </BasicTable>
  </Page>
</template>
```

---

## Task 8：菜单路由

**Files:**
- Modify: `apps/web-antd/src/router/routes/modules/eim.ts`

在现有 `LicenseGroup` 路由后追加"码号资源管理"路由组。

- [ ] **Step 8.1：在 eim.ts 末尾（return 之前的 routes 数组内）追加路由组**

读取现有 `apps/web-antd/src/router/routes/modules/eim.ts`，在数组的 `LicenseGroup` 对象后面追加：

```ts
  // ============ 码号资源管理（P3 新增一级菜单） ============
  {
    name: 'ProfilePoolGroup',
    path: '/profile-pool',
    component: BasicLayout,
    redirect: '/profile-pool/total',
    meta: {
      title: '码号资源管理',
      icon: 'lucide:database',
      order: 22,
    },
    children: [
      {
        name: 'ProfilePoolTotal',
        path: '/profile-pool/total',
        component: () => import('#/views/profile-pool/total/index.vue'),
        meta: {
          title: '资源总池',
          icon: 'lucide:layers',
          keepAlive: true,
        },
      },
      {
        name: 'ProfilePoolTenant',
        path: '/profile-pool/tenant',
        component: () => import('#/views/profile-pool/tenant/index.vue'),
        meta: {
          title: '租户资源池',
          icon: 'lucide:building-2',
          keepAlive: true,
        },
      },
      {
        name: 'ProfilePoolTransfer',
        path: '/profile-pool/transfer',
        component: () => import('#/views/profile-pool/transfer/index.vue'),
        meta: {
          title: '资源调配',
          icon: 'lucide:arrow-left-right',
        },
      },
      {
        name: 'ProfilePoolLog',
        path: '/profile-pool/log',
        component: () => import('#/views/profile-pool/log/index.vue'),
        meta: {
          title: '调配日志',
          icon: 'lucide:scroll-text',
          keepAlive: true,
        },
      },
    ],
  },
```

注意：保持数组语法正确，追加项之间用逗号分隔。

---

## Task 9：清理现有 Profile 页面的"资源分配"入口

**Files:**
- Modify: `apps/web-antd/src/views/system/profile/index.vue`

按设计文档 §4.5：移除"资源分配"按钮，统一到资源池模块。allocation-modal.vue 标记 deprecated（暂不删除，保留以备回滚）。

- [ ] **Step 9.1：精简 Profile 页面**

修改 `apps/web-antd/src/views/system/profile/index.vue`：

1. 删除 import 行 `import AllocationModal from './allocation-modal.vue';`
2. 删除变量 `const [AllocationModalComp, allocationApi] = useVbenModal({ connectedComponent: AllocationModal });`
3. 删除函数 `function handleAllocation() { ... }`
4. 在 `<template #toolbar-tools>` 内删除 `<a-button type="primary" @click="handleAllocation">资源分配</a-button>` 一行
5. 在 toolbar 增加一行跳转提示按钮：

```vue
<a-button @click="$router.push('/profile-pool/total')">
  前往资源池管理 →
</a-button>
```

6. 在模板末尾删除 `<AllocationModalComp @reload="tableApi.query()" />` 一行

- [ ] **Step 9.2：在 allocation-modal.vue 顶部加 deprecation 注释**

修改 `apps/web-antd/src/views/system/profile/allocation-modal.vue`，在 `<script setup lang="ts">` 第一行后插入：

```ts
/**
 * @deprecated P3 之后请使用 views/profile-pool/total/allocate-modal.vue
 * 当前文件仅作回滚备份，无任何引用。计划在 P4 上线后删除。
 */
```

---

## Task 10：端到端冒烟验证

- [ ] **Step 10.1：拉起开发服务**

```bash
cd d:/Project/esim.eim.web && pnpm dev:antd
```

- [ ] **Step 10.2：访问页面**

| URL | 期望 |
|---|---|
| `/profile-pool/total` | 顶部 4 张渐变统计卡（未分配灰 / 已分配蓝 / 已下载绿 / 可回收橙）+ 表格 + 工具栏"分配到租户"和"批量回收" |
| `/profile-pool/tenant` | 顶部租户选择 + 3 张渐变卡（空闲蓝/已下载绿/已删除红）+ 表格 |
| `/profile-pool/transfer` | 左右双栏布局，中间"→ 调配选中"按钮（源/目标不同才能点） |
| `/profile-pool/log` | 标准分页表，"动作"列为彩色 Tag，"状态变更"列显示 Tag1 → Tag2 |
| `系统管理 → Profile来源管理` | "资源分配"按钮消失，多了"前往资源池管理 →"按钮 |

- [ ] **Step 10.3：交互验证**

- [ ] 总池：分配 → 选目标租户/项目 → 数量校验（超过 canAssign 应提示）→ 成功后两侧数字 +/- 同步
- [ ] 总池：选择 1 行已下载/可回收 → "批量回收" → 状态变更
- [ ] 租户池：切换租户 → 3 张卡数字刷新
- [ ] 调配页：选源租户 → 左侧表格出现可选行（仅 ASSIGNED） → 选目标 → 中间按钮可点
- [ ] 调配页：源/目标相同时按钮不可点且有提示
- [ ] 日志：动作类型彩色 Tag + 状态变更 Tag→Tag 渲染

- [ ] **Step 10.4：typecheck / lint（如环境支持）**

```bash
cd d:/Project/esim.eim.web && pnpm -F @vben/web-antd run typecheck 2>&1 | tail -30
cd d:/Project/esim.eim.web && pnpm lint 2>&1 | tail -30
```

---

## 完成标准

- [ ] API 层 6 个函数全部可调通
- [ ] 4 个子页面均可分页加载、字段完整
- [ ] 总池统计 4 色卡 + 租户池统计 3 色卡视觉精致
- [ ] 调配页左右双栏布局，按钮禁用逻辑正确
- [ ] 调配日志 Tag→Tag 状态变更显示
- [ ] 现有 Profile 页面"资源分配"入口已移除，引导至新模块
- [ ] 池状态映射统一从 `utils/poolStatus.ts` 引入

---

## 后续依赖

P3 完成后：
1. 用户验收 4 个页面视觉与交互
2. 验证后端 ProfileListVO 是否返回 `poolStatus` 字段（若无需协调后端补充）
3. 确认 `views/system/profile/allocation-modal.vue` 是否可在 P4 完成后删除

确认后再进入 **P4**（eUICC 模块重构 + OpenAPI 日志）。
