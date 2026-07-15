import type { PageQuery } from '#/api/common';

/** 变动类型：分配 / 回收 / 删除 */
export type InventoryChangeType = 'ASSIGN' | 'RECYCLE' | 'DELETE';

/** 变动记录 */
export interface InventoryChangeLogVo {
  id?: number | string;
  changeNo?: string;
  changeType?: InventoryChangeType | string;
  changeTypeText?: string;
  changeCount?: number;
  tenantId?: string;
  tenantName?: string;
  /** 目标/源租户名称 */
  changeTenantName?: string;
  targetTenantId?: string;
  targetTenantName?: string;
  sourceTenantId?: string;
  sourceTenantName?: string;
  remark?: string;
  operatorId?: number;
  operatorName?: string;
  operateTime?: string;
}

/** 变动记录查询 */
export interface InventoryChangeLogQuery extends PageQuery {
  changeNo?: string;
  changeType?: string;
  tenantId?: string;
  operatorName?: string;
  beginOperateTime?: string;
  endOperateTime?: string;
}

/** 变动快照 / 变动明细 */
export interface InventoryChangeSnapshotVo {
  id?: number | string;
  changeNo?: string;
  snapshotNo?: string;
  changeType?: InventoryChangeType | string;
  changeTypeText?: string;
  eid?: string;
  seedNo?: string;
  cardVendor?: string;
  tenantId?: string;
  tenantName?: string;
  changeTenantName?: string;
  /** 操作时间（接口字段 updateTime） */
  updateTime?: string;
  operateTime?: string;
}

/** 变动快照 / 变动明细查询 */
export interface InventoryChangeSnapshotQuery extends PageQuery {
  changeNo?: string;
  snapshotNo?: string;
  eid?: string;
  seedNo?: string;
  cardVendor?: string;
  changeType?: string;
  tenantId?: string;
  beginOperateTime?: string;
  endOperateTime?: string;
}
