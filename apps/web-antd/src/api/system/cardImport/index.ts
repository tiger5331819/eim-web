import type { AllocationForm, CardImportQuery } from './model';
import type { PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  cardImportList = '/manager/seed/list',
  providerList = '/manager/provider/list',
  companyAll = '/manager/company/all',
  projectAll = '/manager/company',
  batchAll = '/manager/seed/batch/all',
  batchInventory = '/manager/seed/batch',
  downloadFail = '/manager/seed/importError',
  cardProvider = '/manager/seed/cardProviderName',
  tenantList = '/system/tenant/list',
}

export function cardImportList(params?: CardImportQuery) {
  return alovaInstance.get<PageResult<any>>(Api.cardImportList, { params });
}

export function providerList() {
  return alovaInstance.get<any>(Api.providerList);
}

export function companyList() {
  return alovaInstance.get<any>(Api.companyAll);
}

export function projectList(companyId: string) {
  return alovaInstance.get<any>(`${Api.projectAll}/${companyId}/project/all`);
}

export function allBatchList() {
  return alovaInstance.get<any>(Api.batchAll);
}

export function batchAllowableNumber(productionBatch: string) {
  return alovaInstance.get<any>(`${Api.batchInventory}/${productionBatch}/inventory`);
}

export function handleAllocation(productionBatch: string, data: AllocationForm) {
  return alovaInstance.postWithMsg<void>(`${Api.batchInventory}/${productionBatch}`, data);
}

export function downloadFailRecord(errorToken: string) {
  return alovaInstance.post<any>(`${Api.downloadFail}/${errorToken}`);
}

export function cardProviderList() {
  return alovaInstance.get<any>(Api.cardProvider);
}

export function tenantList() {
  return alovaInstance.get<any>(Api.tenantList);
}
