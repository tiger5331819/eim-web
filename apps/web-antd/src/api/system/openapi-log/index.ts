import type { OpenApiLogQuery, OpenApiLogVO } from './model';
import type { PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  list = '/manager/openapi-log/list',
}

export function openApiLogList(params?: OpenApiLogQuery) {
  return alovaInstance.get<PageResult<OpenApiLogVO>>(Api.list, { params });
}
