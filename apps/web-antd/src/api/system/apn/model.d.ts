export interface ApnVO {
  id: string | number;
  name: string;
  apn: string;
  local: string;
  providerId?: number;        // 供应商ID
  operatorId?: number;        // 运营商ID（关联 operator 表）
  operatorCode?: string;      // 运营商编码（由 operatorId 关联带出，非 apn 表字段）
  operatorName?: string;      // 运营商名称（由 operatorId 关联带出，非 apn 表字段）
  isDefault?: '0' | '1';      // 是否默认 APN
  status?: '0' | '1';         // 状态（0 正常 1 停用）
  sourceType?: string;        // 来源（MANUAL/DP_PLUS）
  creationTime: string;
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
  sourceRef?: string;         // 仅 Form 有，VO 无
}

export interface ApnQuery {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  apn?: string;
  operatorId?: number;
  isDefault?: string;
  status?: string;
}
