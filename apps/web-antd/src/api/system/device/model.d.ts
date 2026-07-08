export interface DeviceQuery {
  pageNum?: number;
  pageSize?: number;
  eid?: string;
  /** 预制种子号 */
  seedNumber?: string;
  iccid?: string;
  imei?: string;
  deviceSn?: string;
  online?: number;
  tenantId?: string;
  tenantName?: string;
  operatorId?: number | string;
  apn?: string;
  createByName?: string;
  beginActivationTime?: string;
  endActivationTime?: string;
  beginCreateTime?: string;
  endCreateTime?: string;
  eimFqdn?: string;
  companyId?: string;
  projectId?: string;
  name?: string;
  projectName?: string;
}

export interface DeviceLedgerVo {
  id?: number | string;
  eid?: string;
  seedNumber?: string;
  iccid?: string;
  imei?: string;
  deviceSn?: string;
  activationTime?: string;
  online?: number;
  tenantId?: string;
  tenantName?: string;
  companyName?: string;
  operatorId?: number | string;
  operatorName?: string;
  providerName?: string;
  apn?: string;
  apnName?: string;
  createByName?: string;
  createTime?: string;
  creationTime?: string;
}

export interface DeviceProfileVo {
  id?: string;
  deviceId?: string;
  iccid?: string;
  name?: string;
  issuer?: string;
  operatorId?: number | string;
  operatorName?: string;
  operatorCode?: string;
  providerName?: string;
  state?: number | string;
  serviceProviderName?: string;
  apnId?: string;
  apnName?: string;
  apn?: string;
}

export interface DeviceDetailVo extends DeviceLedgerVo {
  profileList?: DeviceProfileVo[];
}

export interface DeviceSimpleDownloadBo {
  eid: string;
  operatorId: number | string;
  apnId?: string;
  syncApn?: boolean;
}

export interface DeviceProfileRecordQuery {
  pageNum?: number;
  pageSize?: number;
  id?: string;
  iccid?: string;
  operationType?: string;
  operatorName?: string;
  beginOperationTime?: string;
  endOperationTime?: string;
}

export interface DeviceProfileRecordVo {
  id?: number | string;
  iccid?: string;
  operationType?: string;
  operationTypeText?: string;
  operatorName?: string;
  operationTime?: string;
  name?: string;
  message?: string;
  creationTime?: string;
}

/** @deprecated 兼容旧页面 */
export interface DeviceVO {
  id: number;
  eid: string;
  iccid: string;
  companyName: string;
  projectName: string;
  name: string;
  profileCount: number;
  online: number;
  eimFqdn: string;
  creationTime: string;
}

export interface ChangeEimForm {
  eimId?: string;
  eimFqdn?: string;
  eimIdType?: string;
  counterValue?: string;
  associationToken?: string;
  authenticationMethod?: string;
  eimPublicKey?: string;
}

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

export interface AllocationAndDownload {
  use?: boolean;
  deviceList?: {
    eid?: string;
    productionBatch?: string;
    projectId?: string;
    count?: string;
  }[];
}
