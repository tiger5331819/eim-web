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
  dpSource: string;
  iccid: string;
  imsi: string;
  isdpAid: string;
  eid: string;
  nick: string;
  profileClass: string;
  type: string;
  providerName: string;
  state: string;
  createTime: string;
  updateTime: string;
  carrierName: string;
  productionBatch: string;
  assignedState: string;
  companyName: string;
  projectName: string;
  installedState: string;
}

export interface AllocationForm {
  productionBatch?: string; //   批次
  projectId?: string; // 归属项目
  size?: number; //    数量
}
