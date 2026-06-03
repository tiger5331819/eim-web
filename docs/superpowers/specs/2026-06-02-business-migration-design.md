# 前端页面迁移设计文档

## 概述

将旧前端项目（`C:\Users\yanfa\Desktop\esim.eim.web-main`）的 4 个业务模块迁移到新前端框架（`d:\Project\esim.eim.web`，基于 Vben Admin v5.7 + Ant Design Vue 4）。

**迁移策略**：组件映射迁移法（方案 A），逐模块由简到繁迁移，功能复刻 + 体验升级。

**迁移顺序**：任务列表 → 卡入库管理 → Profile来源管理 → 设备管理

## 技术栈对比

| 维度 | 旧项目 | 新项目 |
|------|--------|--------|
| 框架 | Vue 3.2 + Element Plus | Vue 3.5 + Ant Design Vue 4 |
| 架构 | RuoYi-Vue-Plus 单体 | Vben Admin v5.7 Monorepo |
| 构建 | Vite 4 | Vite 8 + Turborepo |
| 表格 | el-table + 自定义 Pagination | VXE Table（内置分页） |
| 表单 | el-form + rules | VbenForm + Zod schema |
| 弹窗 | el-dialog | a-modal / a-drawer |
| 上传 | el-upload | a-upload-dragger |
| 请求 | 自封装 Axios | @vben/request (Axios 封装) |
| 路由 | 后端动态菜单 | 后端动态路由（backend 模式） |
| 选择器 | el-select (远程) | ApiSelect (Vben 内置) |
| 状态标签 | dict-tag 组件 | a-tag + 字典 hooks |

## 目录结构

```
apps/web-antd/src/
├── api/
│   ├── core/                        # 已有
│   ├── business/                    # 新增：业务模块 API
│   │   ├── profile/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── card-import/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── device/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   └── task/
│   │       ├── index.ts
│   │       └── types.ts
│   └── shared/                      # 新增：跨模块共享
│       └── hooks/
│           └── useBusinessDict.ts
│
├── router/routes/modules/
│   └── business.ts                  # 业务静态兜底路由
│
└── views/
    └── business/                    # 新增：业务页面
        ├── profile/
        │   ├── index.vue
        │   └── components/
        │       ├── resource-allocation.vue
        │       ├── batch-import.vue
        │       └── apn-modal.vue
        ├── card-import/
        │   ├── index.vue
        │   └── components/
        │       ├── card-allocation.vue
        │       └── batch-import.vue
        ├── device/
        │   ├── index.vue
        │   └── components/
        │       ├── device-detail-drawer.vue
        │       ├── basic-tab.vue
        │       ├── operation-tab.vue
        │       ├── eim-tab.vue
        │       ├── download-modal.vue
        │       ├── change-eim-modal.vue
        │       ├── batch-download.vue
        │       ├── batch-import.vue
        │       └── apn-modal.vue
        └── task/
            └── index.vue
```

## 组件映射与交互升级

| 旧项目 (Element Plus) | 新项目 (Ant Design Vue + Vben) | 体验升级点 |
|---|---|---|
| el-table + Pagination | VXE Table | 内置分页/排序/筛选，虚拟滚动 |
| el-form + rules | VbenForm + Zod | 声明式表单，类型安全验证 |
| el-dialog | a-modal / a-drawer | 设备详情用 Drawer |
| el-select (远程搜索) | ApiSelect | 内置远程搜索 |
| el-upload | a-upload-dragger | 拖拽上传 + 进度反馈 |
| dict-tag | a-tag + 字典 hooks | 字典逻辑内聚 |
| el-progress | a-progress + 轮询 | 实时进度动画 |
| el-tabs | a-tabs (Drawer 内) | Drawer 内 Tab 切换 |
| localStorage 传参 | 路由 query / props | 更可靠的状态传递 |

## 各模块设计

### 1. 任务列表

**文件**：`views/business/task/index.vue`

- VXE Table 展示任务列表，进度列用 `a-progress`
- 状态列用 `a-tag` 按 state 自动着色（0=待处理/1=进行中/2=已完成/3=失败）
- 取消任务：选中行 → 点击按钮 → `a-popconfirm` 确认 → 调用 DELETE 接口
- 仅 state==0 的行可被选中

