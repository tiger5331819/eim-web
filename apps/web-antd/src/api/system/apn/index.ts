import type { ApnForm, ApnVO } from './model';
import type { ID, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/apn',
  apnList = '/manager/apn/list',
  apnExport = '/manager/apn/export',
}

export function listApn(params?: PageQuery) {
  return alovaInstance.get<PageResult<ApnVO>>(Api.apnList, { params });
}

export function getApn(id: ID) {
  return alovaInstance.get<ApnVO>(`${Api.root}/${id}`);
}

export function addApn(data: ApnForm) {
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

export function updateApn(data: ApnForm) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${data.id}`, data);
}

export function delApn(id: ID) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${id}`);
}

export function apnExport(data: Record<string, any>) {
  return commonExport(Api.apnExport, data);
}
