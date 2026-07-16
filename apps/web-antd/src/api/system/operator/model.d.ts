/** 运营商新增/编辑 BO */
export interface OperatorBo {
  id?: string;
  operatorName: string;
  recycleEnabled: boolean;
  remark?: string;
  status?: string;
}

/** 运营商状态切换 BO */
export interface OperatorStatusBo {
  id: string;
  status: string;
}

/** 运营商列表返回 VO */
export interface OperatorVo {
  id: string;
  operatorName: string;
  status: string;
  recycleEnabled: boolean;
  remark?: string;
  createTime?: string;
  createByName?: string;
  /** 关联码号数 */
  profileCount?: number;
  /** 关联 APN 数 */
  apnCount?: number;
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
