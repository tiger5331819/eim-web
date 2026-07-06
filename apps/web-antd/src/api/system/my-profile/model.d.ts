import type { PageQuery } from '#/api/common';

/** 码号状态：idle 空闲 / downloaded 已下载 / locked 锁定 */
export type MyProfileStatus = 'idle' | 'downloaded' | 'locked';

/** 统计卡片 */
export interface MyProfileStatsVo {
  total?: number;
  idle?: number;
  downloaded?: number;
  locked?: number;
}

/** 我的码号列表项 */
export interface MyProfileListVo {
  id: number | string;
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  operatorId?: number;
  operatorName?: string;
  status?: MyProfileStatus | string;
  statusText?: string;
  eid?: string;
  downloadedTime?: string;
  createTime?: string;
}

/** 删除记录 */
export interface MyProfileDeletedVo {
  id?: number | string;
  profileId?: number;
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  operatorId?: number;
  operatorName?: string;
  eid?: string;
  deleteOperatorId?: number;
  deleteOperatorName?: string;
  deleteTime?: string;
}

/** 我的码号列表查询 */
export interface MyProfileQuery extends PageQuery {
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  operatorId?: number;
  status?: string;
  eid?: string;
}

/** 删除记录查询 */
export interface MyProfileDeletedQuery extends PageQuery {
  accode?: string;
  iccid?: string;
  msisdn?: string;
  imsi?: string;
  operatorId?: number;
  eid?: string;
}
