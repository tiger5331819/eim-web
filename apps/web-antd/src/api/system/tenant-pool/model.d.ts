import type { PageQuery } from '#/api/common';

/** 租户池列表项 */
export interface TenantPoolVo {
  tenantId?: string;
  tenantName?: string;
  idle?: number;
  downloaded?: number;
  locked?: number;
  recyclable?: number;
  unrecyclable?: number;
  total?: number;
}

/** 租户池列表查询 */
export interface TenantPoolQuery extends PageQuery {
  tenantName?: string;
}

/** 租户码号明细 */
export interface TenantPoolDetailVo {
  id?: number | string;
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  operatorId?: number;
  operatorName?: string;
  codeStatus?: string;
  codeStatusText?: string;
  assignUser?: string;
  assignedTime?: string;
  downloadedTime?: string;
  createByName?: string;
  createTime?: string;
}

/** 租户码号池运营商列表查询 */
export interface TenantPoolOperatorQuery {
  tenantId?: string;
}

/** 租户码号明细查询 */
export interface TenantPoolDetailQuery extends PageQuery {
  tenantId?: string;
  accode?: string;
  iccid?: string;
  msisdn?: string;
  operatorId?: number;
  codeStatus?: string;
  assignUser?: string;
  beginAssignTime?: string;
  endAssignTime?: string;
  beginDownloadTime?: string;
  endDownloadTime?: string;
}
