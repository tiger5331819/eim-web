import type {
  ProfileChangeLogQuery,
  ProfileChangeLogVo,
  ProfileChangeSnapshotQuery,
  ProfileChangeSnapshotVo,
} from './model';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  log = '/manager/profile/change/log',
  logExport = '/manager/profile/change/log/export',
  snapshot = '/manager/profile/change/snapshot',
  snapshotExport = '/manager/profile/change/snapshot/export',
  detail = '/manager/profile/change/detail',
  detailExport = '/manager/profile/change/detail/export',
}

/** 变动记录列表 */
export function profileChangeLogList(params?: ProfileChangeLogQuery) {
  return alovaInstance.get<PageResult<ProfileChangeLogVo>>(Api.log, { params });
}

/** 变动记录导出 */
export function profileChangeLogExport(data: Record<string, any>) {
  return commonExport(Api.logExport, data);
}

/** 变动快照列表（按变动编号） */
export function profileChangeSnapshotList(params?: ProfileChangeSnapshotQuery) {
  return alovaInstance.get<PageResult<ProfileChangeSnapshotVo>>(Api.snapshot, {
    params,
  });
}

/** 变动快照导出 */
export function profileChangeSnapshotExport(data: Record<string, any>) {
  return commonExport(Api.snapshotExport, data);
}

/** 变动明细列表（跨变动编号） */
export function profileChangeDetailList(params?: ProfileChangeSnapshotQuery) {
  return alovaInstance.get<PageResult<ProfileChangeSnapshotVo>>(Api.detail, {
    params,
  });
}

/** 变动明细导出 */
export function profileChangeDetailExport(data: Record<string, any>) {
  return commonExport(Api.detailExport, data);
}
