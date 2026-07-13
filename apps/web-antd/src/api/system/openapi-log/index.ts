/** @deprecated 请使用 `#/api/system/api-log` */
export {
  apiLogDetail as openApiLogDetail,
  apiLogExport as openApiLogExport,
  apiLogList as openApiLogList,
} from '../api-log';

export type { ApiLogQuery as OpenApiLogQuery, ApiLogVO as OpenApiLogVO } from '../api-log/model';
