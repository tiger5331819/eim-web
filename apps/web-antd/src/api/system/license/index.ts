import type {
  TenantLicenseAddBO,
  TenantLicenseAdjustBO,
  TenantLicenseFreezeQuery,
  TenantLicenseFreezeVO,
  TenantLicenseRecordQuery,
  TenantLicenseRecordVO,
  TenantLicenseStatusBO,
  TenantLicenseVO,
} from './model';
import type { PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/license',
  add = '/manager/license/add',
  adjust = '/manager/license/adjust',
  status = '/manager/license/status',
  record = '/manager/license/record',
  freeze = '/manager/license/freeze',
  my = '/manager/license/my',
}

/** 查询指定租户 License 余额（管理员用） */
export function getLicense(tenantId: string) {
  return alovaInstance.get<TenantLicenseVO>(`${Api.root}/${tenantId}`);
}

/** 查询当前租户自己的 License 余额（普通租户用） */
export function getMyLicense() {
  return alovaInstance.get<TenantLicenseVO>(Api.my);
}

/** 添加 License 次数 */
export function addLicense(data: TenantLicenseAddBO) {
  return alovaInstance.postWithMsg<void>(Api.add, data);
}

/** 管理员调整 License 次数（增加/扣减） */
export function adjustLicense(data: TenantLicenseAdjustBO) {
  return alovaInstance.postWithMsg<void>(Api.adjust, data);
}

/** 启用/停用租户 License */
export function toggleLicenseStatus(data: TenantLicenseStatusBO) {
  return alovaInstance.putWithMsg<void>(Api.status, data);
}

/** 分页查询 License 变更流水 */
export function licenseRecordList(params?: TenantLicenseRecordQuery) {
  return alovaInstance.get<PageResult<TenantLicenseRecordVO>>(Api.record, {
    params,
  });
}

/** 分页查询 License 冻结记录 */
export function licenseFreezeList(params?: TenantLicenseFreezeQuery) {
  return alovaInstance.get<PageResult<TenantLicenseFreezeVO>>(Api.freeze, {
    params,
  });
}
