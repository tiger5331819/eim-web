export interface supplierVO {
  source: number | string;
  dp: string;
  id: string;
  password: string;
  resourcesNum: number;
  creatTime: string;
}

export interface SupplierForm {
  supplierId?: number | string;
  dp?: string;
  api?: string;
  token?: string;
  id?: number | string;
  password?: string;
}
