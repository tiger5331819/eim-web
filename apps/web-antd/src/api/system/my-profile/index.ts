import type {
  MyProfileDeletedQuery,
  MyProfileDeletedVo,
  MyProfileQuery,
  MyProfileStatsVo,
  MyProfileListVo,
} from './model';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  list = '/manager/my/profile/list',
  stats = '/manager/my/profile/stats',
  export = '/manager/my/profile/export',
  deleted = '/manager/my/profile/deleted',
  deletedExport = '/manager/my/profile/deleted/export',
}

/** 查询我的码号列表 */
export function myProfileList(params?: MyProfileQuery) {
  return alovaInstance.get<PageResult<MyProfileListVo>>(Api.list, { params });
}

/** 统计卡片（不受筛选影响） */
export function myProfileStats() {
  return alovaInstance.get<MyProfileStatsVo>(Api.stats);
}

/** 导出我的码号列表 */
export function myProfileExport(data: Record<string, any>) {
  return commonExport(Api.export, data);
}

/** 删除记录列表 */
export function myProfileDeletedList(params?: MyProfileDeletedQuery) {
  return alovaInstance.get<PageResult<MyProfileDeletedVo>>(Api.deleted, {
    params,
  });
}

/** 导出删除记录 */
export function myProfileDeletedExport(data: Record<string, any>) {
  return commonExport(Api.deletedExport, data);
}
