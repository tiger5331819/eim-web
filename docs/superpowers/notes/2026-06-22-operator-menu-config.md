# 后端菜单配置说明 — 运营商管理

## 背景

「运营商管理」菜单点击报 404，根因是前端页面缺失（后端 `/manager/operator/*` 接口已存在）。现已新建前端页面 `apps/web-antd/src/views/eim/operator/index.vue`，后端 `system_menu` 表按下表配置 `component` 字段即可自动映射。

后端接口（swagger tag「运营商管理」，前缀 `/manager/operator`）：

- `GET /manager/operator/list` 分页查询
- `GET /manager/operator/{id}` 详情
- `POST /manager/operator` 新增
- `PUT /manager/operator` 修改
- `DELETE /manager/operator/{ids}` 删除
- `POST /manager/operator/export` 导出
- `POST /manager/operator/import` 批量导入

## 菜单配置表

| menu_name | parent_id | order_num | path | component | menu_type | perms | icon |
|---|---|---|---|---|---|---|---|
| 运营商管理 | `Eim-base12050`(基础信息管理) | `1` | `operator` | `eim/base/operator/index` | `C`（菜单） | `eim:operator:list` | `peoples` |

> 后端菜单实际配置已确认（见接口返回）：运营商管理挂在「基础信息管理」(`Eim-base12050`, path `/eim-base`) 下，component 为 `eim/base/operator/index`。前端页面已对齐放置于 `apps/web-antd/src/views/eim/base/operator/index.vue`。

## 按钮权限码

- `eim:operator:add`（新增 + 批量导入按钮）
- `eim:operator:edit`（编辑 + 列表状态开关）
- `eim:operator:remove`（删除）
- `eim:operator:export`（导出）

> 这些权限码需后端在 `system_menu` 表的按钮类型（menu_type=`F`）记录里配置。

## 字段说明

- `component` 值 `eim/operator/index` 对应文件 `apps/web-antd/src/views/eim/operator/index.vue`，由 `import.meta.glob('../views/**/*.vue')` 自动匹配
- `parent_id` 指向运营商管理应归属的一级目录（如「码号资源管理」或独立的「运营商管理」目录，按后端菜单规划）

## 验证方式

1. 后端配置菜单 + 权限并分配给相应角色
2. 登录后点击「运营商管理」→ 列表正常加载
3. 新增/编辑/删除/导出/批量导入/状态开关 均可用

## 备注

「报表管理」404 是前后端都未实现，需后端先提供报表接口与口径，再做前端页面，本次不处理。
