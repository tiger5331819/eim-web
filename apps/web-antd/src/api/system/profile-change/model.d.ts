import type { PageQuery } from '#/api/common';

/** 变动类型 */
export type ProfileChangeType = 'POOL_IN' | 'POOL_OUT' | 'RECYCLE' | 'DELETE';

/** 变动记录 */
export interface ProfileChangeLogVo {
  id?: number | string;
  changeNo?: string;
  changeTenantId?: string;
  changeTenantName?: string;
  changeCount?: number;
  changeType?: ProfileChangeType | string;
  changeTypeText?: string;
  operatorId?: number;
  operatorName?: string;
  operateTime?: string;
}

/** 变动记录查询 */
export interface ProfileChangeLogQuery extends PageQuery {
  changeNo?: string;
  changeType?: string;
  changeTenantId?: string;
  changeTenantName?: string;
  operatorName?: string;
  beginOperateTime?: string;
  endOperateTime?: string;
}

/** 变动快照 / 变动明细 */
export interface ProfileChangeSnapshotVo {
  id?: number | string;
  /** 快照号（变动编号-序号） */
  snapshotNo?: string;
  changeNo?: string;
  changeType?: ProfileChangeType | string;
  changeTypeText?: string;
  changeTenantId?: string;
  changeTenantName?: string;
  productionBatch?: string;
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  operatorId?: number;
  operatorName?: string;
  resourceSource?: string;
  codeStatus?: string;
  codeStatusText?: string;
  tenantIdSnap?: string;
  tenantNameSnap?: string;
}

/** 变动快照 / 变动明细查询 */
export interface ProfileChangeSnapshotQuery extends PageQuery {
  changeNo?: string;
  /** 快照号 */
  snapshotNo?: string;
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  codeStatus?: string;
  operatorId?: number;
  changeType?: string;
  changeTenantId?: string;
  productionBatch?: string;
  resourceSource?: string;
}
