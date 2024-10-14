/**
 * 设备查询对象类型
 */
export interface DeviceQuery extends PageQuery {
  pageNum: 1,
  pageSize: 10,
  eid?: string;
  iccid?: string;
  companyName?: string;
  online?: string;
  eimid?: string;
  isAsc?: string;
  params: {
  },
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

