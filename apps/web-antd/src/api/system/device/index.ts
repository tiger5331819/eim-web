import type { AllocationAndDownload, DeviceQuery } from './model';
import type { ID, PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  deviceList = '/manager/device/list',
  deviceRoot = '/manager/device',
  eimProfile = '/eimProfile',
  batchDownload = '/manager/device/batch/profileDownload',
  profileBatch = '/manager/profile/productionBatch',
}

export function deviceList(params?: DeviceQuery) {
  return alovaInstance.get<PageResult<any>>(Api.deviceList, { params });
}

export function deviceDetail(eid: ID) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}`);
}

export function updateDetail(eid: ID) {
  return alovaInstance.post<any>(`${Api.deviceRoot}/${eid}/profile/list`);
}

export function deviceName(eid: ID, data: { name: string }) {
  return alovaInstance.post<void>(`${Api.deviceRoot}/${eid}/name`, data);
}

export function companyName(eid: ID, data: { name: string }) {
  return alovaInstance.post<void>(`${Api.deviceRoot}/${eid}/companyName`, data);
}

export function toEnable(eid: ID, iccid: string) {
  return alovaInstance.patch<void>(`${Api.deviceRoot}/${eid}/profile/${iccid}/enable`);
}

export function toDisable(eid: ID, iccid: string) {
  return alovaInstance.patch<void>(`${Api.deviceRoot}/${eid}/profile/${iccid}/disable`);
}

export function toDelete(eid: ID, iccid: string) {
  return alovaInstance.deleteWithMsg<void>(`${Api.deviceRoot}/${eid}/profile/${iccid}`);
}

export function operationLog(eid: ID, params?: any) {
  return alovaInstance.get<PageResult<any>>(`${Api.deviceRoot}/${eid}/log/list`, { params });
}

export function eimList(eid: ID) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}/eim/list`);
}

export function eimDetail(eid: ID, eimId: string) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}/eim/${eimId}`);
}

export function eimAdd(eid: ID, data: any) {
  return alovaInstance.postWithMsg<void>(`${Api.deviceRoot}/${eid}/eim`, data);
}

export function eimEdit(eid: ID, eimId: string, data: any) {
  return alovaInstance.patchWithMsg<void>(`${Api.deviceRoot}/${eid}/eim/${eimId}`, data);
}

export function eimChange(eid: ID, eimId: string, data: any) {
  return alovaInstance.post<void>(`${Api.deviceRoot}/${eid}/eim/${eimId}/change`, data);
}

export function eimDelete(eid: ID, eimId: string) {
  return alovaInstance.deleteWithMsg<void>(`${Api.deviceRoot}/${eid}/eim/${eimId}`);
}

export function updateEim(eid: ID) {
  return alovaInstance.post<any>(`${Api.deviceRoot}/${eid}/eim/listEim`);
}

export function eimDownload(eid: ID) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}/profileDownload`);
}

export function dpDownload(eid: ID) {
  return alovaInstance.post<any>(`${Api.deviceRoot}/${eid}/dp/profileDownload`);
}

export function toDownload(eid: ID, data: any) {
  return alovaInstance.post<any>(`${Api.deviceRoot}/${eid}/profileDownload`, data);
}

export function idDownload(eid: ID, id: ID) {
  return alovaInstance.get<any>(`${Api.eimProfile}/${eid}/use/${id}`);
}

export function toResult(eid: ID) {
  return alovaInstance.get<any>(`${Api.deviceRoot}/${eid}/profileDownload/result`);
}

export function updateProfileApn(eid: ID, iccid: string, apnId: ID) {
  return alovaInstance.patchWithMsg<void>(`${Api.deviceRoot}/${eid}/profile/${iccid}/apn/${apnId}`);
}

export function eimProfile() {
  return alovaInstance.get<any>(Api.eimProfile);
}

export function batchListByProjectId(projectId: string) {
  return alovaInstance.get<any>(`${Api.profileBatch}/${projectId}`);
}

export function countByBatchId(productionBatch: string) {
  return alovaInstance.get<any>(`/manager/profile/canBeAssignCount/${productionBatch}`);
}

export function batchAllocationAndDownload(data: AllocationAndDownload) {
  return alovaInstance.postWithMsg<void>(Api.batchDownload, data);
}
