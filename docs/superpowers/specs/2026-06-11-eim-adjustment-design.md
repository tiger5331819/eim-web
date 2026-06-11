# eIM 调整需求 — 总体设计文档

> 日期：2026-06-11
> 范围：覆盖《eIM调整需求.docx》全部 6 大模块，分 4 个子项目分阶段实施
> 后端：所有依赖接口已实现，参见 `http://localhost:8080/v3/api-docs/平台功能`

---

## 1. 总览

### 1.1 需求来源回顾

| 编号 | 需求条目 | 落地位置 |
|---|---|---|
| 1 | 租户管理升级 + License 配置 | **P1** |
| 2 | APN 列表优化（默认 APN、运营商分组、下号同步） | **P2** |
| 3 | 码号资源管理（总池/租户池/调配/日志） | **P3** |
| 4 | eUICC 管理一级菜单 + 库存/eUICC/任务子菜单 + 字段优化 + 下载流程改造 + APN 下发逻辑 | **P4** |
| 5 | OpenAPI 开发（后端能力，前端只需对接日志） | **P4 内嵌** |
| 6 | OpenAPI 日志管理 | **P4 内嵌** |

### 1.2 实施阶段与依赖关系

```
┌────────────────────────────────────────────────────────────┐
│ P1  菜单结构调整 + 租户/License 管理     (基础)            │
│   └─ 菜单作为其他模块的容器；license冻结/扣减是P4下载的依赖│
├────────────────────────────────────────────────────────────┤
│ P2  APN 优化（默认APN、按运营商查询）   (独立)             │
│   └─ 输出供 P4 设备/Profile APN 下发使用                   │
├────────────────────────────────────────────────────────────┤
│ P3  码号资源池管理（全新模块）           (独立)            │
│   └─ 总池→租户池→调配→日志                                 │
│   └─ 替代现有 views/system/profile 的资源分配能力          │
├────────────────────────────────────────────────────────────┤
│ P4  eUICC 模块重构 + OpenAPI 日志                          │
│   ├─ 依赖 P1（菜单容器、license 余额展示）                 │
│   ├─ 依赖 P2（APN 默认逻辑、下号确认弹窗）                 │
│   └─ 依赖 P3（下载业务号从租户码号池取）                   │
└────────────────────────────────────────────────────────────┘
```

**实施顺序**：`P1 → P2 → P3 → P4`，每个 P 完成后单独走 writing-plans → 实现 → 验证 → 提交，再进入下一阶段。

### 1.3 菜单结构（最终态）

```
├─ 仪表盘
├─ 租户管理 ⭐一级
│  ├─ 租户列表
│  ├─ 租户套餐
│  └─ License管理
│     ├─ 余额查询
│     ├─ 变更流水
│     └─ 冻结记录
├─ eUICC管理 ⭐一级
│  ├─ 库存管理（原卡入库）
│  ├─ eUICC管理（原设备）
│  └─ 任务列表
├─ 码号资源管理 ⭐一级
│  ├─ 资源总池
│  ├─ 租户资源池
│  ├─ 资源调配
│  └─ 调配日志
├─ 平台配置 ⭐一级
│  ├─ APN管理
│  ├─ Profile供应商（SMDP+）
│  ├─ 项目管理
│  └─ OpenAPI日志
└─ 系统管理
   └─ 用户/角色/菜单/部门/岗位/字典等（仅保留原生权限类）
```

**实施约定**：菜单本身**通过后端 system_menu 表配置**，前端不硬编码业务路由。开发期 mock 阶段可临时在 `routes/static.ts` 添加，但合并前必须由后端生成菜单 SQL 迁移脚本。

### 1.4 全局技术约定（贯穿全部子项目）

| 维度 | 约定 |
|---|---|
| API 目录 | `apps/web-antd/src/api/<domain>/<module>/{index.ts, model.d.ts}` |
| 视图目录 | `apps/web-antd/src/views/<domain>/<module>/{index.vue, data.ts(x), *-modal.vue, *-drawer.vue}` |
| HTTP | 统一用 `alovaInstance`（已封装 successMessageMode、加密等） |
| 表单/表格 | Vben Form + Vben Table，列定义放在 `data.tsx` |
| 弹窗 | 优先 `useVbenModal`/`useVbenDrawer` |
| 字典 | `useDictStore`；新增字典先在系统管理→字典管理录入 |
| 权限 | 走后端权限码（如 `eim:license:adjust`），用 `hasAccessByCodes` 或 `<AccessControl>` |
| 命名 | 类型 `XxxVO`/`XxxBO`/`XxxForm`/`XxxQuery`；函数 `listXxx`/`addXxx`/`updateXxx` 与现有保持一致 |
| 中文 | 文案、字段说明、注释全部用简体中文 |

