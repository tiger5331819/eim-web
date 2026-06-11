import type { PageQuery } from '#/api/common';

/** OpenAPI 调用日志视图对象 */
export interface OpenApiLogVO {
  id: number;
  tenantId?: string;
  userId?: number;
  userName?: string;
  apiName?: string;
  requestMethod?: string;
  requestUri?: string;
  requestIp?: string;
  requestParams?: string;
  responseBody?: string;
  success?: boolean;
  errorMsg?: string;
  costTime?: number;
  traceId?: string;
  createTime: string;
}

export interface OpenApiLogQuery extends PageQuery {
  tenantId?: string;
  userName?: string;
  apiName?: string;
  requestMethod?: string;
  success?: boolean;
  startCreateTime?: string;
  endCreateTime?: string;
}
