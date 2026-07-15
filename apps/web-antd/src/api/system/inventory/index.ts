import type {
  EuiccAssignBatchBo,
  EuiccAssignOneBo,
  EuiccInventoryAddBo,
  EuiccInventoryImportLogQuery,
  EuiccInventoryImportLogVo,
  EuiccInventoryQuery,
  EuiccInventoryVo,
  EuiccRecycleBo,
  InventoryRecycleRecordQuery,
  InventoryRecycleRecordVo,
} from './model';
import type { ID, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  list = '/manager/inventory/list',
  export = '/manager/inventory/export',
  add = '/manager/inventory/add',
  root = '/manager/inventory',
  import = '/manager/inventory/import',
  importTemplate = '/manager/inventory/import/template',
  importLog = '/manager/inventory/import/log',
  importDetail = '/manager/inventory/import/detail',
  assignOne = '/manager/inventory/assign',
  assignBatch = '/manager/inventory/assign/batch',
  assignImport = '/manager/inventory/assign/import',
  assignImportTemplate = '/manager/inventory/assign/import/template',
  assignableCount = '/manager/inventory/assignable/count',
  recycleOne = '/manager/inventory/recycle',
  recycleBatch = '/manager/inventory/recycle/batch',
  recycleRecords = '/manager/inventory/change',
  deleteImport = '/manager/inventory/delete/import',
}

/** 查询库存列表 */
export function inventoryList(params?: EuiccInventoryQuery) {
  return alovaInstance.get<PageResult<EuiccInventoryVo>>(Api.list, { params });
}

/** 导出库存列表 */
export function inventoryExport(data: Record<string, any>) {
  return commonExport(Api.export, data);
}

/** 手动入库 */
export function inventoryAdd(data: EuiccInventoryAddBo) {
  return alovaInstance.postWithMsg<string>(Api.add, data, {
    successMessageMode: 'none',
  });
}

/** 行删除 */
export function inventoryDelete(inventoryId: ID) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${inventoryId}`, undefined, {
    successMessageMode: 'none',
  });
}

/** 批量导入库存 */
export function inventoryImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return alovaInstance.postWithMsg<string>(Api.import, formData, {
    headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
    successMessageMode: 'none',
  });
}

/** 下载导入模板 */
export function inventoryImportTemplate() {
  return alovaInstance.post<Blob>(
    Api.importTemplate,
    {},
    {
      isTransformResponse: false,
      responseType: 'blob',
    },
  );
}

/** 分页查询入库记录 */
export function inventoryImportLogList(params?: EuiccInventoryImportLogQuery) {
  return alovaInstance.get<PageResult<EuiccInventoryImportLogVo>>(Api.importLog, {
    params,
  });
}

/** 下载导入失败明细 */
export function inventoryImportDetail(logId: ID) {
  return alovaInstance.post<Blob>(
    `${Api.importDetail}/${logId}`,
    {},
    {
      isTransformResponse: false,
      responseType: 'blob',
    },
  );
}

/** 行分配 */
export function inventoryAssignOne(inventoryId: ID, data: EuiccAssignOneBo) {
  return alovaInstance.postWithMsg<void>(
    `${Api.assignOne}/${inventoryId}`,
    data,
    { successMessageMode: 'none' },
  );
}

/** 批量分配（按选中 / 按数量） */
export function inventoryAssignBatch(data: EuiccAssignBatchBo) {
  return alovaInstance.postWithMsg<void>(Api.assignBatch, data, {
    successMessageMode: 'none',
  });
}

/** 批量分配（文件导入） */
export function inventoryAssignImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return alovaInstance.postWithMsg<string>(Api.assignImport, formData, {
    headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
    successMessageMode: 'none',
  });
}

/** 下载批量分配模板 */
export function inventoryAssignImportTemplate() {
  return alovaInstance.post<Blob>(
    Api.assignImportTemplate,
    {},
    {
      isTransformResponse: false,
      responseType: 'blob',
    },
  );
}

/** 查询可分配数量 */
export function inventoryAssignableCount(cardVendor?: string) {
  return alovaInstance.get<number>(Api.assignableCount, {
    params: { cardVendor: cardVendor ?? '' },
  });
}

/** 行回收 */
export function inventoryRecycleOne(inventoryId: ID) {
  return alovaInstance.postWithMsg<void>(
    `${Api.recycleOne}/${inventoryId}`,
    undefined,
    { successMessageMode: 'none' },
  );
}

/** 批量回收 */
export function inventoryRecycleBatch(data: EuiccRecycleBo) {
  return alovaInstance.postWithMsg<void>(Api.recycleBatch, data, {
    successMessageMode: 'none',
  });
}

/** 查询可批量回收的分配记录 */
export function inventoryRecycleRecordList(params?: InventoryRecycleRecordQuery) {
  return alovaInstance.get<PageResult<InventoryRecycleRecordVo>>(
    Api.recycleRecords,
    { params },
  );
}

/** 批量删除（文件导入） */
export function inventoryDeleteImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return alovaInstance.postWithMsg<string>(Api.deleteImport, formData, {
    headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
    successMessageMode: 'none',
  });
}
