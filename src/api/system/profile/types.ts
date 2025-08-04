import { Pagination } from '@/api/types';

export interface QueryFrom extends Pagination {
  dpSource?: string; // dp+来源
  iccid?: string; // 操作人
  eid?: string; //    操作时间
  state?: string; //   状态
  companyId?: string; //   归属企业
  projectId?: string; //   归属项目
  assigned?: boolean; //   分配状态
  installed?: boolean; //   下号状态
}

export interface ProfileTable {
  dpSource: string; // dp+来源
  iccid: string; //  iccid
  imsi: string; // imsi
  isdpAid: string; //  isdp aid
  eid: string; //  eid
  nick: string; // nickName
  profileClass: string; // profileClass
  type: string; // profileType
  providerName: string; // providerName
  state: string; //  state
  createTime: string; // creatDate
  updateTime: string; // upDate
  carrierName: string; //  运营商
  productionBatch: string; //  批次
  assignedState: string; //  分配状态
  companyName: string; //  归属企业
  projectName: string; //  归属项目
  installedState: string; // 下号状态
}

export interface AllocationForm {
  productionBatch?: string; //   批次
  projectId?: string; // 归属项目
  size?: number; //    数量
}
