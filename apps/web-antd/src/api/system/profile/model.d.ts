export interface ProfileQuery {
  pageNum?: number;
  pageSize?: number;
  dpSource?: string;
  iccid?: string;
  eid?: string;
  state?: string;
  companyId?: string;
  projectId?: string;
  assigned?: boolean;
  installed?: boolean;
  poolStatus?: string;
  assignedTenantId?: string;
  productionBatch?: string;
  carrierName?: string;
}

export interface ProfileVO {
  id?: number | string;
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
  poolStatus?: string;
  apnId?: string;
  apn?: string;
  apnLocal?: string;
  projectId?: string;
  tenantName?: string;
}

export interface AllocationForm {
  productionBatch?: string;
  projectId?: string;
  size?: number;
}

export interface UserProfile {
  user: {
    userId: string;
    userName: string;
    nickName: string;
    email: string;
    phonenumber: string;
    sex: string;
    avatar: string;
    deptName?: string;
    loginDate: string;
  };
  postGroup?: string;
  roleGroup?: string;
}

export interface UpdatePasswordParam {
  oldPassword: string;
  newPassword: string;
}
