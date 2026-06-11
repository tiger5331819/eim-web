# P1 — 菜单结构 + 租户/License 管理 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地《eIM 调整需求》的第一阶段 — 调整菜单结构、新增 License 管理三个子页面（余额查询/变更流水/冻结记录），并在租户列表集成 License 入口。视觉上采用渐变卡片、彩色徽章、过渡动效，让界面更精致。

**Architecture:** 沿用 Vben Admin 现有模式：API 层（alovaInstance）→ 视图层（vxe-table + vbenForm + vbenModal/Drawer）。菜单层级通过前端静态路由配置 + 后端 system_menu SQL 双轨保障（开发期前端可见、合并前后端入库）。视觉风格采用 Tailwind 渐变 + Ant Design Statistic + 自定义 Tag 颜色。

**Tech Stack:** Vue 3 + TypeScript + Vben Admin 5 + Ant Design Vue (antdv-next) + Tailwind CSS + Pinia + Alova + vxe-table + dayjs

---

## 文件结构

### 新建文件

```
apps/web-antd/src/
├── api/system/license/
│   ├── index.ts                              # 6 个 license API 函数
│   └── model.d.ts                            # 类型定义
├── views/license/
│   ├── index.vue                             # 余额查询主页（带渐变卡片）
│   ├── data.tsx                              # 搜索/表格 schema
│   ├── license-add-modal.vue                 # 添加次数弹窗
│   ├── license-adjust-modal.vue              # 调整次数弹窗
│   ├── license-record/
│   │   ├── index.vue                         # 变更流水分页表
│   │   └── data.tsx
│   └── license-freeze/
│       ├── index.vue                         # 冻结记录分页表
│       └── data.tsx
└── router/routes/modules/
    └── eim.ts                                # 新菜单结构静态路由
```

### 修改文件

```
apps/web-antd/src/views/system/tenant/index.vue   # 操作列新增 License 入口
apps/web-antd/src/views/system/tenant/data.tsx    # 列定义（无需修改，按钮放 action slot）
```

### 字典依赖（后续由后端 SQL 同步，前端先 mock）

| code | 用途 |
|---|---|
| `eim_license_change_type` | License 变更类型（ADD/ADJUST/FREEZE/CONFIRM/RELEASE/EXPIRE） |
| `eim_license_freeze_status` | 冻结状态（FROZEN/CONFIRMED/RELEASED/EXPIRED） |

---

## Task 1：创建 License API 层

**Files:**
- Create: `apps/web-antd/src/api/system/license/model.d.ts`
- Create: `apps/web-antd/src/api/system/license/index.ts`

- [ ] **Step 1.1：创建类型定义文件**

创建 `apps/web-antd/src/api/system/license/model.d.ts`：

```ts
import type { BaseEntity, PageQuery } from '#/api/common';

/** 租户 License 余额视图对象 */
export interface TenantLicenseVO {
  id: number;
  tenantId: string;
  totalQuota: number;       // 累计添加次数
  usedQuota: number;        // 已确认扣减次数
  frozenQuota: number;      // 冻结中次数
  availableQuota: number;   // 可用次数
  status: '0' | '1';        // 0 正常 1 停用
  remark?: string;
}

/** License 变更流水视图对象 */
export interface TenantLicenseRecordVO {
  id: number;
  tenantId: string;
  changeType: string;       // ADD/ADJUST/FREEZE/CONFIRM/RELEASE/EXPIRE
  changeQuota: number;      // 本次变更数量（正数加 负数减）
  beforeAvailable: number;
  afterAvailable: number;
  bizType?: string;         // 业务类型（如 download）
  bizId?: string;           // 业务 ID（如 task id）
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createTime: string;
}

/** License 冻结记录视图对象 */
export interface TenantLicenseFreezeVO {
  id: number;
  tenantId: string;
  taskId: string;
  profileId?: string;
  iccid?: string;
  freezeQuota: number;
  status: string;           // FROZEN/CONFIRMED/RELEASED/EXPIRED
  freezeTime: string;
  confirmTime?: string;
  releaseTime?: string;
  expireTime?: string;
  remark?: string;
  createTime: string;
}

/** 添加 License 次数请求体 */
export interface TenantLicenseAddBO {
  tenantId: string;
  quota: number;
  remark?: string;
}

/** 调整 License 次数请求体（管理员） */
export interface TenantLicenseAdjustBO {
  tenantId: string;
  delta: number;            // 正数增加，负数扣减
  remark: string;
}

/** 切换 License 状态请求体 */
export interface TenantLicenseStatusBO {
  tenantId: string;
  status: '0' | '1';
}

/** 变更流水查询参数 */
export interface TenantLicenseRecordQuery extends PageQuery {
  tenantId?: string;
  changeType?: string;
}

/** 冻结记录查询参数 */
export interface TenantLicenseFreezeQuery extends PageQuery {
  tenantId?: string;
  status?: string;
}
```

