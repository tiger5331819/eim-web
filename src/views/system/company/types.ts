export interface CompanyVO {
  id: number | string;
  name: string;
  time: string;
  resourcesNum: number;
  deviceNum: number;
  remark: string;
  creatTime: string;
}

export interface CompanyForm {
  id?: string;
  number?: number | string;
  name?: string;
  remark?: string;
}

export interface ProjectForm {
  cNumber?: number | string;
  cName?: string;
  id?: string;
  number?: number | string;
  name?: string;
  time?: string;
  remark?: string;
}
