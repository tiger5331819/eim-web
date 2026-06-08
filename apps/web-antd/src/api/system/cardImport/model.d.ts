export interface CardImportQuery {
  pageNum?: number;
  pageSize?: number;
  eid?: string;
  iccid?: string;
  providerName?: string;
  companyName?: string;
  projectName?: string;
  allocate?: string;
}

export interface CardImportVO {
  eid: string;
  iccid: string;
  eimFqdn: string;
  cardProviderName: string;
  providerName: string;
  productionBatch: string;
  companyName: string;
  projectName: string;
  [key: string]: any;
}

export interface AllocationForm {
  productionBatch?: string;
  count?: number;
  projectId?: string;
}
