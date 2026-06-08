export interface TaskQuery {
  pageNum?: number;
  pageSize?: number;
  state?: number;
  operatorUser?: string;
  startCreationTime?: string;
  endCreationTime?: string;
}

export interface TaskVO {
  id: string;
  iccid: string;
  eid: string;
  downloadRate: number;
  creationTime: string;
  state: number;
  operatorTime: string;
  operatorUser: string;
  [key: string]: any;
}
