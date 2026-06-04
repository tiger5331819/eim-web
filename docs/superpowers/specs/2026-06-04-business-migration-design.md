# 业务模块迁移设计文档

## 概述

从旧项目（`C:\Users\yanfa\Desktop\esim.eim.web-main`）迁移 5 个业务模块到新项目（`d:\Project\esim.eim.web`）。

**迁移策略**：逐模块渐进式迁移，按依赖关系排序。

**迁移顺序**：APN列表 → 任务列表 → 卡入库管理 → Profile来源管理 → 设备管理

## 技术适配对照

| 维度 | 旧项目 | 新项目 |
|------|--------|--------|
| UI组件库 | Element Plus | antdv-next |
| HTTP请求 | Axios 直接调用 | Alova + Axios 封装 |
| API文件格式 | `index.ts` + `types.ts` | `index.ts` + `model.d.ts` |
| 表格 | el-table | ant-table |
| 表单 | el-form + el-form-item | ant-form |
| 弹窗 | el-dialog | ant-modal |
| 字典 | 自定义 SelectPro / DictTag | 新项目 dict 组件 |
| 权限 | v-hasPermi 自定义指令 | 新项目权限体系 |
| 消息提示 | ElMessage / ElMessageBox | message / Modal.confirm |
| 路由 | 后端动态 + 部分前端硬编码 | 全部后端动态路由 |
| 页面目录 | `views/system/` | `views/system/` |
| API目录 | `api/system/` | `api/system/` |

## 模块1 — APN列表

**复杂度**：⭐ 低 | **优先级**：1（被 profile 和 device 依赖）

### 文件映射

```
旧: src/views/system/apn/index.vue       → 新: views/system/apn/index.vue
旧: src/api/system/apn/index.ts          → 新: api/system/apn/index.ts
旧: src/api/system/apn/types.ts          → 新: api/system/apn/model.d.ts
```

### API接口（5个）

| 函数名 | 方法 | URL | 说明 |
|---|---|---|---|
| `listApn` | GET | `/manager/apn/list` | 查询APN列表 |
| `getApn` | GET | `/manager/apn/{id}` | 查询APN详情 |
| `addApn` | POST | `/manager/apn` | 新增APN |
| `updateApn` | PATCH | `/manager/apn/{id}` | 修改APN |
| `delApn` | DELETE | `/manager/apn/{id}` | 删除APN |

### 核心适配

- 标准 CRUD 页面：搜索表单 + 表格 + 新增/修改/删除/导出
- el-dialog 内表单 → ant-modal 内表单
- 类型定义适配新项目 `PageQuery` 基础类型
- 字段：APNID、名称、APN、适用地区

## 模块2 — 任务列表

**复杂度**：⭐ 低 | **优先级**：2

### 文件映射

```
旧: src/views/system/task/index.vue      → 新: views/system/task/index.vue
旧: src/api/system/task/index.ts         → 新: api/system/task/index.ts
旧: src/api/system/task/types.ts         → 新: api/system/task/model.d.ts
```

### API接口（2个）

| 函数名 | 方法 | URL | 说明 |
|---|---|---|---|
| `taskList` | GET | `/manager/device/task/list` | 获取任务列表 |
| `cancelTask` | DELETE | `/manager/device/task/{ids}` | 取消任务 |

### 核心适配

- 单页面，结构简单
- 任务状态使用 `sys_task_status` 字典
- 多选取消任务功能保留（仅 state==0 的行可选）
- 时间范围搜索用 ant-range-picker 替代

## 模块3 — 卡入库管理

**复杂度**：⭐⭐ 中 | **优先级**：3（含共享 useGetDict hooks）

### 文件映射

```
旧: src/views/system/cardImport/index.vue              → 新: views/system/cardImport/index.vue
旧: src/views/system/cardImport/comp/AllocationCard.vue → 新: views/system/cardImport/comp/AllocationCard.vue
旧: src/views/system/cardImport/comp/BatchImport.vue    → 新: views/system/cardImport/comp/BatchImport.vue
旧: src/views/system/cardImport/hooks/useGetDict.ts     → 新: views/system/cardImport/hooks/useGetDict.ts
旧: src/api/system/cardImport/index.ts                  → 新: api/system/cardImport/index.ts
旧: src/api/system/cardImport/types.ts                  → 新: api/system/cardImport/model.d.ts
```

### API接口（9个）

