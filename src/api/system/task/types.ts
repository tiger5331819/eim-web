export interface query {
  pageNum?: number; //   分页
  pageSize?: number; //  分页
  taskType?: number | string; // 任务类型
  handlePeople?: number | string; // 操作人
  handleTime?: string; //    操作时间
  status?: number | string; //   状态
}

export interface taskTable {
  id: number | string; //  任务唯一标识
  taskType: number | string; //    任务类型
  fileName: string; // 文件名称
  importNum: number; //    导入数
  failNum: number; //  失败数
  handlePeople: number | string; //    操作人
  handleTime: string; //   操作时间
  status: number | string; //  状态
  [key: string]: any; // 接口多余数据
}
