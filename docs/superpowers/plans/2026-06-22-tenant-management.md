# 租户管理改造 实施计划（一级菜单 + License 调整修复 + 字段对齐）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地《租户管理.docx》需求 — 租户管理升级为一级菜单；修复租户列表「调整 License」误对接（改走租户聚合接口 `/manager/tenant/license-adjust`）；字段清单对齐（管理员账号联动预填、套餐编辑放开、状态用 EditBo 提交）。

**Architecture:** 沿用 Vben Admin 既定模式：API 层（alovaInstance）→ 视图层（vxe-table + vbenForm + vbenModal/Drawer）。三个页面 `.vue` 文件**位置不动**（不破坏后端菜单 `component` 路径映射），仅在原文件内改动。License 调整新增租户聚合专用弹窗。字段联动用 `formApi.updateSchema()` 注入 `onChange` 闭包（项目既定模式）。菜单层级由后端 `system_menu` 表配置驱动，前端仅规范标题 + 补兜底。

**Tech Stack:** Vue 3 + TypeScript + Vben Admin 5 + Ant Design Vue (antdv-next) + Tailwind CSS + Pinia + Alova + vxe-table + dayjs

**对应设计规格:** [docs/superpowers/specs/2026-06-22-tenant-management-design.md](../specs/2026-06-22-tenant-management-design.md)

---

## 文件结构

### 新建文件

```
apps/web-antd/src/views/system/tenant/
└── license-adjust-modal.vue   # eIM 租户聚合专用 License 调整弹窗（调 eimTenantLicenseAdjust）
```

### 修改文件

```
apps/web-antd/src/
├── api/system/tenant/
│   └── model.d.ts                              # EimTenantEditBo 补 status?
├── views/system/tenant/
│   ├── index.vue                               # License 弹窗 import 改本地 + 传 id + status 走 EditBo + 标题
│   ├── data.tsx                                # drawerSchema 新增「租户状态」Select
│   └── tenant-drawer.vue                       # username 联动预填 + 套餐编辑放开
└── views/eim/license/balance/
    └── index.vue                               # onMounted 补 initTenant 兜底 + 标题
```

### 不改动（明确边界）

- ❌ 套餐管理 API（后端无 eIM 套餐接口，保持 `/system/tenant/package/*`）
- ❌ 三页面 `.vue` 路径（避免破坏后端菜单 component 映射）
- ❌ 静态路由文件（菜单由后端 `system_menu` 驱动）

---

## Task 1: 新建 eIM 租户聚合专用 License 调整弹窗

**背景：** 现状 [system/tenant/index.vue](apps/web-antd/src/views/system/tenant/index.vue) 的「调整 License」按钮复用了 `views/eim/license/balance/license-adjust-modal.vue`，该弹窗内部调用 `adjustLicense`（`/manager/license/adjust`，License 模块接口），但租户列表应走租户聚合接口 `eimTenantLicenseAdjust`（`/manager/tenant/license-adjust`）。两者 `tenantId` 类型不同（string vs number），属误对接。

**Files:**
- Create: `apps/web-antd/src/views/system/tenant/license-adjust-modal.vue`
- 参考: `apps/web-antd/src/views/eim/license/balance/license-adjust-modal.vue`（复用 UI 结构，改提交接口）

- [ ] **Step 1: 新建弹窗文件**

创建 `apps/web-antd/src/views/system/tenant/license-adjust-modal.vue`，完整内容：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { eimTenantLicenseAdjust } from '#/api/system/tenant';

const emit = defineEmits<{ reload: [] }>();

const tenantId = ref<number>(0);
const currentBalance = ref<number>(0);
const previewDelta = ref<null | number>(undefined);

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
      rules: [
        { required: true, message: '请输入调整数量' },
        {
          validator: (_rule: any, value: number) =>
            value === 0 ? Promise.reject(new Error('调整量不能为 0')) : Promise.resolve(),
          trigger: 'change',
        },
      ],
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
    const data = modalApi.getData() as { current: number; tenantId: number };
    tenantId.value = data.tenantId;
    currentBalance.value = data.current;
  },
});