### 1.5 命名映射约定（后端 schema → 前端类型）

后端命名习惯是 `XxxBo`（请求体）/`XxxVo`（响应体）。前端类型保持后端字段一致，命名采用 `XxxBO`/`XxxVO`，与项目已有风格保持一致。

### 1.6 视图目录映射

| 子项目 | 视图目录 | 说明 |
|---|---|---|
| P1 License 管理 | `views/license/` | 新增顶级目录，对应"租户管理→License管理"二级菜单 |
| P1 租户列表/套餐 | `views/system/tenant/`、`views/system/tenantPackage/` | 沿用原位置；菜单挪到一级"租户管理"下 |
| P2 APN 管理 | `views/system/apn/` | 沿用原位置；菜单挪到一级"平台配置"下 |
| P3 码号资源池 | `views/profile-pool/{total,tenant,transfer,log}/` | 新增顶级目录，对应一级"码号资源管理" |
| P4.1 库存管理 | `views/system/cardImport/` | 沿用原位置；菜单挪到一级"eUICC管理"下 |
| P4.2 eUICC 管理 | `views/system/device/` | 沿用原位置；菜单挪到一级"eUICC管理"下 |
| P4.3 任务列表 | `views/system/task/` | 沿用原位置；菜单挪到一级"eUICC管理"下 |
| P4.4 OpenAPI 日志 | `views/openapi-log/` | 新增顶级目录，对应一级"平台配置→OpenAPI日志" |

**原则**：尽量复用现有目录避免大规模移动；菜单层级由后端 `system_menu` 表 + 前端 router 配置共同决定，与磁盘目录解耦。

---

## 2. 子项目 P1 — 菜单结构 + 租户/License 管理

### 2.1 目标

1. 完成菜单整体重构（后端 SQL + 前端路由 mock）。
2. 新增 **License 管理** 三个子页面：余额查询、变更流水、冻结记录。
3. 在 **租户列表** 提供"调整 License"和"启停 License"快捷入口。

### 2.2 后端接口清单

| 函数 | 方法 | URL | 权限码 |
|---|---|---|---|
| `getLicense(tenantId)` | GET | `/manager/license/{tenantId}` | `eim:license:query` |
| `addLicense(data)` | POST | `/manager/license/add` | `eim:license:add` |
| `adjustLicense(data)` | POST | `/manager/license/adjust` | `eim:license:adjust` |
| `toggleLicenseStatus(data)` | PUT | `/manager/license/status` | `eim:license:status` |
| `licenseRecordList(params)` | GET | `/manager/license/record` | `eim:license:record:list` |
| `licenseFreezeList(params)` | GET | `/manager/license/freeze` | `eim:license:freeze:list` |

### 2.3 文件结构

```
api/system/license/
├── index.ts          # 6个API函数
└── model.d.ts        # TenantLicenseVO/RecordVO/FreezeVO/AddBO/AdjustBO/StatusBO

views/license/
├── index.vue              # 余额查询主页（默认页）
├── data.tsx               # 表格列定义
├── license-adjust-modal.vue   # 调整次数弹窗（增加/扣减）
├── license-add-modal.vue      # 添加次数弹窗
├── license-record/
│   ├── index.vue          # 变更流水分页表
│   └── data.tsx
└── license-freeze/
    ├── index.vue          # 冻结记录分页表
    └── data.tsx
```

### 2.4 页面交互设计

**余额查询页（`views/license/index.vue`）**
- 顶部：租户选择器（admin 可切，租户用户固定本租户）
- 卡片区四个数字：累计添加次数 / 已确认扣减 / 冻结中 / 可用次数
- 操作按钮：`添加次数`（权限 `eim:license:add`）、`调整`（`eim:license:adjust`）、`启用/停用`（`eim:license:status`）
- 状态徽章：正常/停用

