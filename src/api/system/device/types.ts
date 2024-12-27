import { Pagination } from '@/api/types';

export interface QueryFrom extends Pagination {
  eid?: string; // eid
  iccid?: string; // 预制种子号
  online?: number; //  在线状态
  eimFqdn?: string; // eimid
  companyId?: string; // 归属企业
  projectId?: string; // 归属项目
}

export interface DeviceTable {
  id: number; // 设备唯一标识
  eid: string; //  eid
  iccid: string; //  预制种子号
  companyName: string; //  归属企业
  projectName: string; //  归属项目
  name: string; // 设备名称
  profileCount: number; // 业务号
  online: number; // 在线状态
  eimFqdn: string; //  eimid
  creationTime: string; // 创建时间
}

export interface ChangeEimForm {
  eimId?: string; // eimid
  eimFqdn?: string; //  EIM地址
  eimIdType?: string; //  EIMIdType
  counterValue?: string; //  counterValue
  associationToken?: string; //  associationToken
  authenticationMethod?: string; //  radio存数据用
  eimPublicKey?: string; //  eimPublicKey
}

interface DownloadList {
  eid?: string;
  productionBatch?: string;
  projectId?: string;
  count?: string;
}

export interface AllocationAndDownload {
  use?: boolean;
  deviceList?: DownloadList;
}