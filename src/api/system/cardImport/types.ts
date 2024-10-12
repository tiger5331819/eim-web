export interface InVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 入库单号
   */
  no: string;

  /**
   * 物料编码
   */
  materialNo: string;

  /**
   * 物料名称
   */
  materialName: string;

  /**
   * 采购订单号
   */
  procureNo: string;

  /**
   * 检验单号
   */
  checkNo: string;

  /**
   * 采购数量
   */
  procureCount: number;

  /**
   * 入库状态
   */
  status: number;

  /**
   * 入库数量
   */
  inCount: number;

  /**
   * 入库时间
   */
  inTime: string;

  /**
   * 出库数量
   */
  outCount: number;

  /**
   * 正常品数量
   */
  normalCount: number;

  /**
   * 不良品数量
   */
  poorCount: number;

  /**
   * 呆滞品数量
   */
  retentCount: number;

  /**
   * 库位号
   */
  site: string;

  /**
   * 入库单表头
   */
  title: string;

  /**
   * 型号规格
   */
  modelName: string;

  /**
   * 审核状态
   */
  checkStatus: number;

  /**
   * 审核人
   */
  checkBy: number;

}

export interface InForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 入库单号
   */
  no?: string;

  /**
   * 物料编码
   */
  materialNo?: string;

  /**
   * 物料名称
   */
  materialName?: string;

  /**
   * 采购订单号
   */
  procureNo?: string;

  /**
   * 检验单号
   */
  checkNo?: string;

  /**
   * 采购数量
   */
  procureCount?: number;

  /**
   * 库位号
   */
  site?: string;

  /**
   * 入库单表头
   */
  title?: string;

  /**
   * 型号规格
   */
  modelName?: string;

  /**
   * 审核人列表
   */
  checkList?: string;

}

export interface InQuery extends PageQuery {

  /**
   * 入库单号
   */
  no?: string;

  /**
   * 物料编码
   */
  materialNo?: string;

  /**
   * 采购订单号
   */
  procureNo?: string;

  /**
   * 检验单号
   */
  checkNo?: string;

  /**
   * 入库时间
   */
  inTime?: string;

  /**
   * 库位号
   */
  site?: string;

  /**
   * 审核状态
   */
  checkStatus?: number;

  /**
   * 审核人
   */
  checkBy?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



