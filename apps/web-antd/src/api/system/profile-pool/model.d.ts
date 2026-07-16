import type { PageQuery } from '#/api/common';

/** 池状态枚举 */
export type ProfilePoolStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'DOWNLOADED'
  | 'RECYCLEABLE';

/** 资源池统计视图对象 */
export interface ProfilePoolStatsVO {
  unassignedCount: number;
  assignedCount: number;
  downloadedCount: number;
  recycleableCount: number;
}

/** 平台总池 → 租户池 分配请求体 */
export interface ProfileAllocateBO {
  productionBatch: string;
  size: number;
  tenantId: string;
  projectId?: string;
}

/** 租户间调配请求体 */
export interface ProfileTransferBO {
  profileId: string;
  fromTenantId: string;
  toTenantId: string;
  toProjectId?: string;
  remark?: string;
}

/** 批量回收请求体 */
export interface ProfileBatchRecycleBO {
  profileIds: string[];
}

/** 调配日志视图对象 */
export interface ProfileAllocationLogVO {
  id: string;
  profileId: string;
  iccid: string;
  fromTenantId?: string;
  toTenantId?: string;
  fromProjectId?: string;
  toProjectId?: string;
  actionType: string;
  beforeStatus?: string;
  afterStatus?: string;
  operatorId?: string;
  operatorName?: string;
  remark?: string;
  createTime: string;
}

/** 调配日志查询 */
export interface ProfileAllocationLogQuery extends PageQuery {
  profileId?: string;
  iccid?: string;
  toTenantId?: string;
  actionType?: string;
}
