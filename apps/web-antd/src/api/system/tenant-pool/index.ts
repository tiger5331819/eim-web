import type {
  TenantPoolDetailQuery,
  TenantPoolDetailVo,
  TenantPoolQuery,
  TenantPoolVo,
} from './model';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  list = '/manager/profile/tenant-pool/list',
  export = '/manager/profile/tenant-pool/export',
  detail = '/manager/profile/tenant-pool/detail',
  detailExport = '/manager/profile/tenant-pool/detail/export',
}

/** 租户池列表 */
export function tenantPoolList(params?: TenantPoolQuery) {
  return alovaInstance.get<PageResult<TenantPoolVo>>(Api.list, { params });
}

/** 租户汇总导出 */
export function tenantPoolExport(data: Record<string, any>) {
  return commonExport(Api.export, data);
}

/** 租户码号明细列表 */
export function tenantPoolDetailList(params?: TenantPoolDetailQuery) {
  return alovaInstance.get<PageResult<TenantPoolDetailVo>>(Api.detail, {
    params,
  });
}

/** 租户码号明细导出 */
export function tenantPoolDetailExport(data: Record<string, any>) {
  return commonExport(Api.detailExport, data);
}