- [ ] **Step 1.2：创建 API 函数文件**

创建 `apps/web-antd/src/api/system/license/index.ts`：

```ts
import type {
  TenantLicenseAddBO,
  TenantLicenseAdjustBO,
  TenantLicenseFreezeQuery,
  TenantLicenseFreezeVO,
  TenantLicenseRecordQuery,
  TenantLicenseRecordVO,
  TenantLicenseStatusBO,
  TenantLicenseVO,
} from './model';
import type { PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/license',
  add = '/manager/license/add',
  adjust = '/manager/license/adjust',
  status = '/manager/license/status',
  record = '/manager/license/record',
  freeze = '/manager/license/freeze',
}

/** 查询租户 License 余额 */
export function getLicense(tenantId: string) {
  return alovaInstance.get<TenantLicenseVO>(`${Api.root}/${tenantId}`);
}

/** 添加 License 次数 */
export function addLicense(data: TenantLicenseAddBO) {
  return alovaInstance.postWithMsg<void>(Api.add, data);
}

/** 管理员调整 License 次数（增加/扣减） */
export function adjustLicense(data: TenantLicenseAdjustBO) {
  return alovaInstance.postWithMsg<void>(Api.adjust, data);
}

/** 启用/停用租户 License */
export function toggleLicenseStatus(data: TenantLicenseStatusBO) {
  return alovaInstance.putWithMsg<void>(Api.status, data);
}

/** 分页查询 License 变更流水 */
export function licenseRecordList(params?: TenantLicenseRecordQuery) {
  return alovaInstance.get<PageResult<TenantLicenseRecordVO>>(Api.record, {
    params,
  });
}

/** 分页查询 License 冻结记录 */
export function licenseFreezeList(params?: TenantLicenseFreezeQuery) {
  return alovaInstance.get<PageResult<TenantLicenseFreezeVO>>(Api.freeze, {
    params,
  });
}
```

- [ ] **Step 1.3：类型检查**

执行：

```bash
cd d:/Project/esim.eim.web && pnpm -F @vben/web-antd run typecheck 2>&1 | tail -20
```

Expected：无类型错误（与 license 文件相关）

- [ ] **Step 1.4：提交**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/api/system/license/
git commit -m "feat(license): add license api layer"
```

---

## Task 2：注册菜单路由（前端静态路由）

**Files:**
- Create: `apps/web-antd/src/router/routes/modules/eim.ts`

后端 system_menu 入库后会通过动态路由提供，但开发期需要前端先 mock 让页面可访问。

- [ ] **Step 2.1：创建路由模块**

创建 `apps/web-antd/src/router/routes/modules/eim.ts`：

```ts
import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

/**
 * eIM 调整需求 P1 新增菜单
 * 后端 system_menu 入库后此文件可移除，菜单走动态路由
 */
const routes: RouteRecordRaw[] = [
  // ============ License 管理（租户管理一级菜单下） ============
  {
    name: 'LicenseGroup',
    path: '/license',
    component: BasicLayout,
    redirect: '/license/balance',
    meta: {
      title: 'License管理',
      icon: 'lucide:badge-dollar-sign',
      order: 21,
    },
    children: [
      {
        name: 'LicenseBalance',
        path: '/license/balance',
        component: () => import('#/views/license/index.vue'),
        meta: {
          title: '余额查询',
          icon: 'lucide:wallet',
          keepAlive: true,
        },
      },
      {
        name: 'LicenseRecord',
        path: '/license/record',
        component: () => import('#/views/license/license-record/index.vue'),
        meta: {
          title: '变更流水',
          icon: 'lucide:scroll-text',
          keepAlive: true,
        },
      },
      {
        name: 'LicenseFreeze',
        path: '/license/freeze',
        component: () => import('#/views/license/license-freeze/index.vue'),
        meta: {
          title: '冻结记录',
          icon: 'lucide:snowflake',
          keepAlive: true,
        },
      },
    ],
  },
];

