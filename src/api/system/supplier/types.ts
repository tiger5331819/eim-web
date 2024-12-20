export interface SupplierForm {
  id?: string | number; // 供应商唯一标识
  dp: string; //   dp+来源
  api?: string; //  接口地址
  token?: string; //    token地址
  account?: string; //   id
  pwd?: string; //  password
}

export interface SupplierTable {
  id: string | number; //    供应商唯一标识
  dp: string; // dp+来源
  account: string; //    id
  password: string; //   password
  resourcesNum: number; //   资源数量
  creatTime: string; //  创建时间
  [key: string]: any; // 接口多余数据
}