**变更流水页**：标准分页表 — 变更类型、数量、变更前/后可用、业务类型、业务ID、操作人、备注、时间。支持按 `tenantId`、`changeType` 过滤。

**冻结记录页**：标准分页表 — taskId、profileId、ICCID、冻结额度、状态(`FROZEN`/`CONFIRMED`/`RELEASED`/`EXPIRED`)、冻结时间、确认/释放/过期时间、备注。支持按 `tenantId`、`status` 过滤。

### 2.5 租户列表集成

在 `views/system/tenant/index.vue` 表格操作列新增：
- `License详情` — 跳转 `/license?tenantId=xxx`
- `调整License` — 直接弹 `license-adjust-modal`

### 2.6 验收标准

- [ ] 菜单结构落地，所有原模块在新位置可访问
- [ ] 余额、流水、冻结三页可分页、可过滤、字段完整
- [ ] 添加/调整后余额实时更新（操作后重新拉取 `getLicense`）
- [ ] 权限码生效（无权限按钮不显示）
- [ ] 租户列表新增的两个入口工作正常

---

## 3. 子项目 P2 — APN 优化

### 3.1 目标

1. APN 数据模型扩展（运营商、是否默认、状态、来源）。
2. 列表/表单新增以上字段。
3. 提供"设为默认"操作。
4. 提供供 P4 调用的"按运营商查询 APN"接口。
5. 下号完成、切换码号场景下的"是否同步下发 APN"交互（实际下发在 P4 设备页实现，本阶段只提供 API 函数与公共 Modal 组件）。

### 3.2 后端接口清单

| 函数 | 方法 | URL | 备注 |
|---|---|---|---|
| `listApn(params)` | GET | `/manager/apn/list` | 已有，需扩展返回字段 |
| `getApn(id)` | GET | `/manager/apn/{id}` | 已有 |
| `addApn(data)` | POST | `/manager/apn` | 已有，请求体扩展 |
| `updateApn(data)` | PATCH | `/manager/apn/{id}` | 已有，使用新 `ApnChangeBo` |
| `delApn(ids)` | DELETE | `/manager/apn/{ids}` | 已有 |
| `setDefaultApn(id)` ⭐ | PATCH | `/manager/apn/{id}/default` | **新接口** |
| `apnByCarrier(carrierCode)` ⭐ | GET | `/manager/apn/by-carrier/{carrierCode}` | **新接口** |
| `apnExport(data)` | POST | `/manager/apn/export` | 已有 |

### 3.3 数据模型更新

```ts
// api/system/apn/model.d.ts
export interface ApnVO {
  id: string;
  name: string;
  apn: string;
  local: string;
  providerId?: number;        // 新增：供应商ID
  carrierCode?: string;       // 新增：运营商编码
  carrierName?: string;       // 新增：运营商名称
  isDefault?: '0' | '1';      // 新增：是否默认APN
  status?: '0' | '1';         // 新增：状态
  sourceType?: string;        // 新增：来源（DP+/手动）
  creationTime: string;
  updateTime?: string;
}

export interface ApnForm {
  id?: string;
  name?: string;
  apn?: string;
  local?: string;
  providerId?: number;
  carrierCode?: string;
  carrierName?: string;
  isDefault?: '0' | '1';
  status?: '0' | '1';
  sourceType?: string;
  sourceRef?: string;
}

export interface ApnQuery {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  apn?: string;
  carrierCode?: string;
  isDefault?: string;
  status?: string;
}
```

### 3.4 视图变更

**`views/system/apn/index.vue`**
- 搜索表单新增：运营商下拉（来源：Profile供应商接口 `providerList`）、状态、是否默认
- 表格新增列：运营商名称、是否默认（Tag）、状态（Switch 风格 Tag）、来源
- 行操作新增：`设为默认`（当 `isDefault=0` 显示）
- 当同一运营商已有默认 APN 时，设置新默认会提示"将替换 XXX 的默认 APN"

**`views/system/apn/apn-modal.vue`**
- 新增运营商选择（必填）、是否默认（Switch）、状态（Switch）、来源（只读，新增固定 `MANUAL`）

### 3.5 公共组件 — APN 同步确认 Modal

新增 `views/system/apn/components/apn-sync-confirm-modal.vue`，统一用于以下场景：
- 切换码号成功后
- 修改 profile 的 APN 后

