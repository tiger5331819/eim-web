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

/**
 * 设备查询对象类型
 */
export interface DeviceQuery extends PageQuery {
  pageNum: 1;
  pageSize: 10;
  eid?: string;
  iccid?: string;
  companyName?: string;
  online?: string;
  eimid?: string;
  eimFqdn?: string;
  isAsc?: string;
  params: { [key: string]: any };
}

/**
 * 设备返回对象
 */
export interface DeviceVO extends BaseEntity {
  eid: string;
  eimid: string;
  eimFqdn: string;
}

/**
 * 设备表单类型
 */
export interface DeviceForm {
  eid?: string;
  eimIdOriginal?: string;
  eimId?: string;
  eimFqdn?: string;
  eimIdType?: string;
  counterValue?: string;
  associationToken?: string;
  authenticationMethod?: string | number;
  eimPublicKey?: string;
  eimCertificate?: any;
  trustedEimPkTls?: string;
  eimSupportedProtocol?: string;
  euiccCipkId?: string;
}