**API**：`api/business/task/`
- `getTaskList(params)` — GET `/manager/device/task/list`
- `cancelTask(ids)` — DELETE `/manager/device/task/{ids}`

### 2. 卡入库管理

**主页面**：`views/business/card-import/index.vue`
- VbenForm 搜索（支持展开/收起），字段：EID、ICCID、运营商、企业、项目、分配状态
- VXE Table 展示卡信息列表

**子组件**：
- `card-allocation.vue` — a-modal + VbenForm，选择批次/项目/分配数量，实时展示可分配数
- `batch-import.vue` — a-upload-dragger 拖拽上传 .xlsx，展示导入结果

**API**：`api/business/card-import/`（10 个接口，见完整清单）

**字典 hooks**：`useBusinessDict()` 提供运营商/企业/项目/批次/制卡商/租户字典

### 3. Profile来源管理

**主页面**：`views/business/profile/index.vue`
- VbenForm 搜索：DP+来源、ICCID、EID、state、企业、项目、分配状态、下号状态
- VXE Table 展示 profile 列表
- 操作按钮：同步数据、资源分配、批量导入

**子组件**：
- `resource-allocation.vue` — a-modal + VbenForm，选择批次/项目/分配数量
- `batch-import.vue` — 同卡入库的批量导入模式
- `apn-modal.vue` — a-modal + ApiSelect 远程搜索 APN

**API**：`api/business/profile/`（6 个接口）

### 4. 设备管理（最复杂）

**主页面**：`views/business/device/index.vue`
- VbenForm 搜索：EID、ICCID、在线状态、EIM、企业、项目
- VXE Table + 多选模式 + 批量操作工具栏
- 操作：替换EIM、批量下载资源、导入分配资源

**设备详情**：`device-detail-drawer.vue` — 大型 Drawer (width 75%)
- **基本信息 Tab** (`basic-tab.vue`)：设备信息展示 + 业务号列表（启用/停用/删除/APN更新/下载业务号）
- **运营信息 Tab** (`operation-tab.vue`)：a-timeline 展示操作日志
- **EIM LIST Tab** (`eim-tab.vue`)：EIM 表格 + 新增/编辑/删除/替换

**其他子组件**：
- `download-modal.vue` — 下载业务号弹窗，4 种方式（默认/QR码输入/QR码图片/运营商资源选择）
- `change-eim-modal.vue` — 替换 EIM 表单（公钥/证书两种认证方式）
- `batch-download.vue` — 批量下载，选批次/数量/是否启用，轮询进度
- `batch-import.vue` — 批量导入分配资源
- `apn-modal.vue` — APN 更新弹窗

**API**：`api/business/device/`（24 个接口）

**数据流**：
- 点击设备行 → 打开 Drawer → 按 Tab 懒加载数据
- 多选设备 → 批量下载弹窗 → 选批次/数量 → 执行 → 轮询进度 → 完成跳转任务列表

## 跨模块共享

### useBusinessDict hooks

替代旧项目 `cardImport/hooks/useGetDict.ts`，提供响应式业务字典数据：

- `getProviderDict()` — 运营商列表
- `getCardProviderDict()` — 制卡商列表
- `getCompanyDict()` — 企业列表
- `getProjectDict(companyId)` — 项目列表（级联）
- `getBatchDict()` — 批次列表
- `getTenantDict()` — 租户列表

### APN 共享

APN 相关接口和选择组件被 profile 和 device 模块共用，APN 弹窗组件各自独立但模式统一。

## 路由设计

采用后端动态路由模式，业务页面的菜单和路由由后端返回。仅需在前端 `router/routes/modules/business.ts` 中定义静态兜底路由（如设备详情等特殊页面，作为冗余）。

## 迁移步骤

1. **Phase 0**：创建目录结构和共享 hooks
2. **Phase 1**：任务列表（最简单，验证整体模式）
3. **Phase 2**：卡入库管理
4. **Phase 3**：Profile来源管理
5. **Phase 4**：设备管理（最复杂）

每个 Phase 内部按：API 层 + 类型定义 → 主列表页 → 子组件 顺序实施。
