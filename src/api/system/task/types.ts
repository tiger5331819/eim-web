import { Pagination } from '@/api/types';

export interface QueryFrom extends Pagination {
  state?: number; // 任务类型
  operatorUser?: string; // 操作人
  handleTime?: Array<string>; // 操作时间：存数据用
  startCreationTime?: string; //    操作时间
  endCreationTime?: string; //    操作时间
}

export interface TaskTable {
  id: string; //  任务唯一标识
  iccid: string; //    iccid
  eid: string; // eid
  downloadRate: number; //    进度条
  creationTime: string; //  创建时间
  state: number; //    状态
  operatorTime: string; //   操作时间
  operatorUser: string; //  操作人
  [key: string]: any; // 接口多余数据
}