export default routes;
```

- [ ] **Step 2.2：验证 BasicLayout 导入路径**

执行：

```bash
grep -r "from '#/layouts'" d:/Project/esim.eim.web/apps/web-antd/src/router/ 2>&1 | head -3
```

Expected：能看到其他路由文件类似 `import { BasicLayout } from '#/layouts';` 的引用。

若没找到，改用 grep 实际路径：

```bash
grep -rE "BasicLayout|export.*Layout" d:/Project/esim.eim.web/apps/web-antd/src/layouts/ 2>&1 | head -5
```

并根据实际导出调整 import。

- [ ] **Step 2.3：暂不提交（与 Task 6 一起提交）**

留到 Task 6 完成租户入口后再统一提交菜单与入口。

---

## Task 3：余额查询主页（带渐变卡片）

**Files:**
- Create: `apps/web-antd/src/views/license/data.tsx`
- Create: `apps/web-antd/src/views/license/index.vue`

视觉重点：
- 顶部 4 张渐变 Statistic 卡片（紫蓝渐变-累计添加 / 青绿-已用 / 橙黄-冻结 / 翠绿-可用）
- 状态徽章用 Tag 高亮
- 操作按钮组放在卡片右上
- 整体使用 Tailwind `space-y-4`、`shadow-sm hover:shadow-md transition`

- [ ] **Step 3.1：创建 data.tsx（暂时只放无操作的 schema）**

创建 `apps/web-antd/src/views/license/data.tsx`：

```tsx
import type { FormSchemaGetter } from '#/adapter/form';

import { useTenantStore } from '#/store/tenant';

/** 顶部租户选择器 schema */
export const tenantSelectSchema: FormSchemaGetter = () => {
  const tenantStore = useTenantStore();
  return [
    {
      component: 'Select',
      componentProps: {
        allowClear: false,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择租户',
        options: tenantStore.tenantList.map((t) => ({
          label: t.companyName,
          value: t.tenantId,
        })),
      },
      fieldName: 'tenantId',
      label: '租户',
    },
  ];
};
```

- [ ] **Step 3.2：创建余额查询主页**

创建 `apps/web-antd/src/views/license/index.vue`：

```vue
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Card, Statistic, Tag } from 'antdv-next';

import {
  getLicense,
  toggleLicenseStatus,
} from '#/api/system/license';
import type { TenantLicenseVO } from '#/api/system/license/model';
import { useTenantStore } from '#/store/tenant';

import LicenseAddModal from './license-add-modal.vue';
import LicenseAdjustModal from './license-adjust-modal.vue';

const { hasAccessByCodes } = useAccess();

const tenantStore = useTenantStore();
const selectedTenantId = ref<string>('');
const license = ref<TenantLicenseVO | null>(null);
const loading = ref(false);

const [AddModal, addModalApi] = useVbenModal({
  connectedComponent: LicenseAddModal,
});
const [AdjustModal, adjustModalApi] = useVbenModal({
  connectedComponent: LicenseAdjustModal,
});

async function loadLicense(tenantId: string) {
  if (!tenantId) return;
  loading.value = true;
  try {
    license.value = await getLicense(tenantId);
  } catch (error) {
    console.error(error);
    license.value = null;
  } finally {
    loading.value = false;
  }
}

async function handleToggleStatus() {
  if (!license.value) return;
  const target = license.value.status === '0' ? '1' : '0';
  window.modal.confirm({
    title: '提示',
    content: `确认${target === '1' ? '停用' : '启用'}该租户的 License？`,
    onOk: async () => {
      await toggleLicenseStatus({
        tenantId: license.value!.tenantId,
        status: target,
      });
      await loadLicense(license.value!.tenantId);
    },
  });
}

function handleAdd() {
  if (!selectedTenantId.value) {
    window.message.warning('请先选择租户');
    return;
  }
  addModalApi.setData({ tenantId: selectedTenantId.value });
  addModalApi.open();
}

function handleAdjust() {
  if (!selectedTenantId.value) {
    window.message.warning('请先选择租户');
    return;
  }
  adjustModalApi.setData({
    tenantId: selectedTenantId.value,
    current: license.value?.availableQuota ?? 0,
  });
  adjustModalApi.open();
}

