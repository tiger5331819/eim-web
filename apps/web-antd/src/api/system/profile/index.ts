import type { AllocationForm, ProfileQuery } from './model';
import type { ID, PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  profileList = '/manager/profile/list',
  profileSync = '/manager/profile/sync',
  profileBatch = '/manager/profile/productionBatch',
  profileAssign = '/manager/profile/assign',
  root = '/manager/profile',
}

export function profileList(params?: ProfileQuery) {
  return alovaInstance.get<PageResult<any>>(Api.profileList, { params });
}

export function handleSync() {
  return alovaInstance.postWithMsg<void>(Api.profileSync);
}

export function allBatchList() {
  return alovaInstance.get<any>(Api.profileBatch);
}

export function batchAllowableNumber(productionBatch: string) {
  return alovaInstance.get<any>(`${Api.root}/canBeAssignCount/${productionBatch}`);
}

export function handleAllocation(data: AllocationForm) {
  return alovaInstance.postWithMsg<void>(Api.profileAssign, data);
}

export function updateProfileApn(id: ID, apnId: ID) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${id}/apn/${apnId}`);
}