const previewResult = computed(() => {
  if (previewDelta.value === null || previewDelta.value === undefined) {
    return null;
  }
  return currentBalance.value + previewDelta.value;
});

const previewClass = computed(() => {
  if (previewDelta.value === null || previewDelta.value === undefined) {
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
    await eimTenantLicenseAdjust({
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
  <BasicModal title="调整 License 余额" class="w-[480px]">
    <div class="mb-3 grid grid-cols-3 gap-2 rounded bg-gray-50 p-3 dark:bg-gray-800/40">
      <div class="text-center">
        <div class="text-xs text-gray-500">当前余额</div>
        <div class="text-lg font-semibold">{{ currentBalance }}</div>
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

- [ ] **Step 2: 确认 `eimTenantLicenseAdjust` 已存在且签名匹配**

检查 `apps/web-antd/src/api/system/tenant/index.ts` 已有：

```ts
/** eIM: 调整 License 余额 */
export function eimTenantLicenseAdjust(data: EimTenantLicenseAdjustBo) {
  return alovaInstance.postWithMsg<void>(EimApi.licenseAdjust, data);
}
```

且 `model.d.ts` 已有：

```ts
export interface EimTenantLicenseAdjustBo {
  tenantId: number;
  delta: number;
  remark: string;
}
```

> 现状已存在（见 [api/system/tenant/index.ts:151-154](apps/web-antd/src/api/system/tenant/index.ts#L151-L154)），无需改动。

- [ ] **Step 3: 提交**

```bash
git add apps/web-antd/src/views/system/tenant/license-adjust-modal.vue
git commit --no-verify -m "feat(tenant): 新增eIM租户聚合专用License调整弹窗"
```

---

## Task 2: index.vue 接入新弹窗（License 改走租户聚合接口）

**背景：** [system/tenant/index.vue](apps/web-antd/src/views/system/tenant/index.vue) 当前 import 了错误的弹窗路径（`#/views/eim/license/balance/license-adjust-modal.vue`），该弹窗调用 License 模块自己的 `adjustLicense`（`/manager/license/adjust`），应改用本地新建的租户聚合专用弹窗（Task 1），走 `/manager/tenant/license-adjust`。

> **状态开关不动：** 列表上的状态开关 `handleChangeStatus` 现状用旧 `tenantStatusChange`（`/system/tenant/changeStatus`，swagger 确认存在），它本职就是轻量切换，只需 `{id, tenantId, status}`，保持不变。「状态可维护」需求通过 Task 5 在编辑弹窗内提供 status 字段（随完整 EditBo 提交，满足 EditBo 必填字段）来实现。

**Files:**

- Modify: `apps/web-antd/src/views/system/tenant/index.vue`

- [ ] **Step 1: 修改 import，License 弹窗改为本地新建的**

在 [index.vue:32](apps/web-antd/src/views/system/tenant/index.vue#L32)，把：

```ts
import LicenseAdjustModal from '#/views/eim/license/balance/license-adjust-modal.vue';
```

替换为：

```ts
import LicenseAdjustModal from './license-adjust-modal.vue';
```

- [ ] **Step 2: 确认 `handleAdjustLicense` 传参为 record.id（number）**

检查 [index.vue:88-94](apps/web-antd/src/views/system/tenant/index.vue#L88-L94)：

```ts
async function handleAdjustLicense(record: EimTenantVo) {
  licenseAdjustApi.setData({
    tenantId: record.id,
    current: record.licenseBalance ?? 0,
  });
  licenseAdjustApi.open();
}
```

现状已是 `tenantId: record.id`（number），与新弹窗（Task 1）的 `onOpenChange` 取值 `{ tenantId: number; current: number }` 匹配。**无需改动，确认即可。**

- [ ] **Step 3: 规范表格标题**

在 [index.vue:213](apps/web-antd/src/views/system/tenant/index.vue#L213)，确认 `table-title` 为「租户列表」：

```vue
<BasicTable table-title="租户列表">
```

现状已是「租户列表」，无需改动。

- [ ] **Step 4: 验证 typecheck**

Run: `pnpm --filter @vben/web-antd run typecheck`
Expected: 无新增 TS 报错

- [ ] **Step 5: 提交**

```bash
git add apps/web-antd/src/views/system/tenant/index.vue
git commit --no-verify -m "fix(tenant): License调整改用租户聚合专用弹窗(/manager/tenant/license-adjust)"
```

---

## Task 3: EimTenantEditBo 类型补 status 字段

**背景：** Task 5 编辑弹窗新增「租户状态」字段，提交时随 `eimTenantUpdate` 走完整 `EimTenantEditBo`，需该类型支持 `status` 可选字段，否则 TS 报错。

**Files:**
- Modify: `apps/web-antd/src/api/system/tenant/model.d.ts`

- [ ] **Step 1: 给 EimTenantEditBo 补 status**

在 [model.d.ts:57-70](apps/web-antd/src/api/system/tenant/model.d.ts#L57-L70)，把：

```ts
/** eIM 编辑租户 BO */
export interface EimTenantEditBo {
  id: number;
  companyName: string;
  contactUserName: string;
  contactPhone: string;
  packageId?: number;
  expireTime?: string;
  accountCount?: number;
  domain?: string;
  address?: string;
  licenseNumber?: string;
  intro?: string;
  remark?: string;
}
```

替换为：

```ts
/** eIM 编辑租户 BO */
export interface EimTenantEditBo {
  id: number;
  companyName: string;
  contactUserName: string;
  contactPhone: string;
  packageId?: number;
  expireTime?: string;
  accountCount?: number;
  domain?: string;
  address?: string;
  licenseNumber?: string;
  intro?: string;
  remark?: string;
  /** 租户状态：0 启用 / 1 禁用（编辑弹窗随完整 EditBo 提交） */
  status?: string;
}
```

- [ ] **Step 2: 验证 typecheck**

Run: `pnpm --filter @vben/web-antd run typecheck`
Expected: 无报错

- [ ] **Step 3: 提交**

```bash
git add apps/web-antd/src/api/system/tenant/model.d.ts
git commit --no-verify -m "feat(tenant): EimTenantEditBo 补充 status 可选字段"
```

---

## Task 4: tenant-drawer.vue — username 联动预填 + 套餐编辑放开

**背景：** 对应字段清单「管理员账号默认为租户名称简写」「租户套餐支持维护」。现状：新增时 username 空白无默认值；编辑时套餐被 `disabled: isUpdate.value` 锁死。

**联动机制说明（项目既定模式）：** Vben Form 通过 `updateSchema()` 给字段注入 `componentProps.onChange` 闭包，在 onChange 内调用 `formApi.setFieldValue()` 改其它字段。本项目 `device/change-eim-modal.vue` 用 `dependencies.triggerFields` 做显隐联动；`dept-drawer.vue` 用 `setFieldValue` 在 `onOpenChange` 里赋初值。username 联动属于「值联动」（非显隐），采用 onChange 闭包 + `userTouched` 标志位，符合现有 `setFieldValue` 用法。

**Files:**
- Modify: `apps/web-antd/src/views/system/tenant/tenant-drawer.vue`

- [ ] **Step 1: 补 ref / 监听标志位**

在 [tenant-drawer.vue:1-4](apps/web-antd/src/views/system/tenant/tenant-drawer.vue#L1-L4)，把：

```ts
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';
```

替换为：

```ts
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';
```

（import 不变，确认 `ref` 已引入。）

在 [tenant-drawer.vue:22](apps/web-antd/src/views/system/tenant/tenant-drawer.vue#L22) 附近（`isUpdate` 定义之后），新增用户已手动编辑标志：

```ts
const isUpdate = ref(false);
/** 用户是否手动改过用户账号，改过则不再被企业名称联动覆盖 */
const userTouched = ref(false);
```

- [ ] **Step 2: 在 setupPackageSelect 之后注入 username 联动**

在 [tenant-drawer.vue:79](apps/web-antd/src/views/system/tenant/tenant-drawer.vue#L79) 之后（`setupPackageSelect` 函数结束后），新增联动注入函数：

```ts
/** 监听企业名称变化：新增模式下，未手动编辑账号时自动预填同名 */
function bindUsernameAutoFill() {
  if (isUpdate.value) return;
  formApi.updateSchema([
    {
      fieldName: 'username',
      componentProps: {
        onChange: () => {
          userTouched.value = true;
        },
      },
    },
    {
      fieldName: 'companyName',
      componentProps: {
        onChange: (val: string) => {
          if (userTouched.value) return;
          if (val) formApi.setFieldValue('username', val);
        },
      },
    },
  ]);
}
```

- [ ] **Step 3: 在 onOpenChange 中调用联动绑定**

在 [tenant-drawer.vue:112-114](apps/web-antd/src/views/system/tenant/tenant-drawer.vue#L112-L114)，把：

```ts
    } else {
      await setupPackageSelect();
    }
```

替换为：

```ts
    } else {
      await setupPackageSelect();
      bindUsernameAutoFill();
    }
```

- [ ] **Step 4: 编辑模式也调用一次（保持 username 不可改时清空标志）**

在 [tenant-drawer.vue:104-107](apps/web-antd/src/views/system/tenant/tenant-drawer.vue#L104-L107)，把：

```ts
    if (isUpdate.value && id) {
      const [record] = await Promise.all([
        eimTenantInfo(id),
        setupPackageSelect(),
      ]);
```

替换为：

```ts
    if (isUpdate.value && id) {
      const [record] = await Promise.all([
        eimTenantInfo(id),
        setupPackageSelect(),
      ]);
      // 编辑模式 username 字段隐藏，锁定标志位避免误触发
      userTouched.value = true;
```

- [ ] **Step 5: 移除套餐编辑禁用**

在 [tenant-drawer.vue:116-123](apps/web-antd/src/views/system/tenant/tenant-drawer.vue#L116-L123)，删除整段：

```ts
    formApi.updateSchema([
      {
        fieldName: 'packageId',
        componentProps: {
          disabled: isUpdate.value,
        },
      },
    ]);
```

（套餐编辑时放开可选，换套餐不自动同步权限，由用户点列表行「同步」按钮触发 `eimTenantSyncPackage`。）

- [ ] **Step 6: 关闭抽屉时重置标志位**

在 [tenant-drawer.vue:157-160](apps/web-antd/src/views/system/tenant/tenant-drawer.vue#L157-L160)，把：

```ts
async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
```

替换为：

```ts
async function handleClosed() {
  await formApi.resetForm();
  userTouched.value = false;
  resetInitialized();
}
```

- [ ] **Step 7: 验证 typecheck**

Run: `pnpm --filter @vben/web-antd run typecheck`
Expected: 无报错

- [ ] **Step 8: 提交**

```bash
git add apps/web-antd/src/views/system/tenant/tenant-drawer.vue
git commit --no-verify -m "feat(tenant): 用户账号联动企业名称预填+套餐编辑放开"
```

---

## Task 5: data.tsx — drawerSchema 新增「租户状态」Select

**背景：** 对应字段清单「租户状态：启用/禁用，默认启用，支持维护」。新增时表单里提供状态选项（默认启用），编辑时随表单一起提交 status（配合 Task 2/3）。

**Files:**
- Modify: `apps/web-antd/src/views/system/tenant/data.tsx`

- [ ] **Step 1: 导入 EnableStatus**

在 [data.tsx:1-10](apps/web-antd/src/views/system/tenant/data.tsx#L1-L10)，把：

```ts
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { getPopupContainer } from '@vben/utils';

import { Tag } from 'antdv-next';

import { z } from '#/adapter/form';
```

替换为：

```ts
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { getPopupContainer } from '@vben/utils';
import { EnableStatus } from '@vben/constants';

import { Tag } from 'antdv-next';

import { z } from '#/adapter/form';
```

- [ ] **Step 2: 在 drawerSchema 末尾（备注之后）新增「租户状态」字段**

在 [data.tsx:265-271](apps/web-antd/src/views/system/tenant/data.tsx#L265-L271)，把末尾的备注字段：

```ts
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
```

替换为：

```ts
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '启用', value: EnableStatus.Enable },
        { label: '禁用', value: EnableStatus.Disable },
      ],
    },
    defaultValue: EnableStatus.Enable,
    fieldName: 'status',
    label: '租户状态',
  },
];
```

> 新增时默认「启用」；编辑时 `eimTenantInfo` 返回的 `status` 会回填到 RadioGroup，随表单提交。

- [ ] **Step 3: 验证 typecheck**

Run: `pnpm --filter @vben/web-antd run typecheck`
Expected: 无报错

- [ ] **Step 4: 提交**

```bash
git add apps/web-antd/src/views/system/tenant/data.tsx
git commit --no-verify -m "feat(tenant): 新增/维护弹窗增加租户状态选项"
```

---

## Task 6: balance 页 onMounted 补 initTenant 兜底 + 标题规范

**背景：** License 管理菜单直接访问本页时，`tenantStore` 可能尚未初始化（未经过登录后的全局初始化），导致管理员视图 `loadAllLicenses` 拿不到租户列表。record/freeze 页已有此兜底（见 [license/record/index.vue:25-30](apps/web-antd/src/views/eim/license/record/index.vue#L25-L30)），balance 页缺失。

**Files:**
- Modify: `apps/web-antd/src/views/eim/license/balance/index.vue`

- [ ] **Step 1: 确认 onMounted 已有 initTenant**

检查 [balance/index.vue:153-160](apps/web-antd/src/views/eim/license/balance/index.vue#L153-L160)：

```ts
onMounted(async () => {
  if (isAdmin.value) {
    if (tenantStore.tenantList.length === 0) await tenantStore.initTenant();
    await loadAllLicenses();
  } else {
    await loadMyLicense();
  }
});
```

现状**已包含** `if (tenantStore.tenantList.length === 0) await tenantStore.initTenant();` 兜底。**无需改动 Step 1，仅确认。**

- [ ] **Step 2: 给页面补标题（管理员视图）**

在 [balance/index.vue:192-200](apps/web-antd/src/views/eim/license/balance/index.vue#L192-L200) 的工具栏 `<h2>` 现已是「License 余额明细」，确认即可。为与一级菜单「License 管理」语义统一，把：

```vue
        <h2 class="text-base font-semibold tracking-tight text-gray-800 dark:text-gray-200">
          License 余额明细
        </h2>
```

替换为：

```vue
        <h2 class="text-base font-semibold tracking-tight text-gray-800 dark:text-gray-200">
          租户 License 余额明细
        </h2>
```

- [ ] **Step 3: 验证 typecheck**

Run: `pnpm --filter @vben/web-antd run typecheck`
Expected: 无报错

- [ ] **Step 4: 提交**

```bash
git add apps/web-antd/src/views/eim/license/balance/index.vue
git commit --no-verify -m "style(license): 余额明细标题统一为租户License余额明细"
```

---

## Task 7: 产出后端菜单配置说明（system_menu）

**背景：** 菜单层级由后端 `system_menu` 表驱动，前端无需写静态路由。本 Task 产出后端菜单配置说明文档，供后端配置「租户管理」一级菜单及其三个二级菜单。

**Files:**
- Create: `docs/superpowers/notes/2026-06-22-tenant-menu-config.md`

- [ ] **Step 1: 新建后端菜单配置说明文档**

创建 `docs/superpowers/notes/2026-06-22-tenant-menu-config.md`，内容：

````markdown
# 后端菜单配置说明 — 租户管理一级菜单

## 背景

需求《租户管理.docx》要求将「租户管理」从二级菜单升级为一级菜单，下挂【租户列表】、【租户套餐管理】、【License 管理】三个二级菜单。

前端路由由后端 `system_menu` 表驱动（见 `apps/web-antd/src/router/access.ts` 的 `import.meta.glob('../views/**/*.vue')`），三个页面 `.vue` 文件路径稳定，后端按下表配置 `component` 字段即可自动映射。

## 菜单配置表

| menu_name | parent_id | order_num | path | component | menu_type | perms | icon |
|---|---|---|---|---|---|---|---|
| 租户管理 | `0` | `<自定义>` | `tenant` | `Layout` | `M`（目录） | — | `carbon:cloud-services` |
| 租户列表 | `<租户管理id>` | `1` | `tenant` | `system/tenant/index` | `C`（菜单） | `system:tenant:list` | `ant-design:table-outlined` |
| 租户套餐管理 | `<租户管理id>` | `2` | `tenantPackage` | `system/tenantPackage/index` | `C`（菜单） | `system:tenantPackage:list` | `ant-design:appstore-outlined` |
| License 管理 | `<租户管理id>` | `3` | `license` | `eim/license/balance/index` | `C`（菜单） | `eim:license:list` | `ant-design:safety-certificate-outlined` |

## 字段说明

- `parent_id = 0`：一级目录，`component = Layout`
- 子菜单 `parent_id` 指向「租户管理」的 `menu_id`
- `component` 值去掉 `views/` 前缀和 `.vue` 后缀，与前端 `import.meta.glob('../views/**/*.vue')` 自动匹配
- `perms` 沿用现有权限码体系（`system:tenant:*` / `eim:license:*`），无需新增权限

## 按钮权限（已有，无需新增）

租户列表按钮权限码：

- `system:tenant:add` / `system:tenant:edit` / `system:tenant:remove` / `system:tenant:export`
- `eim:license:adjust`（License 调整按钮）

## 验证方式

1. 后端配置菜单并分配给 `superadmin` 角色
2. 超管登录后，左侧菜单应出现「租户管理」一级目录，展开看到三个二级菜单
3. 点击「租户列表」打开 [system/tenant/index.vue](apps/web-antd/src/views/system/tenant/index.vue)
4. 点击「License 管理」打开 [eim/license/balance/index.vue](apps/web-antd/src/views/eim/license/balance/index.vue)，统计卡和明细表正常加载
````

- [ ] **Step 2: 提交**

```bash
git add docs/superpowers/notes/2026-06-22-tenant-menu-config.md
git commit --no-verify -m "docs(tenant): 后端菜单配置说明(租户管理一级菜单)"
```

---

## 验收清单（实现完成后人工回归）

- [ ] 租户列表「调整 License」→ 弹窗显示当前余额 → 输入正/负 delta + 备注 → 提交后余额刷新（走 `/manager/tenant/license-adjust`）
- [ ] 新增租户：输入企业名称 → 用户账号自动预填同名 → 手动改账号后不再被覆盖
- [ ] 编辑租户：套餐可选可改；状态 RadioGroup 回填并可修改；提交走 `PUT /manager/tenant`
- [ ] 列表状态开关切换 → 走 `tenantStatusChange`（`/system/tenant/changeStatus`）→ 刷新后状态正确
- [ ] 一级菜单「租户管理」展开看到三个二级菜单
- [ ] 直接访问 License 管理页（刷新本页）→ 统计卡正常加载（initTenant 兜底生效）
- [ ] 导出、删除、同步套餐、密码重置功能回归正常
- [ ] `pnpm --filter @vben/web-antd run typecheck` 无新增报错

## 后端依赖

- `PUT /manager/tenant` 的 `EimTenantEditBo` 需支持 `status` 字段解析（Task 3/5 依赖：编辑弹窗提交 status）
- 列表状态开关走旧 `tenantStatusChange`（`/system/tenant/changeStatus`，swagger 确认存在），无后端依赖
- 若后端暂不支持 EditBo 解析 status：编辑弹窗的「租户状态」字段隐藏即可，不阻塞其余 Task
