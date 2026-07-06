import type {
  TenantLicenseAddBo,
  TenantLicenseAdjustBo,
  TenantLicenseFreezeQuery,
  TenantLicenseFreezeVo,
  TenantLicenseQuery,
  TenantLicenseRecordQuery,
  TenantLicenseRecordVo,
  TenantLicenseStatusBo,
  TenantLicenseVo,
} from './model';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/license',
  add = '/manager/license/add',
  adjust = '/manager/license/adjust',
  status = '/manager/license/status',
  record = '/manager/license/record',
  recordExport = '/manager/license/record/export',
  freeze = '/manager/license/freeze',
  my = '/manager/license/my',
  tenantList = '/manager/license/tenant/list',
  tenantExport = '/manager/license/tenant/export',
}

/** 查询指定租户 License 余额 */
export function getLicense(tenantId: string) {
  return alovaInstance.get<TenantLicenseVo>(`${Api.root}/${tenantId}`);
}

/** 查询当前租户自己的 License 余额 */
export function getMyLicense() {
  return alovaInstance.get<TenantLicenseVo>(Api.my);
}

/** 平台 License 管理分页列表 */
export function licenseTenantList(params?: TenantLicenseQuery) {
  return alovaInstance.get<PageResult<TenantLicenseVo>>(Api.tenantList, {
    params,
  });
}

/** 平台 License 管理导出 */
export function licenseTenantExport(data: Record<string, any>) {
  return commonExport(Api.tenantExport, data);
}

/** 添加 License 次数 */
export function addLicense(data: TenantLicenseAddBo) {
  return alovaInstance.postWithMsg<void>(Api.add, data);
}

/** 管理员调整 License 额度 */
export function adjustLicense(data: TenantLicenseAdjustBo) {
  return alovaInstance.postWithMsg<void>(Api.adjust, data);
}

/** 启用/停用租户 License */
export function toggleLicenseStatus(data: TenantLicenseStatusBo) {
  return alovaInstance.putWithMsg<void>(Api.status, data);
}

/** 分页查询 License 变更流水 */
export function licenseRecordList(params?: TenantLicenseRecordQuery) {
  return alovaInstance.get<PageResult<TenantLicenseRecordVo>>(Api.record, {
    params,
  });
}

/** 导出 License 变更流水 */
export function licenseRecordExport(data: Record<string, any>) {
  return commonExport(Api.recordExport, data);
}

/** 分页查询 License 冻结记录 */
export function licenseFreezeList(params?: TenantLicenseFreezeQuery) {
  return alovaInstance.get<PageResult<TenantLicenseFreezeVo>>(Api.freeze, {
    params,
  });
}
