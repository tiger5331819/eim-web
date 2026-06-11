export interface ApnVO {
  id: string | number;
  name: string;
  apn: string;
  local: string;
  providerId?: number;        // 新增：供应商ID
  carrierCode?: string;       // 新增：运营商编码
  carrierName?: string;       // 新增：运营商名称
  isDefault?: '0' | '1';      // 新增：是否默认 APN
  status?: '0' | '1';         // 新增：状态（0 正常 1 停用）
  sourceType?: string;        // 新增：来源（MANUAL/DP_PLUS）
  creationTime: string;
  updateTime?: string;
}

export interface ApnForm {
  id?: string | number;
  name?: string;
  apn?: string;
  local?: string;
  providerId?: number;
  carrierCode?: string;
  carrierName?: string;
  isDefault?: '0' | '1';
  status?: '0' | '1';
  sourceType?: string;
  sourceRef?: string;
}

export interface ApnQuery {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  apn?: string;
  carrierCode?: string;
  isDefault?: string;
  status?: string;
}
