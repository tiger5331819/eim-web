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
}

export interface ProfileVO {
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
