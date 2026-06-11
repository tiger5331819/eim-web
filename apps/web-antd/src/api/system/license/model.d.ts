import type { PageQuery } from '#/api/common';

/** 租户 License 余额视图对象 */
export interface TenantLicenseVO {
  id: number;
  tenantId: string;
  totalQuota: number;       // 累计添加次数
  usedQuota: number;        // 已确认扣减次数
  frozenQuota: number;      // 冻结中次数
  availableQuota: number;   // 可用次数
  status: '0' | '1';        // 0 正常 1 停用
  remark?: string;
}

/** License 变更流水视图对象 */
export interface TenantLicenseRecordVO {
  id: number;
  tenantId: string;
  changeType: string;       // ADD/ADJUST/FREEZE/CONFIRM/RELEASE/EXPIRE
  changeQuota: number;      // 本次变更数量（正数加 负数减）
  beforeAvailable: number;
  afterAvailable: number;
  bizType?: string;         // 业务类型（如 download）
  bizId?: string;           // 业务 ID（如 task id）
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createTime: string;
}

/** License 冻结记录视图对象 */
export interface TenantLicenseFreezeVO {
  id: number;
  tenantId: string;
  taskId: string;
  profileId?: string;
  iccid?: string;
  freezeQuota: number;
  status: string;           // FROZEN/CONFIRMED/RELEASED/EXPIRED
  freezeTime: string;
  confirmTime?: string;
  releaseTime?: string;
  expireTime?: string;
  remark?: string;
  createTime: string;
}

/** 添加 License 次数请求体 */
export interface TenantLicenseAddBO {
  tenantId: string;
  quota: number;
  remark?: string;
}

/** 调整 License 次数请求体（管理员） */
export interface TenantLicenseAdjustBO {
  tenantId: string;
  delta: number;            // 正数增加，负数扣减
  remark: string;
}

/** 切换 License 状态请求体 */
export interface TenantLicenseStatusBO {
  tenantId: string;
  status: '0' | '1';
}

/** 变更流水查询参数 */
export interface TenantLicenseRecordQuery extends PageQuery {
  tenantId?: string;
  changeType?: string;
}

/** 冻结记录查询参数 */
export interface TenantLicenseFreezeQuery extends PageQuery {
  tenantId?: string;
  status?: string;
}
