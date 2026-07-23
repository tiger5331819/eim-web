import type {
  InventoryChangeLogQuery,
  InventoryChangeLogVo,
  InventoryChangeSnapshotQuery,
  InventoryChangeSnapshotVo,
} from './model';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  log = '/manager/inventory/change/log',
  logExport = '/manager/inventory/change/log/export',
  snapshot = '/manager/inventory/change/snapshot',
  /** 变动台账明细导出 */
  snapshotExport = '/manager/inventory/change/snapshot/detail/export',
  detail = '/manager/inventory/change/detail',
  detailExport = '/manager/inventory/change/detail/export',
}

/** 变动记录列表 */
export function inventoryChangeLogList(params?: InventoryChangeLogQuery) {
  return alovaInstance.get<PageResult<InventoryChangeLogVo>>(Api.log, { params });
}

/** 变动记录导出 */
export function inventoryChangeLogExport(data: Record<string, any>) {
  return commonExport(Api.logExport, data);
}

/** 变动快照列表（按变动编号） */
export function inventoryChangeSnapshotList(
  params?: InventoryChangeSnapshotQuery,
) {
  return alovaInstance.get<PageResult<InventoryChangeSnapshotVo>>(Api.snapshot, {
    params,
  });
}

/** 变动台账明细导出 */
export function inventoryChangeSnapshotExport(data: Record<string, any>) {
  return commonExport(Api.snapshotExport, data);
}

/** 变动明细列表（跨变动编号） */
export function inventoryChangeDetailList(
  params?: InventoryChangeSnapshotQuery,
) {
  return alovaInstance.get<PageResult<InventoryChangeSnapshotVo>>(Api.detail, {
    params,
  });
}

/** 变动明细导出 */
export function inventoryChangeDetailExport(data: Record<string, any>) {
  return commonExport(Api.detailExport, data);
}
