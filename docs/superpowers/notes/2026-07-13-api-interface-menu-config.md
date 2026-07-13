# 后端菜单配置说明 — API接口 / API管理 / 接口日志

## 接口清单（Swagger tag「API接口」）

### 密钥管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/manager/api/credential/list` | 查询 API 密钥列表 |
| POST | `/manager/api/credential` | 新建密钥 |
| POST | `/manager/api/credential/export` | 导出密钥列表 |
| PUT | `/manager/api/credential/{id}/status?status=` | 切换状态（0启用 / 1停用） |
| PUT | `/manager/api/credential/{id}/reset` | 重置密钥 |
| GET | `/manager/api/credential/{id}/view-secret` | 查看密钥 |
| GET | `/manager/api/credential/{id}/secret?reveal=` | 查看 AppSecret 明文 |
| DELETE | `/manager/api/credential/{ids}` | 删除密钥 |

### 调用日志

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/manager/api/log/list` | 接口调用日志列表 |
| GET | `/manager/api/log/{id}` | 日志详情 |
| POST | `/manager/api/log/export` | 导出接口调用日志 |

## 前端页面

| 栏目 | component | 文件 |
|------|-----------|------|
| API接口（租户侧） | `eim/api-interface/index` | `views/eim/api-interface/index.vue` |
| API管理（平台侧） | `eim/api-management/index` | `views/eim/api-management/index.vue` |
| 接口日志（平台侧） | `eim/api-log/index` | `views/eim/api-log/index.vue` |

> 旧路径 `eim/openapilog/index` 已兼容转发到 `api-log`。

## 建议菜单

| menu_name | 建议挂载 | path | component | perms |
|-----------|----------|------|-----------|-------|
| API接口 | 一级菜单 | `api-interface` | `eim/api-interface/index` | `eim:api:interface:list` |
| API管理 | 平台管理 | `api-management` | `eim/api-management/index` | `eim:api:credential:list` |
| 接口日志 | 平台管理 | `api-log` | `eim/api-log/index` | `eim:api:log:list` |

## 按钮权限码

- `eim:api:credential:list` / `query` / `edit` / `reset` / `export` / `add` / `remove`
- `eim:api:log:list` / `export`
- `eim:api:interface:list`（租户侧页面访问）
