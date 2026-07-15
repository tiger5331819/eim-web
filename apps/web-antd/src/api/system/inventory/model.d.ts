import type { ID, PageQuery } from '#/api/common';

/** 库存列表项 */
export interface EuiccInventoryVo {
  id?: ID;
  importBatch?: string;
  eid?: string;
  seedNo?: string;
  cardVendor?: string;
  createTime?: string;
  createBy?: number;
  createByName?: string;
  assigned?: boolean;
  assignedText?: string;
  assignedTenantId?: string;
  assignedTenantName?: string;
  assignedUser?: string;
  assignedTime?: string;
}

/** 库存列表筛选 */
export interface EuiccInventoryQuery extends PageQuery {
  importBatch?: string;
  eid?: string;
  seedNo?: string;
  cardVendor?: string;
  beginCreateTime?: string;
  endCreateTime?: string;
  createByName?: string;
  assigned?: string;
  assignedTenantId?: string;
  assignedUser?: string;
  beginAssignedTime?: string;
  endAssignedTime?: string;
}

/** 手动入库 */
export interface EuiccInventoryAddBo {
  eid: string;
  seedNo?: string;
  cardVendor: string;
}

/** 行分配 */
export interface EuiccAssignOneBo {
  tenantId: string;
  remark?: string;
}

/** 批量分配 */
export interface EuiccAssignBatchBo {
  tenantId: string;
  cardVendor?: string;
  inventoryIds?: ID[];
  size?: number;
  remark?: string;
}

/** 批量回收 */
export interface EuiccRecycleBo {
  changeNo: string;
  tenantId: string;
  size: number;
  remark?: string;
}

/** 批量回收-分配记录（/manager/inventory/assign/records） */
export interface EuiccAssignRecordVo {
  changeNo?: string;
  /** 源租户 ID（回收提交必填；文档 VO 可能未声明） */
  tenantId?: string;
  tenantName?: string;
  /** 分配数量 */
  totalCount?: number;
  /** 可回收数量 */
  recyclableCount?: number;
  operateTime?: string;
}

/** 分配记录查询 */
export interface EuiccAssignRecordQuery {
  /** 租户 ID（文档要求必填，实际支持不传查全部） */
  tenantId?: string;
  changeNo?: string;
}

/** 入库记录 */
export interface EuiccInventoryImportLogVo {
  id?: ID;
  importBatch?: string;
  status?: string;
  statusText?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  operatorId?: number;
  operatorName?: string;
  startTime?: string;
  endTime?: string;
}

/** 入库记录筛选 */
export interface EuiccInventoryImportLogQuery extends PageQuery {
  importBatch?: string;
  status?: string;
  operatorName?: string;
  beginStartTime?: string;
  endStartTime?: string;
  beginEndTime?: string;
  endEndTime?: string;
}
