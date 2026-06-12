# 租户管理对接 eIM 新 API 设计规格

## 背景

后端新增了 `eim 租户聚合管理控制器`（前缀 `/manager/tenant`），提供一套完整的租户 CRUD + License 调整 + 密码重置接口。前端需要将租户列表页的核心操作（列表查询、新增、编辑、删除、导出、同步套餐、License调整、密码重置）迁移到新 API，同时保留旧 `/system/tenant/` 接口函数用于非 eIM 场景（动态切换租户、状态变更等）。

## 改动范围

### 1. API 层 — `api/system/tenant/`

**`model.d.ts`** — 新增类型：

```ts
/** eIM 租户列表返回 VO */
export interface EimTenantVo {
  id: number;
  tenantId: string;
  companyName: string;
  contactUserName: string;
  contactPhone: string;
  domain: string;
  address: string;
  licenseNumber: string;
  intro: string;
  remark: string;
  packageId: number;
  expireTime: string;
  accountCount: number;
  status: string;
  adminAccount: string;
  userCount: number;         // 新增：当前用户数
  licenseBalance: number;    // 新增：License余额
}

/** eIM 新增租户 BO */
export interface EimTenantAddBo {
  companyName: string;
  contactUserName: string;
  contactPhone: string;
  username: string;
  password: string;
  packageId: number;
  expireTime?: string;
  accountCount?: number;
  domain?: string;
  address?: string;
  licenseNumber?: string;
  intro?: string;
  remark?: string;
}

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

/** eIM License 调整 BO */
export interface EimTenantLicenseAdjustBo {
  tenantId: number;
  delta: number;
  remark: string;
}
```

**`index.ts`** — 新增 eim 前缀函数（旧函数保留不动）：

| 新函数 | HTTP | 路径 | 说明 |
|---|---|---|---|
| `eimTenantList(params)` | GET | `/manager/tenant/list` | 分页查询租户列表 |
| `eimTenantInfo(id)` | GET | `/manager/tenant/{id}` | 获取租户详情 |
| `eimTenantAdd(data)` | POST | `/manager/tenant` | 新增租户 |
| `eimTenantUpdate(data)` | PUT | `/manager/tenant` | 修改租户 |
| `eimTenantRemove(ids)` | DELETE | `/manager/tenant/{ids}` | 删除租户 |
| `eimTenantExport(data)` | POST | `/manager/tenant/export` | 导出租户列表 |
| `eimTenantSyncPackage(tenantId, packageId)` | GET | `/manager/tenant/syncPackage` | 同步套餐权限 |
| `eimTenantLicenseAdjust(data)` | POST | `/manager/tenant/license-adjust` | License 调整 |
| `eimTenantResetPassword(id)` | PUT | `/manager/tenant/resetPassword/{id}` | 重置管理员密码 |

### 2. 列表页 — `views/system/tenant/data.tsx`

**columns 新增列**（在"联系电话"之后、"到期时间"之前）：

| 字段 | 标题 | 宽度 | 说明 |
|---|---|---|---|
| `userCount` | 用户数 | 90 | 显示 `userCount / accountCount`，accountCount=-1 时显示"不限" |
| `licenseBalance` | License余额 | 110 | 蓝色加粗 Tag 样式 |
| `domain` | 域名 | 150 | 空值显示"--" |

### 3. 列表页逻辑 — `views/system/tenant/index.vue`

- `tenantList` → `eimTenantList`
- `tenantAdd` → `eimTenantAdd`（在 drawer 内部切换）
- `tenantUpdate` → `eimTenantUpdate`
- `tenantRemove` → `eimTenantRemove`
- `tenantExport` → `eimTenantExport`
- `tenantSyncPackage` → `eimTenantSyncPackage`
- `tenantInfo` → `eimTenantInfo`
- License 调整 → `eimTenantLicenseAdjust`（替换旧 `adjustLicense`）
- **新增**：密码重置按钮 + `eimTenantResetPassword` 调用（带二次确认）
- **移除**：`handleViewLicense`（跳转旧 `/license/balance`），因为 License 详情已在列表直接展示

### 4. 新增/编辑抽屉 — `views/system/tenant/tenant-drawer.vue`

- `tenantInfo` → `eimTenantInfo`
- `tenantAdd` → `eimTenantAdd`
- `tenantUpdate` → `eimTenantUpdate`
- 表单 schema 不变（字段完全匹配新 BO）

### 5. License 调整弹窗 — `views/eim/license/balance/license-adjust-modal.vue`

- `adjustLicense`（旧 `/manager/license/adjust`）→ `eimTenantLicenseAdjust`（新 `/manager/tenant/license-adjust`）
- `tenantId` 参数类型从 `string` 改为兼容 `number`（新 BO 要求 `tenantId: number`）

## 不做的事情

- 不动菜单路由（后端 sys_menu 控制）
- 不删除旧 API 函数（`/system/tenant/` 下的动态切换、状态变更等保留）
- 不动 `tenantStore`
- 不动 `api/system/license/index.ts`（旧 License 接口保留给 License 管理页使用）

## API 对照表

| 功能 | 旧 API | 新 API |
|---|---|---|
| 列表 | `GET /system/tenant/list` | `GET /manager/tenant/list` |
| 详情 | `GET /system/tenant/{id}` | `GET /manager/tenant/{id}` |
| 新增 | `POST /system/tenant` | `POST /manager/tenant` |
| 修改 | `PUT /system/tenant` | `PUT /manager/tenant` |
| 删除 | `DELETE /system/tenant/{ids}` | `DELETE /manager/tenant/{ids}` |
| 导出 | `POST /system/tenant/export` | `POST /manager/tenant/export` |
| 同步套餐 | `GET /system/tenant/syncTenantPackage` | `GET /manager/tenant/syncPackage` |
| License调整 | `POST /manager/license/adjust` | `POST /manager/tenant/license-adjust` |
| 密码重置 | 无 | `PUT /manager/tenant/resetPassword/{id}` |
