export interface query {
  pageNum?: number; //   分页
  pageSize?: number; //  分页
  dp?: string; // dp+来源
  iccid?: number | string; // 操作人
  eid?: number | string; //    操作时间
  state?: number | string; //   状态
  company?: number | string; //   归属企业
  project?: number | string; //   归属项目
  status?: number | string; //   分配状态
  online?: number | string; //   下号状态
}

export interface profileTable {
  dp: number | string;
  //    列太多了，后续联调接口时按照接口去写
}

export interface AllocationForm {
  batch: number | string; //   批次
  company: number | string; // 归属企业
  project: number | string; // 归属项目
  count: number; //    数量
}
