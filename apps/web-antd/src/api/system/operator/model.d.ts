/** 运营商列表查询 BO */
export interface OperatorBo {
  id?: number;
  operatorName?: string;
  status?: string;
  remark?: string;
}

/** 运营商列表返回 VO */
export interface OperatorVo {
  id: number;
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
  operatorName: string;
  failReason: string;
}

/** 运营商批量导入结果 */
export interface OperatorImportResultVo {
  successCount: number;
  failCount: number;
  failList: OperatorImportFailItem[];
}
