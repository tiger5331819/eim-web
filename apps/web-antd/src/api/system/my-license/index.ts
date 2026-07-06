import type {
  MyLicenseFreezeQuery,
  MyLicenseFreezeVo,
  MyLicenseRecordQuery,
  MyLicenseRecordVo,
  MyLicenseVo,
} from './model';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  balance = '/manager/license/my',
  freeze = '/manager/license/my/freeze',
  freezeExport = '/manager/license/my/freeze/export',
  record = '/manager/license/my/record',
  recordExport = '/manager/license/my/record/export',
}

/** 查询当前租户 License 余额 */
export function myLicenseBalance() {
  return alovaInstance.get<MyLicenseVo>(Api.balance);
}

/** 分页查询消耗记录 */
export function myLicenseFreezeList(params?: MyLicenseFreezeQuery) {
  return alovaInstance.get<PageResult<MyLicenseFreezeVo>>(Api.freeze, {
    params,
  });
}

/** 导出消耗记录 */
export function myLicenseFreezeExport(data: Record<string, any>) {
  return commonExport(Api.freezeExport, data);
}

/** 分页查询变动记录 */
export function myLicenseRecordList(params?: MyLicenseRecordQuery) {
  return alovaInstance.get<PageResult<MyLicenseRecordVo>>(Api.record, {
    params,
  });
}

/** 导出变动记录 */
export function myLicenseRecordExport(data: Record<string, any>) {
  return commonExport(Api.recordExport, data);
}
