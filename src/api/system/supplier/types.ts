export interface SupplierForm {
  id?: string; // 供应商唯一标识
  dpSource?: string; //   dp+来源
  apiUrl?: string; //  接口地址
  tokenUrl?: string; //    token地址
  accountId?: string; //   id
  accountPassword?: string; //  password
}

export interface SupplierTable {
  id: string; //    供应商唯一标识
  dpSource: string; // dp+来源
  accountId: string; //    id
  accountPassword: string; //   password
  profileCount: number; //   资源数量
  createTime: string; //  创建时间
  [key: string]: any; // 接口多余数据
}