const statusTag = computed(() => {
  if (!license.value) return null;
  return license.value.status === '0'
    ? { color: 'green', text: '正常' }
    : { color: 'red', text: '停用' };
});

const tenantOptions = computed(() =>
  tenantStore.tenantList.map((t) => ({
    label: t.companyName,
    value: t.tenantId,
  })),
);

watch(selectedTenantId, (v) => loadLicense(v));

onMounted(async () => {
  if (tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
  // 默认选择第一个租户
  const first = tenantStore.tenantList[0];
  if (first) selectedTenantId.value = first.tenantId;
});
</script>

<template>
  <Page :auto-content-height="false">
    <!-- 顶部租户选择 + 操作按钮 -->
    <Card
      :body-style="{ padding: '16px 20px' }"
      class="mb-4 shadow-sm transition hover:shadow-md"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="text-base font-semibold">租户：</span>
          <a-select
            v-model:value="selectedTenantId"
            :options="tenantOptions"
            show-search
            option-filter-prop="label"
            placeholder="请选择租户"
            style="width: 240px"
          />
          <Tag
            v-if="statusTag"
            :color="statusTag.color"
            class="!ml-2"
          >
            {{ statusTag.text }}
          </Tag>
        </div>

        <a-space>
          <Button
            v-if="hasAccessByCodes(['eim:license:add'])"
            type="primary"
            @click="handleAdd"
          >
            添加次数
          </Button>
          <Button
            v-if="hasAccessByCodes(['eim:license:adjust'])"
            @click="handleAdjust"
          >
            调整次数
          </Button>
          <Button
            v-if="hasAccessByCodes(['eim:license:status'])"
            :danger="license?.status === '0'"
            @click="handleToggleStatus"
          >
            {{ license?.status === '0' ? '停用' : '启用' }}
          </Button>
        </a-space>
      </div>
    </Card>

    <!-- 4 张渐变统计卡片 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        :body-style="{ padding: '20px 24px' }"
        :loading="loading"
        class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        :style="{
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        }"
      >
        <Statistic
          :value="license?.totalQuota ?? 0"
          :value-style="{ color: '#fff', fontSize: '28px', fontWeight: 600 }"
        >
          <template #title>
            <span class="text-white/80">累计添加次数</span>
          </template>
        </Statistic>
      </Card>

      <Card
        :body-style="{ padding: '20px 24px' }"
        :loading="loading"
        class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        :style="{
          background:
            'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: '#fff',
        }"
      >
        <Statistic
          :value="license?.usedQuota ?? 0"
          :value-style="{ color: '#fff', fontSize: '28px', fontWeight: 600 }"
        >
          <template #title>
            <span class="text-white/80">已确认扣减</span>
          </template>
        </Statistic>
      </Card>

      <Card
        :body-style="{ padding: '20px 24px' }"
        :loading="loading"
        class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        :style="{
          background:
            'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
          color: '#fff',
        }"
      >
        <Statistic
          :value="license?.frozenQuota ?? 0"
          :value-style="{ color: '#fff', fontSize: '28px', fontWeight: 600 }"
        >
          <template #title>
            <span class="text-white/80">冻结中次数</span>
          </template>
        </Statistic>
      </Card>

      <Card
        :body-style="{ padding: '20px 24px' }"
        :loading="loading"
        class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        :style="{
          background:
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: '#fff',
        }"
      >
        <Statistic
          :value="license?.availableQuota ?? 0"
          :value-style="{ color: '#fff', fontSize: '32px', fontWeight: 700 }"
        >
          <template #title>
            <span class="text-white/90 font-semibold">可用次数</span>
          </template>
        </Statistic>
      </Card>
    </div>

    <!-- 备注 -->
    <Card
      v-if="license?.remark"
      :body-style="{ padding: '12px 16px' }"
      class="mt-4 shadow-sm"
      title="备注"
      size="small"
    >
      <p class="m-0 text-sm text-gray-600">{{ license.remark }}</p>
    </Card>

    <AddModal @reload="loadLicense(selectedTenantId)" />
    <AdjustModal @reload="loadLicense(selectedTenantId)" />
  </Page>