| 函数名 | 方法 | URL | 说明 |
|---|---|---|---|
| `cardImportList` | GET | `/manager/seed/list` | 卡信息记录列表 |
| `providerList` | GET | `/manager/provider/list` | 运营商列表 |
| `companyList` | GET | `/manager/company/all` | 归属企业列表 |
| `projectList` | GET | `/manager/company/{companyId}/project/all` | 归属项目列表 |
| `allBatchList` | GET | `/manager/seed/batch/all` | 查询所有批次 |
| `batchAllowableNumber` | GET | `/manager/seed/batch/{productionBatch}/inventory` | 批次允许分配数量 |
| `handleAllocation` | POST | `/manager/seed/batch/{productionBatch}` | 卡数分配 |
| `downloadFailRecord` | POST | `/manager/seed/importError/{errorToken}` | 下载导出失败记录 |
| `cardProviderList` | GET | `/manager/seed/cardProviderName` | 查看制卡商 |
| `tenantList` | GET | `/system/tenant/list` | 查询租户列表 |

### 核心适配

- `useGetDict` hooks 是跨模块共享的，导出 `getproviderDict`、`getCardProviderDict`、`getCompanyDict`、`getProjectDict`、`getBatchDict`、`getTenantDict`
- 文件上传（xlsx）用 ant-upload 替代 el-upload
- 搜索展开/收起功能保留
- AllocationCard 弹窗：批次选择 + 允许分配数量 + 租户/项目选择 + 数量输入

## 模块4 — Profile来源管理

**复杂度**：⭐⭐ 中 | **优先级**：4（依赖 APN 和 useGetDict）

### 文件映射

```
旧: src/views/system/profile/index.vue                    → 新: views/system/profile/index.vue
旧: src/views/system/profile/comp/ResourceAllocation.vue   → 新: views/system/profile/comp/ResourceAllocation.vue
旧: src/views/system/profile/comp/BatchImport.vue          → 新: views/system/profile/comp/BatchImport.vue
旧: src/views/system/profile/comp/apnModal.vue             → 新: views/system/profile/comp/apnModal.vue
旧: src/api/system/profile/index.ts                        → 新: api/system/profile/index.ts
旧: src/api/system/profile/types.ts                        → 新: api/system/profile/model.d.ts
```

### API接口（6个）

| 函数名 | 方法 | URL | 说明 |
|---|---|---|---|
| `profileList` | GET | `/manager/profile/list` | 获取profile资源列表 |
| `handleSync` | POST | `/manager/profile/sync` | 同步数据 |
| `allBatchList` | GET | `/manager/profile/productionBatch` | 查询所有批次 |
| `batchAllowableNumber` | GET | `/manager/profile/canBeAssignCount/{productionBatch}` | 查询批次允许分配数量 |
| `handleAllocation` | POST | `/manager/profile/assign` | 资源分配 |
| `updateProfileApn` | PATCH | `/manager/profile/{id}/apn/{apnId}` | 更新profile的APN |

### 核心适配

- 依赖 APN 模块的 `listApn` 接口（apnModal 中使用）
- 依赖 `useGetDict` hooks
- 字典：`sys_allocate_status`、`sys_profile_state`、`sys_installed_status`
- SelectPro 组件 → 替换为新项目下拉选择组件
- 操作按钮：同步数据、资源分配、批量导入、下载模板

## 模块5 — 设备管理

**复杂度**：⭐⭐⭐ 高 | **优先级**：5（最复杂，依赖 APN 和 useGetDict）

### 文件映射

```
旧: src/views/system/device/index.vue                       → 新: views/system/device/index.vue
旧: src/views/system/device/comp/BatchImport.vue            → 新: views/system/device/comp/BatchImport.vue
旧: src/views/system/device/comp/ChangeEim.vue              → 新: views/system/device/comp/ChangeEim.vue
旧: src/views/system/device/detail/index.vue                → 新: views/system/device/detail/index.vue
旧: src/views/system/device/detail/add.vue                  → 新: views/system/device/detail/add.vue
旧: src/views/system/device/detail/module/basic.vue         → 新: views/system/device/detail/module/basic.vue
旧: src/views/system/device/detail/module/operation.vue     → 新: views/system/device/detail/module/operation.vue
旧: src/views/system/device/detail/module/eim.vue           → 新: views/system/device/detail/module/eim.vue
旧: src/views/system/device/detail/module/apnModal.vue      → 新: views/system/device/detail/module/apnModal.vue
旧: src/views/system/device/download/index.vue              → 新: views/system/device/download/index.vue
旧: src/api/system/device/index.ts                          → 新: api/system/device/index.ts
旧: src/api/system/device/types.ts                          → 新: api/system/device/model.d.ts
```

