export interface ApnVO {
  id: string;
  name: string;
  apn?: string;
  local?: string;
  providerId?: string;
  operatorId?: string;
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
  id?: string;
  name?: string;
  apn?: string;
  local?: string;
  providerId?: string;
  operatorId?: string;
  isDefault?: '0' | '1';
  status?: '0' | '1';
  sourceType?: string;
  sourceRef?: string;
  remark?: string;
}

export interface ApnStatusBo {
  id: string;
  status: '0' | '1';
}

export interface ApnQuery {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  operatorId?: string;
  isDefault?: string;
  status?: string;
}
