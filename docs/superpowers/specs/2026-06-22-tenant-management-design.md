# 租户管理改造设计规格（一级菜单 + License 调整修复 + 字段对齐）

## 背景

需求文档 `租户管理.docx` 要求：

1. 将「租户管理」从二级菜单升级为**一级菜单**，下挂【租户列表】、【租户套餐管理】、【License 管理】三个二级菜单。
2. 租户列表新增 / 维护弹窗的字段需与《字段清单》逐项对齐（含管理员账号默认值、套餐可维护、状态可维护）。
3. License 调整操作按钮弹窗「显示当前余额，可输入新增量」。

当前实现存在三处偏差：

- **License 调整接口误对接**：[system/tenant/index.vue](apps/web-antd/src/views/system/tenant/index.vue) 的「调整 License」按钮复用了 `views/eim/license/balance/license-adjust-modal.vue`，该弹窗内部调用 `adjustLicense`（`/manager/license/adjust`，License 模块自己的接口），但租户列表应走租户聚合接口 `eimTenantLicenseAdjust`（`/manager/tenant/license-adjust`）。两者 `tenantId` 类型不同（string vs number），属于误对接。
- **字段清单未对齐**：管理员账号无默认值；编辑时套餐被禁用；状态切换走旧接口且不在维护弹窗内。
- **菜单层级**：三页面位置分散、标题不统一、`balance` 页直接访问时缺少 `tenantStore` 兜底。

## 澄清结论（已与需求方确认）

| 议题 | 结论 |
|---|---|
| License 调整语义 | 支持增加 + 扣减（正负 delta）+ 备注 |
| 状态切换对接 | 用 `EimTenantEditBo` 提交 `status`（后端依赖项，见下「后端依赖」） |
| License 管理菜单指向 | 现有 `eim/license/balance/index.vue` |
| 管理员账号默认值 | 预填 = 租户名称（`companyName` 联动） |
| 套餐管理接口 | 后端无 eIM 套餐接口，保持 `/system/tenant/package/*`，仅纳入一级菜单 |

## 方案选择

**采用方案 A：原地修复 + eIM 专用 License 弹窗。**

三个页面 `.vue` 文件**位置不动**（不破坏后端菜单 `component` 路径映射），仅在原文件内做改动：

- 在 `views/system/tenant/` 下新增专用 `license-adjust-modal.vue`
- 修正 `index.vue` 的 import 与传参
- 对齐 `data.tsx` / `tenant-drawer.vue` 字段
- 菜单层级：规范化标题 + 补 `balance` 页兜底 + 产出后端菜单配置说明

不采用「迁移到 `views/eim/tenant/`」（方案 B），因为会破坏后端菜单 `component` 映射、改动面大、风险高。

## 改动范围

### 1. License 调整对接修复（新增专用弹窗）

**新增文件** `apps/web-antd/src/views/system/tenant/license-adjust-modal.vue`

复用现有 `eim/license/balance/license-adjust-modal.vue` 的 UI 结构（当前余额 → 调整后预览 + delta + remark 表单），但提交时调用租户聚合接口：

```ts
import { eimTenantLicenseAdjust } from '#/api/system/tenant';

// 打开时 setData
licenseAdjustApi.setData({
  tenantId: record.id,              // EimTenantVo.id (number)
  current: record.licenseBalance ?? 0,
});

// 提交
await eimTenantLicenseAdjust({
  tenantId: values.tenantId,        // number（EditBo 的 tenantId 是 sys_tenant.id）
  delta: values.delta,              // 正数增加，负数扣减
  remark: values.remark,
});
```

后端 BO 字段（来自 swagger `EimTenantLicenseAdjustBo`）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `tenantId` | int64 | 租户ID（`sys_tenant.id`） |
| `delta` | int32 | 调整量（正数增加，负数扣减） |
| `remark` | string | 备注（必填） |

**修改** `apps/web-antd/src/views/system/tenant/index.vue`：

- 删除 `import LicenseAdjustModal from '#/views/eim/license/balance/license-adjust-modal.vue'`
- 改为 `import LicenseAdjustModal from './license-adjust-modal.vue'`
- `handleAdjustLicense` 传参字段 `tenantId` 由 `record.tenantId`（string）改为 `record.id`（number），`current` 由 `record.licenseBalance` 提供
- 权限码沿用 `eim:license:adjust`

### 2. 字段清单对齐

#### 2.1 管理员账号联动预填（username = companyName）

**修改** `apps/web-antd/src/views/system/tenant/tenant-drawer.vue`，新增模式下监听 `companyName`：

```ts
const userTouchedUsername = ref(false);

watch(
  () => formApi.getValues().username,   // 用户手动改过则锁定
  () => { userTouchedUsername.value = true; },
);

watch(
  () => formApi.getValues().companyName,
  (name) => {
    if (isUpdate.value || userTouchedUsername.value) return;
    if (name) formApi.setFieldValue('username', name);
  },
);
```

> 仅新增模式生效；编辑模式 `username` 字段本就隐藏。用户一旦手动输入即停止覆盖。

