# 运营商-APN 关联关系前端同步 设计文档

- 日期：2026-06-24
- 范围：前端 `esim.eim.web`，配合后端 `esim.eim/eim` 已完成的接口改造
- 约束：**不提交 git**（用户明确要求）

## 一、背景

后端已完成两项改造：

1. **运营商管理**新增「运营商编码」(`operatorCode`) 字段，全局唯一、新增/编辑必填、保存时校验唯一性。
2. **APN 信息**的运营商由原来的裸字符串字段 (`carrierCode`/`carrierName`) 改为外键 `operatorId` 关联运营商表；APN 的 `operatorCode`/`operatorName` 由 `fillOperator` 在查询时关联带出（非表字段）。

同时 APN 按运营商查询的接口由 `/manager/apn/by-carrier/{carrierCode}` 改为 `/manager/apn/by-operator/{operatorId}`。

前端仍停留在旧字段命名（`carrierCode`/`carrierName`/`apnByCarrier`），需同步修改，否则 APN 列表/表单/查询/设备启用流程将调用已不存在的接口或读取不到运营商数据。

## 二、后端接口现状（核对结果）

### 运营商 `/manager/operator`

- `OperatorBo`：`id / operatorCode(必填) / operatorName(必填) / status / remark`
- `OperatorVo`：`id / operatorCode / operatorName / status / remark / createTime / profileCount / apnCount`
- 查询 `buildQueryWrapper`：仅 `operatorName` 模糊 + `status`，**无 `operatorCode` 查询**。

### APN `/manager/apn`

- `ApnBo`/`ApnChangeBo`：`id / name / apn / local / providerId / operatorId / isDefault / status / sourceType / sourceRef`
- `ApnVo`：`id / name / apn / local / creationTime / providerId / operatorId / operatorCode(关联带出) / operatorName(关联带出) / isDefault / status / sourceType / updateTime`
- 查询 `buildQueryWrapper`：支持 `name` 模糊、`apn`、`local`、`providerId`、`operatorId`、`isDefault`、`status`。
- 按运营商查询：`GET /manager/apn/by-operator/{operatorId}`（返回 `List<ApnVo>`，已 `fillOperator`）。

## 三、改动清单

### 3.1 运营商管理（新增 `operatorCode`）

| 文件 | 改动 |
|---|---|
| `api/system/operator/model.d.ts` | `OperatorBo`/`OperatorVo` 增 `operatorCode?: string`；`OperatorImportFailItem` 增 `operatorCode?: string`（后端未返回时降级为空） |
| `views/eim/base/operator/data.tsx` | `drawerSchema` 在「运营商名称」前插入「运营商编码」`Input`，`rules:'required'`，placeholder `如 46001`；`columns` 在「运营商名称」后加「运营商编码」列；`querySchema` 暂不加编码查询（后端不支持） |
| `views/eim/base/operator/batch-import-modal.vue` | 失败明细表加「运营商编码」列 `operatorCode`（兜底 `--`） |

### 3.2 APN（carrier → operator 外键 + 下拉选运营商）

| 文件 | 改动 |
|---|---|
| `api/system/apn/model.d.ts` | `ApnVO`/`ApnForm` 删 `carrierCode`/`carrierName`，加 `operatorId?: number`、`operatorCode?: string`、`operatorName?: string`；`ApnQuery` 的 `carrierCode` → `operatorId` |
| `api/system/apn/index.ts` | 删 `apnByCarrier`，加 `apnByOperator(operatorId)`；`Api.byCarrier` → `Api.byOperator = '/manager/apn/by-operator'` |
| `views/system/apn/data.ts` | 查询区「运营商编码」Input → `ApiSelect` 选运营商（值 `operatorId`）；`modalSchema` 两个手输框 → 一个 `ApiSelect`（`operatorId`，必填）；列表「运营商」列 formatter 读 `operatorName`/`operatorCode` |
| `views/system/apn/index.vue` | 「设为默认」按钮 `v-if` 由 `row.carrierCode` 改 `row.operatorId`；文案用 `row.operatorName||row.operatorCode` |
| `views/system/apn/components/apn-sync-confirm-modal.vue` | `SyncConfirmData.carrierCode` → `operatorId`（必填）；`loadApnList` 调 `apnByOperator`；头部展示 `operatorName||operatorCode` |
| `views/system/device/detail/module/basic.vue` | `handleEnable` setData 传 `operatorId`/`operatorName`，兜底 `row.carrierCode||row.issuer`（后端 profile 暂无 operatorId 时降级） |

### 3.3 新增：运营商下拉选项 hook

- 复用 `operatorList`（分页接口），封装 `getOperatorOptions()`：返回 `{ label: '运营商名称(编码)', value: id }`。
- 供 APN 查询区与表单的 `ApiSelect` 复用。

## 四、依赖后端补充的事项（不阻塞前端落地）

1. **运营商按 `operatorCode` 查询**：后端 `buildQueryWrapper` 暂不支持，前端查询区暂不加该项。
2. **设备 profile 返回 `operatorId`**：`ProfileVo` 当前只有 `operatorCode`/`operatorName`，无 `operatorId`。设备启用流程传 `operatorId` 时，若 profile 行无该字段则降级（跳过 APN 同步弹窗或沿用兜底），待后端补字段后自动生效。
3. **批量导入失败明细 `operatorCode`**：后端 `OperatorImportFailItem` 暂无该字段，前端列兜底 `--`。

前端对上述未到位项一律采用「有则展示/使用，无则降级」写法，保证编译与运行不报错。

## 五、验收标准

- 运营商管理：新增/编辑表单含「运营商编码」必填项，列表展示编码列。
- APN 列表：运营商列正确显示 `名称(编码)`；按运营商下拉筛选生效。
- APN 新增/编辑：运营商为下拉选择，提交 `operatorId`。
- APN「设为默认」：仅关联了运营商的行显示，文案正确。
- 设备启用流程：profile 行有 `operatorId` 时弹出 APN 同步确认并按运营商加载 APN。
- `pnpm -F @vben/web-antd typecheck` 通过（不新增报错）。
