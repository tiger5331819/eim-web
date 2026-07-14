import type { PageQuery } from '#/api/common';

/** OpenAPI 调用日志 */
export interface ApiLogVO {
  id: number | string;
  tenantId?: string;
  tenantName?: string;
  userId?: number;
  userName?: string;
  apiName?: string;
  requestMethod?: string;
  requestUri?: string;
  requestIp?: string;
  requestParams?: string;
  requestHeaders?: string;
  responseBody?: string;
  /** true 成功 / false 失败 */
  success?: boolean;
  errorMsg?: string;
  costTime?: number;
  statusCode?: number;
  traceId?: string;
  deviceEid?: string;
  createTime?: string;
  responseTime?: string;
}

export interface ApiLogQuery extends PageQuery {
  tenantId?: string;
  tenantName?: string;
  traceId?: string;
  apiName?: string;
  requestUri?: string;
  requestMethod?: string;
  beginCreateTime?: string;
  endCreateTime?: string;
  beginResponseTime?: string;
  endResponseTime?: string;
  statusCode?: number | string;
  success?: boolean | string | number;
  deviceEid?: string;
  requestParams?: string;
  errorMsg?: string;
}