</template>
```

- [ ] **Step 3.3：暂不提交（与 Modal 一起提交）**

---

## Task 4：添加次数弹窗（LicenseAddModal）

**Files:**
- Create: `apps/web-antd/src/views/license/license-add-modal.vue`

- [ ] **Step 4.1：创建弹窗组件**

创建 `apps/web-antd/src/views/license/license-add-modal.vue`：

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { addLicense } from '#/api/system/license';

const emit = defineEmits<{ reload: [] }>();

const tenantId = ref<string>('');

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 100,
  },
  schema: [
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
        max: 1_000_000,
        step: 100,
        precision: 0,
        style: 'width: 100%',
        placeholder: '请输入添加次数',
      },
      fieldName: 'quota',
      label: '添加次数',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '可填写本次添加的业务说明，便于后续追溯',
      },
      fieldName: 'remark',
      label: '备注',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => formApi.resetForm(),
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { tenantId: string };
    tenantId.value = data.tenantId;
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    await addLicense({
      tenantId: tenantId.value,
      quota: values.quota,
      remark: values.remark,
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
  <BasicModal title="添加 License 次数" class="w-[480px]">
    <div class="mb-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
      新增的次数会立即追加到该租户的可用次数中，并生成一条变更流水。
    </div>
    <BasicForm />
  </BasicModal>
</template>
```

---

## Task 5：调整次数弹窗（LicenseAdjustModal）

**Files:**
- Create: `apps/web-antd/src/views/license/license-adjust-modal.vue`

调整次数支持正负值（正数加、负数减），增加视觉提示帮助理解。

- [ ] **Step 5.1：创建弹窗组件**

创建 `apps/web-antd/src/views/license/license-adjust-modal.vue`：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { adjustLicense } from '#/api/system/license';

const emit = defineEmits<{ reload: [] }>();

const tenantId = ref<string>('');
const currentQuota = ref<number>(0);
const previewDelta = ref<number | undefined>(undefined);

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 100,
  },
  schema: [
    {
      component: 'InputNumber',
      componentProps: {
        step: 100,
        precision: 0,
        style: 'width: 100%',
        placeholder: '正数为增加，负数为扣减',
        onChange: (val: number) => {
          previewDelta.value = val;
        },
      },
      fieldName: 'delta',
      label: '调整数量',
      rules: 'required',
      help: '正数为增加，负数为扣减（如：-100 表示扣减 100 次）',
    },
    {
      component: 'Textarea',
      componentProps: {
        maxlength: 200,
        showCount: true,
        rows: 3,
        placeholder: '请说明调整原因',
      },
      fieldName: 'remark',
      label: '备注',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => {
    formApi.resetForm();
    previewDelta.value = undefined;
  },
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    const data = modalApi.getData() as { tenantId: string; current: number };
    tenantId.value = data.tenantId;
    currentQuota.value = data.current;
  },
});

const previewResult = computed(() => {
  if (previewDelta.value === undefined || previewDelta.value === null) {
    return null;
  }
  return currentQuota.value + previewDelta.value;
});

const previewClass = computed(() => {
  if (previewDelta.value === undefined || previewDelta.value === null) {
    return 'text-gray-500';
  }
  return previewDelta.value > 0 ? 'text-emerald-600' : 'text-rose-600';
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = cloneDeep(await formApi.getValues());
    await adjustLicense({
      tenantId: tenantId.value,
      delta: values.delta,
      remark: values.remark,
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
  <BasicModal title="调整 License 次数" class="w-[480px]">
    <div class="mb-3 grid grid-cols-3 gap-2 rounded bg-gray-50 p-3 dark:bg-gray-800/40">
      <div class="text-center">
        <div class="text-xs text-gray-500">当前可用</div>
        <div class="text-lg font-semibold">{{ currentQuota }}</div>
      </div>
      <div class="flex items-center justify-center text-2xl text-gray-400">→</div>
      <div class="text-center">
        <div class="text-xs text-gray-500">调整后</div>
        <div :class="['text-lg', 'font-semibold', previewClass]">
          {{ previewResult ?? '--' }}
        </div>
      </div>
    </div>
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 5.2：提交主页 + 两个 Modal**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/views/license/index.vue \
        apps/web-antd/src/views/license/data.tsx \
        apps/web-antd/src/views/license/license-add-modal.vue \
        apps/web-antd/src/views/license/license-adjust-modal.vue
git commit -m "feat(license): add balance page with gradient cards and modals"
```

---

## Task 6：变更流水页（LicenseRecord）

**Files:**
- Create: `apps/web-antd/src/views/license/license-record/data.tsx`
- Create: `apps/web-antd/src/views/license/license-record/index.vue`

- [ ] **Step 6.1：创建列定义**

创建 `apps/web-antd/src/views/license/license-record/data.tsx`：

```tsx
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useTenantStore } from '#/store/tenant';

const CHANGE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  ADD:      { color: 'blue',    text: '添加' },
  ADJUST:   { color: 'purple',  text: '调整' },
  FREEZE:   { color: 'orange',  text: '冻结' },
  CONFIRM:  { color: 'green',   text: '确认扣减' },
  RELEASE:  { color: 'cyan',    text: '释放' },
  EXPIRE:   { color: 'red',     text: '过期' },
};

export function getChangeTypeMeta(type: string) {
  return CHANGE_TYPE_MAP[type] ?? { color: 'default', text: type };
}

export const CHANGE_TYPE_OPTIONS = Object.entries(CHANGE_TYPE_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);

export const querySchema: FormSchemaGetter = () => {
  const tenantStore = useTenantStore();
  return [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择租户',
        options: tenantStore.tenantList.map((t) => ({
          label: t.companyName,
          value: t.tenantId,
        })),
      },
      fieldName: 'tenantId',
      label: '租户',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择变更类型',
        options: CHANGE_TYPE_OPTIONS,
      },
      fieldName: 'changeType',
      label: '变更类型',
    },
  ];
};

