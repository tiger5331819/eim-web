import type {
  EimTenantPackageBo,
  EimTenantPackageStatusBo,
  EimTenantPackageVo,
  TenantPackage,
} from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport, toIdPath } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

// ============ 旧 API（保留兼容） ============

enum Api {
  packageChangeStatus = '/system/tenant/package/changeStatus',
  packageExport = '/system/tenant/package/export',
  packageList = '/system/tenant/package/list',
  packageSelectList = '/system/tenant/package/selectList',
  root = '/system/tenant/package',
}

/** 租户套餐分页列表（旧） */
export function packageListLegacy(params?: PageQuery) {
  return alovaInstance.get<PageResult<TenantPackage>>(Api.packageList, {
    params,
  });
}

// ============ eIM 新 API ============

enum EimApi {
  root = '/manager/tenant/package',
  list = '/manager/tenant/package/list',
  selectList = '/manager/tenant/package/selectList',
  export = '/manager/tenant/package/export',
  changeStatus = '/manager/tenant/package/changeStatus',
}

/** eIM: 分页查询套餐列表 */
export function packageList(params?: PageQuery) {
  return alovaInstance.get<PageResult<EimTenantPackageVo>>(EimApi.list, {
    params,
  });
}

/** eIM: 查询启用套餐下拉列表 */
export function packageSelectList() {
  return alovaInstance.get<EimTenantPackageVo[]>(EimApi.selectList);
}

/** eIM: 导出套餐列表 */
export function packageExport(data: Record<string, any>) {
  return commonExport(EimApi.export, data);
}

/** eIM: 获取套餐详情 */
export function packageInfo(packageId: ID) {
  return alovaInstance.get<EimTenantPackageVo>(
    `${EimApi.root}/${toIdPath(packageId)}`,
  );
}

/** eIM: 新增套餐 */
export function packageAdd(data: EimTenantPackageBo) {
  return alovaInstance.postWithMsg<void>(EimApi.root, data, {
    successMessageMode: 'none',
  });
}

/** eIM: 修改套餐 */
export function packageUpdate(data: EimTenantPackageBo) {
  return alovaInstance.putWithMsg<void>(
    EimApi.root,
    {
      ...data,
      ...(data.packageId != null ? { packageId: String(data.packageId) } : {}),
    },
    {
      successMessageMode: 'none',
    },
  );
}

/** eIM: 切换套餐状态 */
export function packageChangeStatus(data: EimTenantPackageStatusBo) {
  return alovaInstance.putWithMsg<void>(
    EimApi.changeStatus,
    {
      ...data,
      packageId: String(data.packageId),
    },
    {
      successMessageMode: 'none',
    },
  );
}

/** eIM: 删除套餐（ID 必须保持字符串，避免雪花 ID 精度丢失） */
export function packageRemove(packageIds: ID | IDS) {
  return alovaInstance.deleteWithMsg<void>(
    `${EimApi.root}/${toIdPath(packageIds)}`,
    undefined,
    {
      successMessageMode: 'none',
    },
  );
}
