import type { PageQuery } from '#/api/common';

/** 我的 License 余额 */
export interface MyLicenseVo {
  id?: number;
  tenantId?: string;
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

/** 消耗记录（冻结流水） */
export interface MyLicenseFreezeVo {
  id?: number | string;
  tenantId?: string;
  taskId?: string;
  profileId?: string;
  iccid?: string;
  freezeQuota?: number;
  consumeQuota?: number;
  status?: string;
  downloadResult?: string;
  operatorId?: number;
  operatorName?: string;
  operateTime?: string;
  freezeTime?: string;
  confirmTime?: string;
  releaseTime?: string;
  createTime?: string;
  remark?: string;
}

/** 变动记录 */
export interface MyLicenseRecordVo {
  id?: number | string;
  tenantId?: string;
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

/** 消耗记录查询 */
export interface MyLicenseFreezeQuery extends PageQuery {
  id?: number | string;
  taskId?: string;
  operatorName?: string;
  downloadResult?: string;
  beginOperateTime?: string;
  endOperateTime?: string;
}

/** 变动记录查询 */
export interface MyLicenseRecordQuery extends PageQuery {
  recordNo?: string;
  changeType?: string;
  beginChangeTime?: string;
  endChangeTime?: string;
}