export const columns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 60 },
  { title: '租户ID', field: 'tenantId', width: 160 },
  {
    title: '变更类型',
    field: 'changeType',
    width: 110,
    slots: { default: 'changeType' },
  },
  {
    title: '变更数量',
    field: 'changeQuota',
    width: 110,
    slots: { default: 'changeQuota' },
  },
  { title: '变更前可用', field: 'beforeAvailable', width: 110 },
  { title: '变更后可用', field: 'afterAvailable', width: 110 },
  { title: '业务类型', field: 'bizType', width: 100 },
  { title: '业务ID', field: 'bizId', width: 140 },
  { title: '操作人', field: 'operatorName', width: 110 },
  { title: '备注', field: 'remark', minWidth: 160, showOverflow: true },
  { title: '变更时间', field: 'createTime', width: 170 },
];
```

- [ ] **Step 6.2：创建变更流水页**

创建 `apps/web-antd/src/views/license/license-record/index.vue`：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { licenseRecordList } from '#/api/system/license';

import { columns, getChangeTypeMeta, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
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
        return await licenseRecordList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'license-record-index',
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="License 变更流水">
      <template #changeType="{ row }">
        <Tag :color="getChangeTypeMeta(row.changeType).color">
          {{ getChangeTypeMeta(row.changeType).text }}
        </Tag>
      </template>
      <template #changeQuota="{ row }">
        <span
          :class="
            row.changeQuota > 0
              ? 'text-emerald-600 font-semibold'
              : 'text-rose-600 font-semibold'
          "
        >
          {{ row.changeQuota > 0 ? '+' : '' }}{{ row.changeQuota }}
        </span>
      </template>
    </BasicTable>
  </Page>
</template>
```

- [ ] **Step 6.3：提交**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/views/license/license-record/
git commit -m "feat(license): add change record page with colored badges"
```

---

## Task 7：冻结记录页（LicenseFreeze）

**Files:**
- Create: `apps/web-antd/src/views/license/license-freeze/data.tsx`
- Create: `apps/web-antd/src/views/license/license-freeze/index.vue`

- [ ] **Step 7.1：创建列定义**

创建 `apps/web-antd/src/views/license/license-freeze/data.tsx`：

```tsx
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useTenantStore } from '#/store/tenant';

const FREEZE_STATUS_MAP: Record<string, { color: string; text: string }> = {
  FROZEN:    { color: 'orange', text: '冻结中' },
  CONFIRMED: { color: 'green',  text: '已确认扣减' },
  RELEASED:  { color: 'blue',   text: '已释放' },
  EXPIRED:   { color: 'red',    text: '已过期' },
};

export function getFreezeStatusMeta(status: string) {
  return FREEZE_STATUS_MAP[status] ?? { color: 'default', text: status };
}

export const FREEZE_STATUS_OPTIONS = Object.entries(FREEZE_STATUS_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);

