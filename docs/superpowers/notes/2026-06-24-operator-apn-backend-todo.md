# 后端待补充项（配合「运营商-APN 关联」前端同步）

- 日期：2026-06-24
- 背景：后端已完成「运营商管理新增 `operatorCode`」+「APN 运营商改外键 `operatorId`」。前端已同步改造完毕，但有以下 3 点后端尚未覆盖，导致部分功能不生效。请后端协助补充。
- 前端已对这 3 点做**降级兜底**（不报错），后端补齐后前端自动生效，无需前端再改。

---

## 1. 运营商按 `operatorCode` 模糊查询

**位置**：`OperatorServiceImpl.buildQueryWrapper`

**现状**：仅支持按 `operatorName` 模糊 + `status` 筛选，**不支持 `operatorCode`**。

**期望**：补充对 `operatorCode` 的模糊查询，与 `operatorName` 同级。

**建议改法**：
```java
private LambdaQueryWrapper<Operator> buildQueryWrapper(OperatorBo bo) {
    LambdaQueryWrapper<Operator> lqw = Wrappers.lambdaQuery();
    lqw.like(StringUtils.isNotBlank(bo.getOperatorName()), Operator::getOperatorName, bo.getOperatorName());
    lqw.like(StringUtils.isNotBlank(bo.getOperatorCode()), Operator::getOperatorCode, bo.getOperatorCode());  // 新增
    lqw.eq(StringUtils.isNotBlank(bo.getStatus()), Operator::getStatus, bo.getStatus());
    lqw.orderByDesc(Operator::getCreateTime);
    return lqw;
}
```

> 前端影响：补齐后，运营商管理查询区可增加「运营商编码」筛选项。

---

## 2. 码号(Profile)详情返回 `operatorId`

**位置**：`ProfileVo`、设备详情返回的 profile 行数据

**现状**：`ProfileVo` 已通过关联带出 `operatorCode`、`operatorName`，但**没有 `operatorId`**。

**期望**：在 profile 详情/设备详情返回的 profile 数据里补充 `operatorId` 字段（来自 profile 表的运营商外键）。

```java
// ProfileVo 建议新增（与 operatorCode/operatorName 同组）
@TableField(exist = false)
private Long operatorId;
```

> 前端影响：设备详情「启用码号」流程会根据 `operatorId` 拉取该运营商下的 APN 列表（调 `/manager/apn/by-operator/{operatorId}`）并弹出 APN 同步确认弹窗。当前因 profile 行无 `operatorId`，该弹窗**不会弹出**（前端降级为跳过），补齐后自动启用。

---

## 3. 批量导入运营商失败明细返回 `operatorCode`

**位置**：`OperatorImportFailItem`

**现状**：失败明细只含 `operatorName` + `failReason`，**无 `operatorCode`**。

**期望**：失败明细补充 `operatorCode` 字段。

```java
// OperatorImportFailItem 建议新增
private String operatorCode;
```

并在 `OperatorServiceImpl.importOperator` 收集失败项时带上编码：
```java
failList.add(new OperatorImportFailItem(
    item.getOperatorCode(),   // 新增
    name,
    e.getMessage()
));
```

> 前端影响：运营商批量导入弹窗的失败明细表会展示「运营商编码」列。当前因后端未返回该字段，该列降级显示 `--`，补齐后自动展示。

---

## 附：本次后端已完成（核对无误，无需改动）

- ✅ `OperatorBo`/`OperatorVo` 新增 `operatorCode`（唯一校验、必填）
- ✅ `ApnBo`/`ApnVo`/`ApnChangeBo` 运营商改外键 `operatorId`，VO 关联带出 `operatorCode`/`operatorName`
- ✅ APN 按运营商查询接口 `/manager/apn/by-operator/{operatorId}`（替代旧 `by-carrier/{carrierCode}`）
- ✅ APN 查询 `buildQueryWrapper` 已支持按 `operatorId` 筛选
