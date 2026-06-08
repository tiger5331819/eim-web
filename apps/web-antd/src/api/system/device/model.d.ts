export interface DeviceQuery {
  pageNum?: number;
  pageSize?: number;
  eid?: string;
  iccid?: string;
  online?: number;
  eimFqdn?: string;
  companyId?: string;
  projectId?: string;
}

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
