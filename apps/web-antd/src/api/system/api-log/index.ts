import type { ApiLogQuery, ApiLogVO } from './model';

import type { ID, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  list = '/manager/api/log/list',
  export = '/manager/api/log/export',
  root = '/manager/api/log',
}

/** 接口调用日志列表 */
export function apiLogList(params?: ApiLogQuery) {
  return alovaInstance.get<PageResult<ApiLogVO>>(Api.list, { params });
}

/** 日志详情 */
export function apiLogDetail(id: ID) {
  return alovaInstance.get<ApiLogVO>(`${Api.root}/${id}`);
}

/** 导出接口调用日志 */
export function apiLogExport(data: Record<string, any>) {
  return commonExport(Api.export, data);
}
