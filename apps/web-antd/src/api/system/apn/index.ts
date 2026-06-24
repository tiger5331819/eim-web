import type { ApnForm, ApnVO } from './model';
import type { ID, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/apn',
  apnList = '/manager/apn/list',
  apnExport = '/manager/apn/export',
  byOperator = '/manager/apn/by-operator',
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

/** 设置默认 APN（同运营商唯一默认） */
export function setDefaultApn(id: ID) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${id}/default`);
}

/** 按运营商ID查询启用APN列表（供下号/启用流程使用） */
export function apnByOperator(operatorId: number | string) {
  return alovaInstance.get<ApnVO[]>(`${Api.byOperator}/${operatorId}`);
}

export function apnExport(data: Record<string, any>) {
  return commonExport(Api.apnExport, data);
}
