/** 运营商列表查询 BO */
export interface OperatorBo {
  id?: number;
  /** 运营商编码（全局唯一，如 46001） */
  operatorCode?: string;
  operatorName?: string;
  status?: string;
  remark?: string;
}

/** 运营商列表返回 VO */
export interface OperatorVo {
  id: number;
  /** 运营商编码（全局唯一） */
  operatorCode: string;
  operatorName: string;
  status: string;
  remark: string;
  createTime: string;
  /** 关联码号资源数（运行时统计） */
  profileCount: number;
  /** 关联 APN 数（运行时统计） */
  apnCount: number;
}

/** 运营商批量导入失败明细 */
export interface OperatorImportFailItem {
  /** 运营商编码（后端如未返回则降级为空） */
  operatorCode?: string;
  operatorName: string;
  failReason: string;
}

/** 运营商批量导入结果 */
export interface OperatorImportResultVo {
  successCount: number;
  failCount: number;
  failList: OperatorImportFailItem[];
}
