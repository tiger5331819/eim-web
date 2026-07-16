/**
 * @description 租户套餐（旧，保留兼容）
 */
export interface TenantPackage {
  packageId: string;
  packageName: string;
  menuIds: number[] | string;
  remark: string;
  menuCheckStrictly: boolean;
  status: string;
}

/** eIM 租户套餐列表 VO */
export interface EimTenantPackageVo {
  /** 雪花 ID，必须用字符串避免精度丢失 */
  packageId: string;
  packageName: string;
  menuIds?: string;
  remark?: string;
  menuCheckStrictly?: boolean;
  status: string;
  /** 绑定租户数 */
  tenantCount?: number;
  createTime?: string;
  createByName?: string;
}

/** eIM 租户套餐新增/编辑 BO */
export interface EimTenantPackageBo {
  packageId?: string;
  packageName: string;
  remark?: string;
  menuIds?: number[];
  menuCheckStrictly?: boolean;
  status?: string;
}

/** eIM 租户套餐状态切换 BO */
export interface EimTenantPackageStatusBo {
  packageId: string;
  status: string;
}
