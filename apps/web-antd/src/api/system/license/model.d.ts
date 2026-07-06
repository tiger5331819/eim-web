import type { PageQuery } from '#/api/common';

/** 租户 License 余额 */
export interface TenantLicenseVo {
  id?: number;
  tenantId?: string;
  tenantName?: string;
  tenantStatus?: string;
  totalQuota?: number;
  usedQuota?: number;
  totalConsumed?: number;
  frozenQuota?: number;
  availableQuota?: number;
  status?: string;
  remark?: string;
  warnStatus?: boolean;
  warnLevel?: 'NORMAL' | 'WARN' | 'LOCKED' | string;
  lastChangeTime?: string;
  todayConsumed?: number;
  monthConsumed?: number;
  lastRechargeTime?: string;
}

/** License 变更流水 */
export interface TenantLicenseRecordVo {
  id?: number | string;
  tenantId?: string;
  tenantName?: string;
  changeType?: string;
  changeTypeText?: string;
  changeQuota?: number;
  beforeAvailable?: number;
  afterAvailable?: number;
  bizType?: string;
  bizId?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createTime?: string;
}

/** License 冻结记录 */
export interface TenantLicenseFreezeVo {
  id?: number;
  tenantId?: string;
  taskId?: string;
  profileId?: string;
  iccid?: string;
  freezeQuota?: number;
  status?: string;
  freezeTime?: string;
  confirmTime?: string;
  releaseTime?: string;
  expireTime?: string;
  remark?: string;
  createTime?: string;
}

/** 平台 License 管理列表查询 */
export interface TenantLicenseQuery extends PageQuery {
  tenantId?: string;
  tenantName?: string;
  tenantStatus?: string;
  warnLevel?: string;
}

/** 变更流水查询 */
export interface TenantLicenseRecordQuery extends PageQuery {
  tenantId?: string;
  tenantName?: string;
  recordNo?: string;
  changeType?: string;
  operatorName?: string;
  beginChangeTime?: string;
  endChangeTime?: string;
}

/** 冻结记录查询 */
export interface TenantLicenseFreezeQuery extends PageQuery {
  tenantId?: string;
  status?: string;
}

/** 添加 License */
export interface TenantLicenseAddBo {
  tenantId: string;
  quota: number;
  remark?: string;
}

/** 额度调整 */
export interface TenantLicenseAdjustBo {
  tenantId: string;
  adjustType: 'RECHARGE' | 'DEDUCT';
  quota: number;
  reason: string;
  remark?: string;
}

/** 切换 License 状态 */
export interface TenantLicenseStatusBo {
  tenantId: string;
  status: '0' | '1';
}
