export interface ApnVO {
  /**
   * APN ID
   */
  id: string | number;

  /**
   * 名称
   */
  name: string;

  /**
   * APN
   */
  apn: string;

  /**
   * 适用地区
   */
  local: string;

  /**
   * 创建时间
   */
  creationTime: string;

}

export interface ApnForm extends BaseEntity {
  /**
   * APN ID
   */
  id?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * APN
   */
  apn?: string;

  /**
   * 适用地区
   */
  local?: string;

}

export interface ApnQuery extends PageQuery {

  /**
   * 名称
   */
  name?: string;

  /**
   * APN
   */
  apn?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