接口：
```ts
defineProps<{
  carrierCode: string;
  defaultApnId: string;
  defaultApnName: string;
}>()
defineEmits<{
  (e: 'confirm', payload: { apnId: string; sync: boolean }): void
}>()
```

弹窗内容：
- 显示当前运营商的默认 APN
- 提供"切换 APN"下拉（值由 `apnByCarrier(carrierCode)` 拉取）
- 复选框"同步下发到设备"（默认勾选）
- 确定后 emit，由父页面决定调用 `updateProfileApn` 还是设备端 APN 接口

### 3.6 验收标准

- [ ] APN 列表显示扩展字段且可搜索
- [ ] 设为默认功能正常，同运营商唯一默认
- [ ] `apnByCarrier` 可独立调通，返回值结构正确
- [ ] 同步确认 Modal 在 P4 集成时可即插即用

---

## 4. 子项目 P3 — 码号资源池管理（全新）

### 4.1 目标

按需求 §3"新增码号资源管理模块"，建立**两级资源池**模型：

```
┌─────────────────┐  分配  ┌──────────────────┐  下载  ┌────────┐
│ 平台资源总池     │ ────→ │ 租户资源池       │ ────→ │ 设备   │
│ (未分配/已分配/  │       │ (空闲/已下载/    │       │        │
│  已下载/可回收)  │ ←──── │  已删除)         │       └────────┘
└─────────────────┘  回收  └──────────────────┘
                                 ↑↓ 调配
                            (租户间转移)
```

资源数据源：云百 SMDP+、东信 SMDP+、手动录入（已由现有 `Profile供应商` 配置 + `码号资源导入` 完成）。

### 4.2 后端接口清单

| 函数 | 方法 | URL | 权限码 |
|---|---|---|---|
| `poolStats(tenantId)` | GET | `/manager/profile/pool/stats` | `eim:profile:pool:stats` |
| `poolAllocate(data)` | POST | `/manager/profile/pool/allocate` | `eim:profile:pool:allocate` |
| `poolTransfer(data)` | POST | `/manager/profile/pool/transfer` | `eim:profile:pool:transfer` |
| `poolRecycle(profileId)` | POST | `/manager/profile/pool/recycle/{profileId}` | `eim:profile:pool:recycle` |
| `poolBatchRecycle(data)` | POST | `/manager/profile/pool/batch-recycle` | `eim:profile:pool:recycle` |
| `allocationLogList(params)` | GET | `/manager/profile/pool/allocation-log` | `eim:profile:pool:log:list` |
| `profileList(params)` | GET | `/manager/profile/list` | （已有，需扩展按 `poolStatus`/`assignedTenantId` 查询） |

### 4.3 文件结构

```
api/system/profile-pool/
├── index.ts
└── model.d.ts
    ├── ProfilePoolStatsVO
    ├── ProfileAllocateBO
    ├── ProfileTransferBO
    ├── ProfileBatchRecycleBO
    ├── ProfileAllocationLogVO
    └── ProfileAllocationLogQuery

views/profile-pool/
├── total/                    # 资源总池
│   ├── index.vue
│   ├── data.tsx
│   ├── allocate-modal.vue       # 分配到租户
│   └── batch-recycle-modal.vue  # 批量回收
├── tenant/                   # 租户资源池
│   ├── index.vue
│   ├── data.tsx
│   └── stats-card.vue           # 头部统计卡片
├── transfer/                 # 资源调配
│   ├── index.vue                # 调配主页（左：源租户，右：目标租户）
│   ├── data.tsx
│   └── transfer-modal.vue       # 调配确认
└── log/                      # 调配日志
    ├── index.vue
    └── data.tsx
```

### 4.4 各页面设计

#### 4.4.1 资源总池（`views/system/profile-pool/total/index.vue`）

- 复用现有 `profileList` 接口，加 `poolStatus` 字段（后端 ProfileBO 已支持）
- 顶部统计卡片：未分配 / 已分配 / 已下载 / 可回收（来自 `poolStats({tenantId: ''})` 表示平台维度）
- 表格列：ICCID、运营商、生产批次、DP+来源、APN、池状态（Tag 颜色：未分配灰/已分配蓝/已下载绿/可回收橙）、分配租户、操作时间
- 搜索：ICCID、运营商、批次、池状态、租户
- 多选 → 批量回收按钮（仅 `poolStatus=DOWNLOADED` 行可选，调用 `poolBatchRecycle`）
- 单行操作：分配（弹 `allocate-modal`）、回收（仅可回收行）

