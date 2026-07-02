import type { ApnForm, ApnStatusBo, ApnVO } from './model';

import type { ID, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  apnExport = '/manager/apn/export',
  apnList = '/manager/apn/list',
  byOperator = '/manager/apn/by-operator',
  changeStatus = '/manager/apn/changeStatus',
  root = '/manager/apn',
}

export function listApn(params?: PageQuery) {
  return alovaInstance.get<PageResult<ApnVO>>(Api.apnList, { params });
}

export function getApn(id: ID) {
  return alovaInstance.get<ApnVO>(`${Api.root}/${id}`);
}

export function addApn(data: ApnForm) {
  return alovaInstance.postWithMsg<void>(Api.root, data, {
    successMessageMode: 'none',
  });
}

export function updateApn(data: ApnForm) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${data.id}`, data, {
    successMessageMode: 'none',
  });
}

/** 切换 APN 状态（启用/停用） */
export function apnChangeStatus(data: ApnStatusBo) {
  return alovaInstance.putWithMsg<void>(Api.changeStatus, data, {
    successMessageMode: 'none',
  });
}

export function delApn(id: ID) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${id}`);
}

/** 设置默认 APN（同运营商唯一默认） */
export function setDefaultApn(id: ID) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${id}/default`, undefined, {
    successMessageMode: 'none',
  });
}

/** 按运营商ID查询启用APN列表（供下号/启用流程使用） */
export function apnByOperator(operatorId: number | string) {
  return alovaInstance.get<ApnVO[]>(`${Api.byOperator}/${operatorId}`);
}

export function apnExport(data: Record<string, any>) {
  return commonExport(Api.apnExport, data);
}