export const querySchema: FormSchemaGetter = () => {
  const tenantStore = useTenantStore();
  return [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择租户',
        options: tenantStore.tenantList.map((t) => ({
          label: t.companyName,
          value: t.tenantId,
        })),
      },
      fieldName: 'tenantId',
      label: '租户',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择状态',
        options: FREEZE_STATUS_OPTIONS,
      },
      fieldName: 'status',
      label: '冻结状态',
    },
  ];
};

export const columns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 60 },
  { title: '租户ID', field: 'tenantId', width: 160 },
  { title: '任务ID', field: 'taskId', width: 180, showOverflow: true },
  { title: 'Profile ID', field: 'profileId', width: 140, showOverflow: true },
  { title: 'ICCID', field: 'iccid', width: 180 },
  { title: '冻结额度', field: 'freezeQuota', width: 100 },
  {
    title: '状态',
    field: 'status',
    width: 110,
    slots: { default: 'status' },
  },
  { title: '冻结时间', field: 'freezeTime', width: 170 },
  { title: '确认时间', field: 'confirmTime', width: 170 },
  { title: '释放时间', field: 'releaseTime', width: 170 },
  { title: '过期时间', field: 'expireTime', width: 170 },
  { title: '备注', field: 'remark', minWidth: 140, showOverflow: true },
];
```

- [ ] **Step 7.2：创建冻结记录页**

创建 `apps/web-antd/src/views/license/license-freeze/index.vue`：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { licenseFreezeList } from '#/api/system/license';

import { columns, getFreezeStatusMeta, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
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
        return await licenseFreezeList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'license-freeze-index',
};

const [BasicTable] = useVbenVxeGrid({ formOptions, gridOptions });
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="License 冻结记录">
      <template #status="{ row }">
        <Tag :color="getFreezeStatusMeta(row.status).color">
          {{ getFreezeStatusMeta(row.status).text }}
        </Tag>
      </template>
    </BasicTable>
  </Page>
</template>
```

