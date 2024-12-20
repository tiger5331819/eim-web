export interface CompanyForm {
  id?: number | string; // 企业唯一标识
  number?: number | string; // 企业编号:无法修改
  name: string; // 企业名称
  remark?: string; //   备注
}

export interface ProjectForm {
  id?: number | string; // 项目唯一标识
  cId?: number | string; //    所属企业id
  cNumber?: string; // 所属企业编号
  cName?: string; //   所属企业名称
  name: string; // 项目名称
  time: string; // 有效时间
  remark: string; //   备注
}

export interface CompanyTable {
  id: number | string; //  企业/项目唯一标识
  name: string; // 企业管理
  time: string; // 有效时间
  resourcesNum: number; // 资源数量
  deviceNum: number; //  设备数量
  remark: string; // 备注
  creatTime: string; //  创建时间
  [key: string]: any; // 接口多余数据
}
