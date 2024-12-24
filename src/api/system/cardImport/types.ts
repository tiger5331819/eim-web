import { Pagination } from '@/api/types';

export interface AllocationForm {
  productionBatch?: string; //   批次
  count?: number; // 数量
  projectId?: string; //  项目id
}

export interface CardImportTable {
  eid: string; //    eid
  iccid: string; //  iccid
  eimFqdn: string; //    eim
  cardProviderName: string; //  制卡商
  providerName: string; //   运营商
  productionBatch: string; //    批次
  companyName: string; //    归属企业
  projectName: string; //    归属项目
  [key: string]: any; //   接收后端多余字段
}

export interface QueryFrom extends Pagination {
  eid?: string;
  iccid?: string;
  providerName?: string;
  companyName?: string;
  projectName?: string;
  allocate?: string;
}
