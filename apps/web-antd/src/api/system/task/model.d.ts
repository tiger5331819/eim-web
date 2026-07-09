import type { PageQuery } from '#/api/common';

/** 下载任务状态：-1 失败 / 0 未完成 / 1 已完成 / 2 已取消 */
export type DownloadTaskState = -1 | 0 | 1 | 2;

export interface DownloadTaskQuery extends PageQuery {
  id?: string | number;
  tenantId?: string;
  iccid?: string;
  eid?: string;
  downloadRate?: number;
  state?: DownloadTaskState | number;
  operatorUser?: string;
  startCreationTime?: string;
  endCreationTime?: string;
}

export interface DownloadTaskVo {
  id?: string | number;
  tenantId?: string;
  tenantName?: string;
  iccid?: string;
  eid?: string;
  state?: DownloadTaskState | number;
  downloadRate?: number;
  creationTime?: string;
  operatorTime?: string;
  operatorUser?: string;
  [key: string]: any;
}

export interface DownloadTaskProgressVo {
  downloadRate?: number;
  state?: DownloadTaskState | number;
  iccid?: string;
  [key: string]: any;
}

export interface DownloadTaskResultVo {
  iccid?: string;
  issue?: string;
  country?: string;
  [key: string]: any;
}
