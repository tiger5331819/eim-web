export interface ApnVO {
  id: string | number;
  name: string;
  apn?: string;
  local?: string;
  providerId?: number;
  operatorId?: number;
  operatorCode?: string;
  operatorName?: string;
  isDefault?: '0' | '1';
  status?: '0' | '1';
  sourceType?: string;
  remark?: string;
  createByName?: string;
  createTime?: string;
  creationTime?: string;
  updateTime?: string;
}

export interface ApnForm {
  id?: string | number;
  name?: string;
  apn?: string;
  local?: string;
  providerId?: number;
  operatorId?: number;
  isDefault?: '0' | '1';
  status?: '0' | '1';
  sourceType?: string;
  sourceRef?: string;
  remark?: string;
}

export interface ApnStatusBo {
  id: string | number;
  status: '0' | '1';
}

export interface ApnQuery {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  operatorId?: number;
  isDefault?: string;
  status?: string;
}
