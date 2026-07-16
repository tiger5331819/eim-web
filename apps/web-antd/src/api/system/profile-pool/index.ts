import type {
  ProfileAllocateBO,
  ProfileAllocationLogQuery,
  ProfileAllocationLogVO,
  ProfileBatchRecycleBO,
  ProfilePoolStatsVO,
  ProfileTransferBO,
} from './model';
import type { ID, PageResult } from '#/api/common';

import { toIdPath } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  stats = '/manager/profile/pool/stats',
  allocate = '/manager/profile/pool/allocate',
  transfer = '/manager/profile/pool/transfer',
  recycle = '/manager/profile/pool/recycle',
  batchRecycle = '/manager/profile/pool/batch-recycle',
  log = '/manager/profile/pool/allocation-log',
}

/** 资源池统计（tenantId 为空串则查平台维度） */
export function poolStats(tenantId: string = '') {
  return alovaInstance.get<ProfilePoolStatsVO>(Api.stats, {
    params: { tenantId },
  });
}

/** 平台总池 → 租户池 分配 */
export function poolAllocate(data: ProfileAllocateBO) {
  return alovaInstance.postWithMsg<void>(Api.allocate, data);
}

/** 租户间调配 */
export function poolTransfer(data: ProfileTransferBO) {
  return alovaInstance.postWithMsg<void>(Api.transfer, data);
}

/** 单个回收 */
export function poolRecycle(profileId: ID) {
  return alovaInstance.postWithMsg<void>(
    `${Api.recycle}/${toIdPath(profileId)}`,
  );
}

/** 批量回收 */
export function poolBatchRecycle(data: ProfileBatchRecycleBO) {
  return alovaInstance.postWithMsg<void>(Api.batchRecycle, {
    ...data,
    profileIds: (data.profileIds ?? []).map((id) => String(id)),
  });
}

/** 调配日志分页查询 */
export function allocationLogList(params?: ProfileAllocationLogQuery) {
  return alovaInstance.get<PageResult<ProfileAllocationLogVO>>(Api.log, {
    params,
  });
}
