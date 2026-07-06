import type { PageQuery } from '#/api/common';

/** 码号状态 */
export type ProfileCodeStatus =
  | 'IDLE'
  | 'DOWNLOADED'
  | 'LOCKED'
  | 'RECYCLABLE'
  | 'UNRECYCLABLE';

/** 入池状态 */
export type ProfilePoolEntryStatus = 'POOLED' | 'UNPOOLED';

/** 入池/出池/回收可用数量查询动作 */
export type ProfilePoolAction = 'POOL_IN' | 'POOL_OUT' | 'RECYCLE';

/** 导入状态 */
export type ProfileImportStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR';

/** 码号台账列表项 */
export interface ProfileLedgerVo {
  id: number | string;
  tenantId?: string;
  tenantName?: string;
  productionBatch?: string;
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  operatorId?: number;
  operatorName?: string;
  resourceSource?: string;
  codeStatus?: ProfileCodeStatus | string;
  codeStatusText?: string;
  downloadUser?: string;
  downloadedTime?: string;
  poolStatus?: ProfilePoolEntryStatus | string;
  poolStatusText?: string;
  assignUser?: string;
  assignedTime?: string;
  createByName?: string;
  createTime?: string;
}

/** 码号台账列表查询 */
export interface ProfileLedgerQuery extends PageQuery {
  tenantId?: string;
  tenantName?: string;
  productionBatch?: string;
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  operatorId?: number;
  resourceSource?: string;
  codeStatus?: string;
  downloadUser?: string;
  beginDownloadTime?: string;
  endDownloadTime?: string;
  poolStatus?: string;
  assignUser?: string;
  beginAssignTime?: string;
  endAssignTime?: string;
  createByName?: string;
  beginCreateTime?: string;
  endCreateTime?: string;
}

/** 新增码号 */
export interface ProfileCreateBo {
  accode: string;
  iccid: string;
  msisdn: string;
  imsi: string;
  operatorId: number;
  resourceSource: string;
}

/** 批量入池 */
export interface ProfilePoolInBo {
  tenantId: string;
  operatorId?: number;
  size: number;
  remark?: string;
}

/** 批量出池 */
export interface ProfilePoolOutBo {
  tenantId: string;
  operatorId?: number;
  size: number;
  remark?: string;
}

/** 批量回收（按数量） */
export interface ProfilePoolRecycleBo {
  tenantId: string;
  operatorId?: number;
  size: number;
  remark?: string;
}

/** 批量回收（按选中） */
export interface ProfilePoolRecycleSelectedBo {
  profileIds: Array<number | string>;
  remark?: string;
}

/** 可用数量查询 */
export interface ProfilePoolAvailableQuery {
  action: ProfilePoolAction;
  tenantId: string;
  operatorId?: number;
}

/** 导入记录 */
export interface ProfileImportLogVo {
  id: number | string;
  importBatch?: string;
  status?: ProfileImportStatus | string;
  statusText?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  operatorId?: number;
  operatorName?: string;
  startTime?: string;
  endTime?: string;
}

/** 导入记录查询 */
export interface ProfileImportLogQuery extends PageQuery {
  importBatch?: string;
  operatorName?: string;
  status?: string;
  beginStartTime?: string;
  endStartTime?: string;
  beginEndTime?: string;
  endEndTime?: string;
}
