export interface Tenant {
  accountCount: number;
  address?: string;
  companyName: string;
  contactPhone: string;
  contactUserName: string;
  domain?: string;
  expireTime?: string;
  id: number;
  intro: string;
  licenseNumber?: any;
  packageId: string;
  remark?: string;
  status: string;
  tenantId: string;
}

/** eIM 租户列表返回 VO */
export interface EimTenantVo {
  id: number;
  tenantId: string;
  companyName: string;
  contactUserName: string;
  contactPhone: string;
  domain: string;
  address: string;
  licenseNumber: string;
  intro: string;
  remark: string;
  packageId: number;
  expireTime: string;
  accountCount: number;
  status: string;
  adminAccount: string;
  userCount: number;
  licenseBalance: number;
}

/** eIM 新增租户 BO */
export interface EimTenantAddBo {
  companyName: string;
  contactUserName: string;
  contactPhone: string;
  username: string;
  password: string;
  packageId: number;
  expireTime?: string;
  accountCount?: number;
  domain?: string;
  address?: string;
  licenseNumber?: string;
  intro?: string;
  remark?: string;
}

/** eIM 编辑租户 BO */
export interface EimTenantEditBo {
  id: number;
  companyName: string;
  contactUserName: string;
  contactPhone: string;
  packageId?: number;
  expireTime?: string;
  accountCount?: number;
  domain?: string;
  address?: string;
  licenseNumber?: string;
  intro?: string;
  remark?: string;
}

/** eIM License 调整 BO */
export interface EimTenantLicenseAdjustBo {
  tenantId: number;
  delta: number;
  remark: string;
}