#### 2.2 套餐编辑时放开

**修改** `tenant-drawer.vue`，删除 `onOpenChange` 中：

```ts
formApi.updateSchema([
  { fieldName: 'packageId', componentProps: { disabled: isUpdate.value } },
]);
```

改为始终可编辑。换套餐**不自动同步权限**，由用户点列表行「同步」按钮（对应需求⑥，`eimTenantSyncPackage`），使 ④维护（改套餐）与 ⑥同步（同步权限）职责分离。

#### 2.3 状态用 EditBo 提交

**修改** `apps/web-antd/src/api/system/tenant/model.d.ts`，`EimTenantEditBo` 补可选字段：

```ts
export interface EimTenantEditBo {
  id: number;
  // ...原有字段
  status?: string;   // 新增：启用/禁用（0/1）
}
```

**修改** `index.vue` 的 `handleChangeStatus`，最小提交集：

```ts
async function handleChangeStatus(checked, row) {
  await eimTenantUpdate({
    id: row.id,
    status: checked ? EnableStatus.Enable : EnableStatus.Disable,
  });
}
```

**修改** `data.tsx` 的 `drawerSchema`，新增「租户状态」Select（编辑时显示，默认启用）。

> ⚠️ **后端依赖项**：需后端在 `PUT /manager/tenant` 的 `EimTenantEditBo` 里解析 `status` 并更新。
> **Fallback**：若后端暂不支持，状态开关回退用 `tenantStatusChange`（`/system/tenant/changeStatus`，swagger 确认仍存在），不阻塞前端交付。

### 3. 菜单层级统一

#### 3.1 前端（轻量）

- **标题规范化**：三页面 `table-title` 统一为「租户列表 / 租户套餐列表 / License 余额明细」。
- **balance 页兜底**：`views/eim/license/balance/index.vue` 的 `onMounted` 补 `tenantStore.initTenant()` 兜底（record/freeze 页已有，balance 缺失），避免直接访问本页时拿不到租户列表。

#### 3.2 后端菜单表配置（产出说明，非前端代码）

三个页面 `component` 路径稳定，后端按以下配置菜单表：

| 菜单层级 | `menu_name` | `parent_id` | `component` | `perms` |
|---|---|---|---|---|
| 一级：租户管理 | 租户管理 | `0` | `Layout` | — |
| 二级：租户列表 | 租户列表 | `<租户管理id>` | `system/tenant/index` | `system:tenant:list` |
| 二级：租户套餐管理 | 租户套餐管理 | `<租户管理id>` | `system/tenantPackage/index` | `system:tenantPackage:list` |
| 二级：License 管理 | License 管理 | `<租户管理id>` | `eim/license/balance/index` | `eim:license:list` |

前端通过 `import.meta.glob('../views/**/*.vue')` 自动匹配，无需静态路由。

#### 3.3 不做项（明确边界）

- ❌ 不新建静态路由文件（与后端菜单重复）
- ❌ 不迁移页面到 `views/eim/tenant/`（破坏 component 映射）
- ❌ 不动套餐管理 API（后端无 eIM 套餐接口）

## 文件改动清单

| 文件 | 类型 | 改动 |
|---|---|---|
| `views/system/tenant/license-adjust-modal.vue` | 新增 | eIM 专用 License 调整弹窗 |
| `views/system/tenant/index.vue` | 修改 | import 改本地、`handleAdjustLicense` 传 `id`、`handleChangeStatus` 改 EditBo、标题 |
| `views/system/tenant/data.tsx` | 修改 | `drawerSchema` 新增「租户状态」Select |
| `views/system/tenant/tenant-drawer.vue` | 修改 | username 联动、套餐放开 |
| `api/system/tenant/model.d.ts` | 修改 | `EimTenantEditBo` 补 `status?` |
| `views/eim/license/balance/index.vue` | 修改 | `onMounted` 补 `initTenant` 兜底、标题 |

## 错误处理 / 校验

- License 调整：`delta` 为 0 时前端拦截提示「调整量不能为 0」；`remark` 必填（后端 BO 必填）。
- 联系电话：保留现有 `/^1[3-9]\d{9}$/` 校验。
- 管理员账号：保留 `required`；联动预填不破坏必填校验。
- 套餐为空时：保留 `setupPackageSelect` 的「请先配置租户套餐」引导。

## 测试要点

1. 租户列表「调整 License」→ 弹窗显示当前余额 → 输入正/负 delta + 备注 → 提交后余额刷新正确。
2. 新增租户：输入企业名称 → 用户账号自动预填同名 → 手动改账号后不再被覆盖。
3. 编辑租户：套餐可选可改、状态可选；状态开关切换走 EditBo。
4. 一级菜单「租户管理」展开看到三个二级菜单，直接访问 License 管理页能正常加载租户列表。
5. 导出、删除、同步套餐、密码重置功能回归正常。

## 后端依赖

- `PUT /manager/tenant` 的 `EimTenantEditBo` 需支持 `status` 字段（若不支持，前端 fallback 旧 `changeStatus` 接口）。
