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
