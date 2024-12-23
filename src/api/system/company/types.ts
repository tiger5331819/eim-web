export interface CompanyForm {
  id?: string; // 企业唯一标识
  companyCode?: string; // 企业编号:无法修改
  name?: string; // 企业名称
  remark?: string; //   备注
}

export interface ProjectForm {
  id?: string; // 项目唯一标识
  companyId?: string; //    所属企业id
  cNumber?: string; // 所属企业编号
  cName?: string; //   所属企业名称
  name?: string; // 项目名称
  time?: Array<string>; // 存储时间用
  startTime?: string; // 有效时开始间
  endTime?: string; //  有效结束时间
  remark?: string; //   备注
}

export interface CompanyTable {
  id: string; //  企业/项目唯一标识
  name: string; // 企业管理
  startTime?: string | undefined; //  有效开始时间
  endTime?: string | undefined; //  有效结束时间
  profileCount: number; // 资源数量
  deviceCount: number; //  设备数量
  remark: string; // 备注
  creatTime: string; //  创建时间
  [key: string]: any; // 接口多余数据
}