### API接口（19+个）

| 函数名 | 方法 | URL | 说明 |
|---|---|---|---|
| `cardList` | GET | `/manager/seed/list` | 卡信息记录查询 |
| `cardImport` | POST | `/manager/seed/import` | 批量导入 |
| `deviceList` | GET | `/manager/device/list` | 查询设备列表 |
| `deviceDetail` | GET | `/manager/device/{eid}` | 查询设备详细信息 |
| `updateDetail` | POST | `/manager/device/{eid}/profile/list` | 同步数据 |
| `deviceName` | POST | `/manager/device/{eid}/name` | 修改设备名称 |
| `companyName` | POST | `/manager/device/{eid}/companyName` | 修改企业名称 |
| `toEnable` | PATCH | `/manager/device/{eid}/profile/{iccid}/enable` | 启用业务号 |
| `toDisable` | PATCH | `/manager/device/{eid}/profile/{iccid}/disable` | 停用业务号 |
| `toDelete` | DELETE | `/manager/device/{eid}/profile/{iccid}` | 删除业务号 |
| `operationLog` | GET | `/manager/device/{eid}/log/list` | 运营信息列表 |
| `eimList` | GET | `/manager/device/{eid}/eim/list` | EIM列表 |
| `eimDetail` | GET | `/manager/device/{eid}/eim/{eimId}` | EIM详情 |
| `eimAdd` | POST | `/manager/device/{eid}/eim` | 新增EIM |
| `eimEdit` | PATCH | `/manager/device/{eid}/eim/{eimId}` | 修改EIM |
| `eimChange` | POST | `/manager/device/{eid}/eim/{eimId}/change` | 替换EIM |
| `eimDelete` | DELETE | `/manager/device/{eid}/eim/{eimId}` | 删除EIM |
| `eimDownload` | GET | `/manager/device/{eid}/profileDownload` | 查询下载进度 |
| `dpDownload` | POST | `/manager/device/{eid}/dp/profileDownload` | 获取并下载业务号 |
| `toDownload` | POST | `/manager/device/{eid}/profileDownload` | 识别并下载业务号 |
| `idDownload` | GET | `/eimProfile/{eid}/use/{id}` | 使用运营商资源下载 |
| `toResult` | GET | `/manager/device/{eid}/profileDownload/result` | 下载结果 |
| `updateEim` | POST | `/manager/device/{eid}/eim/listEim` | 同步EIM |
| `updateProfileApn` | PATCH | `/manager/device/{eid}/profile/{iccid}/apn/{apnId}` | 修改APN |
| `eimProfile` | GET | `/eimProfile` | 获取运营商列表 |
| `batchListByProjectId` | GET | `/manager/profile/productionBatch/{projectId}` | 获取指定项目下的批次 |
| `countByBatchId` | GET | `/manager/profile/canBeAssignCount/{productionBatch}` | 获取指定批次的可分配数量 |
| `batchAllocationAndDownload` | POST | `/manager/device/batch/profileDownload` | 批量下发资源 |

### 核心适配

- 设备详情页 el-tabs → ant-tabs，保持三个Tab（基本信息/运营信息/EIM LIST）
- 下载业务号页4种下载方式保留
- 批量下载页 localStorage 传数据 → 改用路由参数或 Pinia store
- 多选模式（替换EIM / 批量下载资源）保留
- 所有子页面改为后端动态路由，不硬编码

## 跨模块依赖

```
APN模块 ──→ 被Profile(apnModal)引用
         ──→ 被Device(apnModal)引用

useGetDict ──→ 被cardImport引用
           ──→ 被Profile引用
           ──→ 被Device引用
```

## 共享基础设施

1. **useGetDict hooks** — 迁移到 `views/system/cardImport/hooks/useGetDict.ts`，内部API调用适配Alova
2. **全局类型** — `DialogOption`、`PageData<T,D>` 等检查新项目是否有等价物，有则复用
3. **字典数据** — 使用新项目已有的 `useDictStore` 和 dict 组件体系
4. **文件上传** — 使用新项目已有的 upload 组件体系

## 路由策略

全部使用后端动态路由，前端不硬编码任何业务模块路由。设备管理的子页面（详情、下载业务号、批量下载）的路由也由后端菜单系统控制。
