import type { PageQuery } from '#/api/common';

/** API 密钥视图对象 */
export interface ApiCredentialVO {
  id: string;
  credentialName?: string;
  appKey?: string;
  /** 仅新建/重置时返回明文，列表通常不返回 */
  appSecret?: string;
  /** 状态(0启用 1停用) */
  status?: string;
  tenantId?: string;
  tenantName?: string;
  expireTime?: string;
  lastUseTime?: string;
  createTime?: string;
}

export interface ApiCredentialQuery extends PageQuery {
  credentialName?: string;
  status?: string;
  tenantId?: string;
  /** 租户名称（模糊） */
  tenantName?: string;
}

export interface ApiCredentialBo {
  id?: string;
  credentialName: string;
  status?: string;
  tenantId?: string;
  tenantName?: string;
}
