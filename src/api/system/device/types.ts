/**
 * 设备查询对象类型
 */
export interface DeviceQuery extends PageQuery {
  pageNum: 1,
  pageSize: 10,
  eid?: string;
  iccid?: string;
  providerName?: string;
  status?: string;
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
}

/**
 * 设备表单类型
 */
export interface DeviceForm {
  eimIdOriginal?: string;
  eimId?: string;
  eimAddress?: string;
  eimIdType?: string;
  counterValue?: string;
  associationToken?: string;
  authenticationMethod?: string | number;
  eimPublicKey?: string;
  eimCertificate?: any;
  trustedPublicKeyDataTls?: string;
  eimSupportedProtocol?: string;
  euiccCiPKld?: string;
}