**分配 Modal**：选择目标租户、目标项目（联动 `companyList` + `projectList`）、批次（联动 `selectProductionBatchByProjectId`）、数量。调用 `poolAllocate`。

#### 4.4.2 租户资源池（`views/system/profile-pool/tenant/index.vue`）

- 顶部租户选择器（admin 切换租户；普通租户用户固定本租户）
- 统计卡片：空闲 / 已下载 / 已删除
- 表格列：ICCID、运营商、项目、池状态、关联 EID（已下载时）、下载时间
- 搜索：ICCID、运营商、池状态、项目
- 行操作：`回收`（调用 `poolRecycle`，仅 `DOWNLOADED/RECYCLEABLE` 行）

#### 4.4.3 资源调配（`views/system/profile-pool/transfer/index.vue`）

- **左侧**：源租户面板（选择源租户 → 显示其资源池表格）
- **右侧**：目标租户面板（选择目标租户 + 项目）
- 中间按钮：`→ 调配选中` （单选/多选源资源 → 调用 `poolTransfer`）
- 调配 Modal：确认源/目标信息、填写备注

#### 4.4.4 调配日志（`views/system/profile-pool/log/index.vue`）

- 标准分页表
- 列：ICCID、profileId、动作类型(`ALLOCATE`/`TRANSFER`/`RECYCLE`)、源租户、目标租户、变更前状态 → 变更后状态、操作人、备注、时间
- 搜索：ICCID、profileId、目标租户、动作类型、时间范围

### 4.5 与现有 Profile 页面的关系

- 现有 `views/system/profile/index.vue` 改造为**通用码号查询**页（保留搜索、列表能力），移除"资源分配"按钮（统一到资源池模块）

- 现有 `views/system/profile/allocation-modal.vue` 标记 deprecated，建议删除以避免混淆

### 4.6 验收标准

- [ ] 四个子页面均可分页加载、字段完整
- [ ] 总池→租户池分配完成后，两侧池统计同步刷新
- [ ] 租户间调配后，源池减、目标池增、日志生成
- [ ] 回收（单 / 批量）状态流转正确
- [ ] 权限码生效

---

## 5. 子项目 P4 — eUICC 模块重构 + OpenAPI 日志

P4 是工作量最大的阶段，分 4 个相对独立的子任务：

```
P4.1 库存管理重构（views/system/cardImport → views/eim/inventory）
P4.2 eUICC 管理重构（views/system/device → views/eim/euicc）
P4.3 任务列表迁移（views/system/task → views/eim/task）
P4.4 OpenAPI 日志（全新）
```

### 5.1 P4.1 — 库存管理（原卡入库）

#### 目标
- 列表字段升级：`导入批次、EID、预制种子号(ICCID)、制卡商、入库人、入库时间、分配租户、分配人、分配时间`
- 新增"单卡添加"按钮
- 优化批量导入模板（沿用 `/manager/seed/importTemplate`）
- 重构分配：单卡分配 + 批量分配 + 按批次分配三种模式

#### 后端接口（已就绪）

| 函数 | 方法 | URL |
|---|---|---|
| `seedList(params)` | GET | `/manager/seed/list` |
| `seedImport(file)` | POST | `/manager/seed/importWithOptions` |
| `seedImportTemplate()` | POST | `/manager/seed/importTemplate` |
| `seedImportError(token)` | POST | `/manager/seed/importError/{errorToken}` |
| `seedExport(params)` | POST | `/manager/seed/export` |
| `cardProviderList()` | GET | `/manager/seed/cardProviderName` |
| `batchList()` | GET | `/manager/seed/batch/all` |
| `batchInventory(batch)` | GET | `/manager/seed/batch/{productionBatch}/inventory` |
| `batchAllocate(batch, data)` | POST | `/manager/seed/batch/{productionBatch}` |

#### 文件结构

