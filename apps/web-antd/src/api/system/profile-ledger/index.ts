import type {
  ProfileCreateBo,
  ProfileImportLogQuery,
  ProfileImportLogVo,
  ProfileLedgerQuery,
  ProfileLedgerVo,
  ProfilePoolAvailableQuery,
  ProfilePoolInBo,
  ProfilePoolOutBo,
  ProfilePoolRecycleBo,
  ProfilePoolRecycleSelectedBo,
} from './model';
import type { ID, PageResult } from '#/api/common';

import { EnableStatus } from '@vben/constants';

import { commonExport } from '#/api/helper';
import { eimTenantList } from '#/api/system/tenant';
import { alovaInstance } from '#/utils/http';

enum Api {
  list = '/manager/profile/ledger/list',
  export = '/manager/profile/ledger/export',
  add = '/manager/profile/ledger/add',
  root = '/manager/profile/ledger',
  import = '/manager/profile/ledger/import',
  importTemplate = '/manager/profile/ledger/import/template',
  importLog = '/manager/profile/ledger/import-log',
  importDetail = '/manager/profile/ledger/import-detail',
  availableCount = '/manager/profile/ledger/pool/available-count',
  poolIn = '/manager/profile/ledger/pool/in',
  poolInOne = '/manager/profile/ledger/pool/in',
  poolOut = '/manager/profile/ledger/pool/out',
  poolOutOne = '/manager/profile/ledger/pool/out',
  poolRecycle = '/manager/profile/ledger/pool/recycle',
  poolRecycleSelected = '/manager/profile/ledger/pool/recycle-selected',
  poolRecycleOne = '/manager/profile/ledger/pool/recycle',
}

/** 查询码号台账列表 */
export function profileLedgerList(params?: ProfileLedgerQuery) {
  return alovaInstance.get<PageResult<ProfileLedgerVo>>(Api.list, { params });
}

/** 导出码号台账 */
export function profileLedgerExport(data: Record<string, any>) {
  return commonExport(Api.export, data);
}

/** 新增码号（单条） */
export function profileLedgerAdd(data: ProfileCreateBo) {
  return alovaInstance.postWithMsg<string>(Api.add, data, {
    successMessageMode: 'none',
  });
}

/** 行删除 */
export function profileLedgerDelete(profileId: ID) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${profileId}`, undefined, {
    successMessageMode: 'none',
  });
}

/** 批量导入码号 */
export function profileLedgerImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return alovaInstance.postWithMsg<string>(Api.import, formData, {
    headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
    successMessageMode: 'none',
  });
}

/** 下载导入模板 */
export function profileLedgerImportTemplate() {
  return alovaInstance.post<Blob>(
    Api.importTemplate,
    {},
    {
      isTransformResponse: false,
      responseType: 'blob',
    },
  );
}

/** 分页查询导入记录 */
export function profileLedgerImportLogList(params?: ProfileImportLogQuery) {
  return alovaInstance.get<PageResult<ProfileImportLogVo>>(Api.importLog, {
    params,
  });
}

/** 下载导入失败明细 */
export function profileLedgerImportDetail(logId: ID) {
  return alovaInstance.post<Blob>(
    `${Api.importDetail}/${logId}`,
    {},
    {
      isTransformResponse: false,
      responseType: 'blob',
    },
  );
}

/** 查询可用数量 */
export function profileLedgerAvailableCount(params: ProfilePoolAvailableQuery) {
  const query: Record<string, any> = {
    action: params.action,
    tenantId: params.tenantId,
  };
  if (params.operatorId !== undefined && params.operatorId !== null) {
    query.operatorId = params.operatorId;
  }
  return alovaInstance.get<number>(Api.availableCount, { params: query });
}

/** 批量入池（按数量） */
export function profileLedgerPoolIn(data: ProfilePoolInBo) {
  return alovaInstance.postWithMsg<number>(Api.poolIn, data, {
    successMessageMode: 'none',
  });
}

/** 行入池（单条） */
export function profileLedgerPoolInOne(
  profileId: ID,
  params: { tenantId: string; remark: string },
) {
  return alovaInstance.postWithMsg<number>(
    `${Api.poolInOne}/${profileId}`,
    undefined,
    {
      params,
      successMessageMode: 'none',
    },
  );
}

/** 批量出池（按数量） */
export function profileLedgerPoolOut(data: ProfilePoolOutBo) {
  return alovaInstance.postWithMsg<number>(Api.poolOut, data, {
    successMessageMode: 'none',
  });
}

/** 行出池（单条） */
export function profileLedgerPoolOutOne(profileId: ID) {
  return alovaInstance.postWithMsg<number>(
    `${Api.poolOutOne}/${profileId}`,
    undefined,
    {
      successMessageMode: 'none',
    },
  );
}

/** 批量回收（按数量） */
export function profileLedgerPoolRecycle(data: ProfilePoolRecycleBo) {
  return alovaInstance.postWithMsg<number>(Api.poolRecycle, data, {
    successMessageMode: 'none',
  });
}

/** 批量回收（按选中码号） */
export function profileLedgerPoolRecycleSelected(
  data: ProfilePoolRecycleSelectedBo,
) {
  return alovaInstance.postWithMsg<number>(Api.poolRecycleSelected, data, {
    successMessageMode: 'none',
  });
}

/** 行回收（单条） */
export function profileLedgerPoolRecycleOne(profileId: ID) {
  return alovaInstance.postWithMsg<number>(
    `${Api.poolRecycleOne}/${profileId}`,
    undefined,
    {
      successMessageMode: 'none',
    },
  );
}

/** 全部租户下拉（含停用） */
export async function getLedgerTenantOptions() {
  const res = await eimTenantList({ pageNum: 1, pageSize: 1000 });
  return (res.rows || []).map((item) => ({
    label: item.companyName,
    value: item.tenantId,
  }));
}

/** 已启用租户下拉 */
export async function getLedgerEnabledTenantOptions() {
  const res = await eimTenantList({
    pageNum: 1,
    pageSize: 1000,
    status: EnableStatus.Enable,
  });
  return (res.rows || []).map((item) => ({
    label: item.companyName,
    value: item.tenantId,
  }));
}