- [ ] **Step 7.3：提交**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/views/license/license-freeze/
git commit -m "feat(license): add freeze record page"
```

---

## Task 8：租户列表集成 License 入口

**Files:**
- Modify: `apps/web-antd/src/views/system/tenant/index.vue`

在租户列表操作列追加 `License详情` 和 `调整License` 两个按钮。

- [ ] **Step 8.1：修改租户页 — 引入依赖**

修改 `apps/web-antd/src/views/system/tenant/index.vue`，在脚本头部已有的 import 后面追加：

找到现有代码：

```ts
import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  dictSyncTenant,
  syncTenantConfig,
  tenantExport,
  tenantList,
  tenantRemove,
  tenantStatusChange,
  tenantSyncPackage,
} from '#/api/system/tenant';
```

在其下方插入：

```ts
import { useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import LicenseAdjustModal from '#/views/license/license-adjust-modal.vue';
```

- [ ] **Step 8.2：注册 Modal + Router**

找到现有 `const [TenantDrawer, drawerApi] = useVbenDrawer({...})` 一行下方插入：

```ts
const router = useRouter();

const [LicenseAdjustModalCmp, licenseAdjustApi] = useVbenModal({
  connectedComponent: LicenseAdjustModal,
});

function handleViewLicense(record: Tenant) {
  router.push({
    path: '/license/balance',
    query: { tenantId: record.tenantId },
  });
}

function handleAdjustLicense(record: Tenant) {
  licenseAdjustApi.setData({
    tenantId: record.tenantId,
    current: 0,
  });
  licenseAdjustApi.open();
}
```

- [ ] **Step 8.3：在模板操作列中加入按钮**

找到模板中的 `<template #action="{ row }">` 区块，在 `<Space v-if="row.id !== 1">` 内、`<action-button v-access:code="['system:tenant:edit']" @click="handleEdit(row)">` 前面插入：

```vue
<action-button
  v-access:code="['eim:license:query']"
  variant="link"
  color="purple"
  @click="handleViewLicense(row)"
>
  License详情
</action-button>
<action-button
  v-access:code="['eim:license:adjust']"
  variant="link"
  color="orange"
  @click="handleAdjustLicense(row)"
>
  调整License
</action-button>
```

并在模板末尾的 `<TenantDrawer @reload="tableApi.query()" />` 后追加：

```vue
<LicenseAdjustModalCmp @reload="tableApi.query()" />
```

- [ ] **Step 8.4：处理路由 query 默认选中租户**

修改 `apps/web-antd/src/views/license/index.vue` 的 `onMounted`，让它先读取路由 query：

找到：

```ts
import { computed, onMounted, ref, watch } from 'vue';
```

改为：

```ts
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
```

在脚本中部（`const tenantStore = useTenantStore();` 之后）加入：

```ts
const route = useRoute();
```

把 `onMounted` 改为：

```ts
onMounted(async () => {
  if (tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
  const queryTenantId = route.query.tenantId as string | undefined;
  if (
    queryTenantId &&
    tenantStore.tenantList.some((t) => t.tenantId === queryTenantId)
  ) {
    selectedTenantId.value = queryTenantId;
  } else {
    const first = tenantStore.tenantList[0];
    if (first) selectedTenantId.value = first.tenantId;
  }
});
```

- [ ] **Step 8.5：提交**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/views/system/tenant/index.vue \
        apps/web-antd/src/views/license/index.vue \
        apps/web-antd/src/router/routes/modules/eim.ts
git commit -m "feat(license): integrate license entry into tenant list and add menu route"
```

---

## Task 9：端到端冒烟测试

启动 dev 服务，手动验证主要交互。

- [ ] **Step 9.1：启动开发服务**

```bash
cd d:/Project/esim.eim.web && pnpm dev:antd
```

等待输出 `Local: http://localhost:5666/` 或类似端口号。

- [ ] **Step 9.2：访问页面**

浏览器打开：

| URL | 期望 |
|---|---|
| `http://localhost:5666/license/balance` | 看到顶部租户选择 + 4 张渐变卡片 + 状态徽章 |
| `http://localhost:5666/license/record` | 看到搜索表单 + 流水表格，变更类型为彩色 Tag，数量正负带色 |
| `http://localhost:5666/license/freeze` | 看到搜索表单 + 冻结表格，状态为彩色 Tag |
| 系统管理→租户管理 | 操作列出现紫色"License详情"和橙色"调整License" |

- [ ] **Step 9.3：交互验证清单**

- [ ] 余额页切换租户 → 4 张卡片数字刷新
- [ ] 点击"添加次数" → 弹窗输入数字 → 保存后卡片刷新
- [ ] 点击"调整次数" → 输入正/负数时下方预览数字变色（绿/红）
- [ ] 点击"停用/启用" → 弹确认 → 状态徽章切换
- [ ] 租户列表点击"License详情" → 跳转到 `/license/balance?tenantId=xxx` 且对应租户被选中
- [ ] 租户列表点击"调整License" → 直接弹出调整弹窗
- [ ] 三个页面都能在窄屏（< 768px）下正常折行展示

- [ ] **Step 9.4：类型 + lint 检查**

```bash
cd d:/Project/esim.eim.web && pnpm -F @vben/web-antd run typecheck 2>&1 | tail -30
```

Expected：无 license 相关的类型错误。

```bash
cd d:/Project/esim.eim.web && pnpm lint 2>&1 | tail -30
```

Expected：无 license 相关的 lint 错误（warnings 可忽略）。

如果有错误：

1. 类型问题 → 回到对应 Task 检查类型定义
2. 文件不存在 → 检查路径是否正确
3. import 错误 → 检查 `#/` alias 是否生效

- [ ] **Step 9.5：最终提交（如有修复）**

```bash
cd d:/Project/esim.eim.web
git status
# 如有未提交的修复
git add -A
git commit -m "fix(license): adjust types and imports based on lint"
```

---

## 完成标准

- [ ] License API 层 6 个函数全部可调通
- [ ] 余额查询页 4 张渐变卡片正常显示
- [ ] 添加/调整次数弹窗工作正常，操作后余额刷新
- [ ] 变更流水页带彩色变更类型徽章、正负数量带色
- [ ] 冻结记录页带彩色状态徽章
- [ ] 租户列表"License详情"/"调整License"入口生效
- [ ] 菜单路由可访问，从侧栏可导航到三个子页面
- [ ] typecheck 通过、lint 无 license 模块新增错误

---

## 后续依赖

P1 完成后请用户验收：
1. 视觉是否满意
2. 是否需要后端补充菜单 SQL（前端 mock 路由后期会移除）
3. 是否需要 `eim_license_change_type` / `eim_license_freeze_status` 字典 SQL 协同入库

确认后再进入 P2（APN 优化）的 plan 撰写。