```
views/system/cardImport/
├── index.vue                # 重构后的库存主页
├── data.tsx                 # 新字段列定义
├── single-add-modal.vue     # 新增：单卡添加
├── batch-import-modal.vue   # 优化：导入模板按钮、错误下载
├── allocation-modal.vue     # 重构：支持单/多选/按批次三种来源
└── hooks/useGetDict.ts      # 已有，保留
```

#### 分配 Modal 三种来源约定
- 进入方式 A：单行操作 → 默认填入 `productionBatch=本行批次, ids=[本行id]`
- 进入方式 B：表格多选 + "批量分配" → `ids=选中行id, productionBatch=约束所选行必须同批次`
- 进入方式 C：顶部 "按批次分配" → 弹批次选择 → 进入分配 Modal

### 5.2 P4.2 — eUICC 管理（原设备）

#### 目标

1. 列表字段升级：`EID、预制种子号、当前码号、IMEI、在线状态、所属租户、创建时间`
2. **APN 下发逻辑升级**（核心）：
   - 下号完成 → 根据运营商显示默认 APN，可选择该运营商其他 APN
   - 启用码号 → 弹"是否同步下发 APN"确认（默认否），是 → 调 `updateProfileApn` 后端会同时下发到设备
3. **下载业务号流程改造**（核心）：
   - 旧：4 种下载方式（DP+ / 识别 / 运营商资源 / 批量）
   - 新：保留"选择运营商"方式，但**资源来源切换到租户码号池**
   - 流程：选运营商 → 后端从租户池随机取一个 → 显示 ICCID/运营商等简单信息 → 用户确认 → 下载
4. 列表搜索字段同步扩展

#### 后端接口

**已有**（沿用）：
- `deviceList`, `deviceDetail`, `eimList/Detail/Add/Edit/Change/Delete`, `operationLog`
- `toEnable/Disable/Delete`, `eimDownload/Result`, `batchAllocationAndDownload`

**新接入 / 改造**：
- `useProfile(eid, id)` — `GET /eimProfile/{eid}/use/{id}` 已有，但前端流程要改成"先预览后确认"。
- 新增前端服务端调用模式：`POST /manager/device/{eid}/dp/profileDownload` 时增加"从租户池随机选号"的展示
- `apnByCarrier` (P2 提供) 用于下号后/启用前的 APN 选择弹窗

#### 关键交互改造点

**A. 启用码号按钮**（基本信息 Tab 内 Profile 列表）
```
[原]  toEnable(eid, iccid) → 直接调用
[新]  toEnable(eid, iccid) → 成功后弹 apn-sync-confirm-modal（来自P2）
       → 用户确认是否切换/同步 APN
       → 若同步：调用 updateProfileApn(eid, iccid, apnId)
```

**B. 下载业务号页面**（`views/system/device/download/index.vue`）

旧 4 种 Tab 改为：
```
Tab 1：从租户资源池下载（默认）
  └ 选运营商 → 后端 useProfile 返回随机一个 → 预览 → 确认 → 触发下载
Tab 2：DP+ 直连（保留兼容）
  └ 走 dpDownload
Tab 3：识别码下载（保留）
  └ 走 toDownload 输入激活码
Tab 4：从指定批次下载（替代旧"运营商资源"）
  └ 选项目 → 选批次 → 调 batchAllocationAndDownload
```

**C. 批量下载改造**
- 旧：localStorage 传数据
- 新：使用 Pinia store `useDeviceBatchStore`（仅 sessionStorage 持久化），跳转携带 token

### 5.3 P4.3 — 任务列表

#### 目标
- 现有功能基本满足（沿用），但需要：
  - 字段扩展：操作类型（手动/批量/OpenAPI）— 后端 `DevcieDownloadTaskBo` 暂未提供，**待后端补字段**
  - 视图位置迁移：从"系统管理"挪到"eUICC管理"二级菜单
  - 导出能力：调 `/manager/device/task/export`（前端已有 `commonExport` 助手）

#### 文件
保留 `views/system/task/`，仅修改菜单路径和补充导出按钮。如菜单后端迁移后路径不一致，需同步更新 `data.ts` 中字典 key 等引用。

### 5.4 P4.4 — OpenAPI 日志

#### 目标
新增独立查询页，便于排查 OpenAPI 调用问题。

#### 后端接口

| 函数 | 方法 | URL | 权限码 |
|---|---|---|---|
| `openApiLogList(params)` | GET | `/manager/openapi-log/list` | `eim:openapi:log:list` |

