import type { ApiCredentialBo, ApiCredentialQuery, ApiCredentialVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport, toIdPath } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/api/credential',
  list = '/manager/api/credential/list',
  export = '/manager/api/credential/export',
}

/** 查询 API 密钥分页列表 */
export function apiCredentialList(params?: ApiCredentialQuery) {
  return alovaInstance.get<PageResult<ApiCredentialVO>>(Api.list, { params });
}

/** 新建密钥 */
export function apiCredentialAdd(data: ApiCredentialBo) {
  return alovaInstance.postWithMsg<ApiCredentialVO>(Api.root, data);
}

/** 导出密钥列表 */
export function apiCredentialExport(data: Record<string, any>) {
  return commonExport(Api.export, data);
}

/** 切换状态（启用/停用） status: 0启用 1停用 */
export function apiCredentialChangeStatus(id: ID, status: string) {
  return alovaInstance.putWithMsg<void>(
    `${Api.root}/${toIdPath(id)}/status`,
    {},
    {
      params: { status },
      successMessageMode: 'none',
    },
  );
}

/** 重置密钥 */
export function apiCredentialReset(id: ID) {
  return alovaInstance.putWithMsg<ApiCredentialVO>(
    `${Api.root}/${toIdPath(id)}/reset`,
    {},
    { successMessageMode: 'none' },
  );
}

/** 查看密钥（含 AppKey / AppSecret 等信息） */
export function apiCredentialViewSecret(id: ID) {
  return alovaInstance.get<ApiCredentialVO>(
    `${Api.root}/${toIdPath(id)}/view-secret`,
  );
}

/** 查看 AppSecret 明文 */
export function apiCredentialSecret(id: ID, reveal = false) {
  return alovaInstance.get<string>(`${Api.root}/${toIdPath(id)}/secret`, {
    params: { reveal },
  });
}

/** 删除密钥 */
export function apiCredentialRemove(ids: ID | IDS) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${toIdPath(ids)}`);
}
