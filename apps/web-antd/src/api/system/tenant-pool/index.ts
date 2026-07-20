import type {
  TenantPoolDetailQuery,
  TenantPoolDetailVo,
  TenantPoolOperatorQuery,
  TenantPoolQuery,
  TenantPoolVo,
} from './model';

import type { OperatorVo } from '#/api/system/operator/model';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  detail = '/manager/profile/pool/tenant/detail',
  detailExport = '/manager/profile/pool/tenant/detail/export',
  export = '/manager/profile/pool/tenant/export',
  list = '/manager/profile/pool/tenant/list',
  operatorList = '/manager/profile/pool/tenant/operator/list',
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

/** 查询指定租户码号池中的运营商列表（供筛选下拉使用） */
export function tenantPoolOperatorList(params?: TenantPoolOperatorQuery) {
  return alovaInstance.get<OperatorVo[]>(Api.operatorList, { params });
}

/** 租户码号池运营商下拉选项 */
export async function getTenantPoolOperatorOptions(
  params?: TenantPoolOperatorQuery,
) {
  const list = await tenantPoolOperatorList(params);
  return (list || []).map((item) => ({
    label: item.operatorName,
    value: String(item.id),
  }));
}