#### 文件结构

```
api/system/openapi-log/
├── index.ts
└── model.d.ts        # OpenApiLogVO, OpenApiLogQuery

views/openapi-log/
├── index.vue
├── data.tsx
└── log-detail-drawer.vue   # 请求参数/响应摘要预览
```

#### 表格列
租户、调用用户、接口名称、方法、URI、请求 IP、是否成功（Tag）、耗时(ms)、调用时间、操作（"查看详情" → Drawer 显示 requestParams/responseBody/errorMsg）

#### 搜索字段
租户、用户名、接口名、是否成功、HTTP 方法、调用时间范围

### 5.5 验收标准（P4 整体）

- [ ] 库存管理新字段、单卡添加、三种分配模式工作正常
- [ ] eUICC 管理：启用码号弹 APN 同步确认，确认后 APN 正确同步
- [ ] 下载业务号 4 个 Tab 全部可用，"租户池下载"流程：选运营商 → 预览 → 确认 → 下载
- [ ] 任务列表迁移成功，导出功能可用
- [ ] OpenAPI 日志可分页、过滤、详情查看
- [ ] 全部页面权限码生效

---

## 6. 通用基础设施

### 6.1 公共工具函数

`utils/poolStatus.ts` — 池状态 Tag 颜色与文案：
```ts
export const POOL_STATUS_MAP = {
  UNASSIGNED: { color: 'default', text: '未分配' },
  ASSIGNED:   { color: 'blue',    text: '已分配' },
  DOWNLOADED: { color: 'green',   text: '已下载' },
  RECYCLEABLE:{ color: 'orange',  text: '可回收' },
} as const;
```

`utils/licenseStatus.ts` — License 状态 / 冻结状态映射。

### 6.2 新增字典（需后端先录入）

| 字典类型 | code | 用途 |
|---|---|---|
| `eim_pool_status` | 资源池状态 | 总池/租户池显示 |
| `eim_license_change_type` | License变更类型 | 流水筛选 |
| `eim_license_freeze_status` | 冻结状态 | 冻结记录筛选 |
| `eim_allocation_action` | 调配动作 | 日志筛选 |
| `eim_apn_source` | APN来源 | APN列表显示 |
| `eim_openapi_method` | HTTP方法枚举 | OpenAPI日志筛选 |

字典数据需通过 `系统管理→字典管理` 录入，或提供 SQL 脚本。

### 6.3 共享 Hooks

`hooks/useTenantSelector.ts` — 租户下拉选择（admin 可选所有，普通用户固定本租户），多个页面复用。

`hooks/useProjectByTenant.ts` — 选定租户后联动加载项目列表。

---

## 7. 实施顺序与里程碑

| 里程碑 | 内容 | 预估工作量 |
|---|---|---|
| **M1** | P1 完成 | 2-3 天 |
| **M2** | P2 完成 | 1-2 天 |
| **M3** | P3 完成 | 3-4 天 |
| **M4** | P4.1 + P4.3 完成 | 2-3 天 |
| **M5** | P4.2 完成 | 3-5 天（含下载流程改造） |
| **M6** | P4.4 完成 | 1 天 |

每个里程碑结束：
1. 在 `docs/superpowers/specs/` 视情况追加细化设计
2. `docs/superpowers/plans/` 下生成对应的 implementation plan
3. 实现完成后 commit、verify、用户确认进入下一个里程碑

---

## 8. 风险与依赖

| 风险 | 应对 |
|---|---|
| 后端字典未录入导致下拉空 | 设计阶段产出字典 SQL，由后端先入库 |
| 菜单 SQL 与现有冲突 | 用全新菜单 ID 段，避免覆盖 |
| License 扣减/冻结时序 | 后端已实现，前端只展示，需在 P4 下载流程中关注 401/业务错误码"license 不足" |
| 下载流程改动影响线上 | P4.2 上线前需在测试租户验证 4 种下载方式都通 |
| 现有 profile 页与新资源池页职责重叠 | P3 完成后立即清理 deprecated 入口 |

---

## 9. 不在本设计范围

- OpenAPI 后端实现（已完成）
- 移动端适配（项目目前只面向 PC）
- 性能压测、多语言（保留中文）
- E2E 自动化测试（仅手工验证 + 现有单测覆盖）
