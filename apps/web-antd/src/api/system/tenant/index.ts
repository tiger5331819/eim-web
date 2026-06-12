import type { Tenant } from './model';
import type {
  EimTenantAddBo,
  EimTenantEditBo,
  EimTenantLicenseAdjustBo,
  EimTenantVo,
} from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

// ============ 旧 API（保留兼容） ============

enum Api {
  dictSync = '/system/tenant/syncTenantDict',
  root = '/system/tenant',
  tenantDynamic = '/system/tenant/dynamic',
  tenantDynamicClear = '/system/tenant/dynamic/clear',
  tenantExport = '/system/tenant/export',
  tenantList = '/system/tenant/list',
  tenantStatus = '/system/tenant/changeStatus',
  tenantSyncPackage = '/system/tenant/syncTenantPackage',
}

/** 查询租户分页列表（旧） */
export function tenantList(params?: PageQuery) {
  return alovaInstance.get<Tenant[]>(Api.tenantList, { params });
}

/** 租户导出（旧） */
export function tenantExport(data: Partial<Tenant>) {
  return commonExport(Api.tenantExport, data);
}

/** 查询租户信息（旧） */
export function tenantInfo(id: ID) {
  return alovaInstance.get<Tenant>(`${Api.root}/${id}`);
}

/** 新增租户（旧） */
export function tenantAdd(data: Partial<Tenant>) {
  return alovaInstance.postWithMsg<void>(Api.root, data, { encrypt: true });
}

/** 租户更新（旧） */
export function tenantUpdate(data: Partial<Tenant>) {
  return alovaInstance.putWithMsg<void>(Api.root, data);
}

/** 租户状态更新（旧） */
export function tenantStatusChange(data: Partial<Tenant>) {
  const requestData = {
    id: data.id,
    tenantId: data.tenantId,
    status: data.status,
  };
  return alovaInstance.putWithMsg(Api.tenantStatus, requestData);
}

/** 租户删除（旧） */
export function tenantRemove(ids: IDS) {
  return alovaInstance.deleteWithMsg(`${Api.root}/${ids}`);
}

/** 动态切换租户（旧） */
export function tenantDynamicToggle(tenantId: string) {
  return alovaInstance.get<void>(`${Api.tenantDynamic}/${tenantId}`);
}

/** 清除动态切换租户（旧） */
export function tenantDynamicClear() {
  return alovaInstance.get<void>(Api.tenantDynamicClear);
}

/** 租户套餐同步（旧） */
export function tenantSyncPackage(tenantId: string, packageId: string) {
  return alovaInstance.get<void>(Api.tenantSyncPackage, {
    params: { packageId, tenantId },
    successMessageMode: 'message',
  });
}

/** 同步租户字典（旧） */
export function dictSyncTenant(tenantId?: string) {
  return alovaInstance.get<void>(Api.dictSync, {
    params: { tenantId },
    successMessageMode: 'message',
  });
}

/** 同步租户配置（旧） */
export function syncTenantConfig() {
  return alovaInstance.get<void>('/system/tenant/syncTenantConfig', {
    successMessageMode: 'message',
  });
}

// ============ eIM 新 API ============

enum EimApi {
  root = '/manager/tenant',
  list = '/manager/tenant/list',
  export = '/manager/tenant/export',
  syncPackage = '/manager/tenant/syncPackage',
  licenseAdjust = '/manager/tenant/license-adjust',
  resetPassword = '/manager/tenant/resetPassword',
}

/** eIM: 分页查询租户列表 */
export function eimTenantList(params?: PageQuery) {
  return alovaInstance.get<PageResult<EimTenantVo>>(EimApi.list, { params });
}

/** eIM: 获取租户详情 */
export function eimTenantInfo(id: ID) {
  return alovaInstance.get<EimTenantVo>(`${EimApi.root}/${id}`);
}

/** eIM: 新增租户 */
export function eimTenantAdd(data: EimTenantAddBo) {
  return alovaInstance.postWithMsg<void>(EimApi.root, data, {
    encrypt: true,
  });
}

/** eIM: 修改租户 */
export function eimTenantUpdate(data: EimTenantEditBo) {
  return alovaInstance.putWithMsg<void>(EimApi.root, data);
}

/** eIM: 删除租户 */
export function eimTenantRemove(ids: IDS) {
  return alovaInstance.deleteWithMsg(`${EimApi.root}/${ids}`);
}

/** eIM: 导出租户列表 */
export function eimTenantExport(data: Record<string, any>) {
  return commonExport(EimApi.export, data);
}

/** eIM: 同步租户套餐权限 */
export function eimTenantSyncPackage(tenantId: number, packageId: number) {
  return alovaInstance.get<void>(EimApi.syncPackage, {
    params: { packageId, tenantId },
    successMessageMode: 'message',
  });
}

/** eIM: 调整 License 余额 */
export function eimTenantLicenseAdjust(data: EimTenantLicenseAdjustBo) {
  return alovaInstance.postWithMsg<void>(EimApi.licenseAdjust, data);
}

/** eIM: 重置管理员密码 */
export function eimTenantResetPassword(id: ID) {
  return alovaInstance.putWithMsg<void>(`${EimApi.resetPassword}/${id}`);
}
