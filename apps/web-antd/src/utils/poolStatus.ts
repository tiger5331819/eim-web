/** 平台总池状态映射 */
export const POOL_STATUS_MAP: Record<string, { color: string; text: string }> = {
  UNASSIGNED:  { color: 'default', text: '未分配' },
  ASSIGNED:    { color: 'blue',    text: '已分配' },
  DOWNLOADED:  { color: 'green',   text: '已下载' },
  RECYCLEABLE: { color: 'orange',  text: '可回收' },
};

export function getPoolStatusMeta(status?: string) {
  if (!status) return { color: 'default', text: '--' };
  return POOL_STATUS_MAP[status] ?? { color: 'default', text: status };
}

export const POOL_STATUS_OPTIONS = Object.entries(POOL_STATUS_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);

/** 租户资源池状态映射 */
export const TENANT_POOL_STATUS_MAP: Record<
  string,
  { color: string; text: string }
> = {
  ASSIGNED:    { color: 'cyan',   text: '空闲' },
  DOWNLOADED:  { color: 'green',  text: '已下载' },
  RECYCLEABLE: { color: 'red',    text: '已删除' },
};

export function getTenantPoolStatusMeta(status?: string) {
  if (!status) return { color: 'default', text: '--' };
  return TENANT_POOL_STATUS_MAP[status] ?? { color: 'default', text: status };
}

export const TENANT_POOL_STATUS_OPTIONS = Object.entries(
  TENANT_POOL_STATUS_MAP,
).map(([value, { text }]) => ({ value, label: text }));

/** 调配动作类型映射 */
export const ALLOCATION_ACTION_MAP: Record<
  string,
  { color: string; text: string }
> = {
  ALLOCATE: { color: 'blue',   text: '分配' },
  TRANSFER: { color: 'purple', text: '调配' },
  RECYCLE:  { color: 'orange', text: '回收' },
};

export function getAllocationActionMeta(action?: string) {
  if (!action) return { color: 'default', text: '--' };
  return ALLOCATION_ACTION_MAP[action] ?? { color: 'default', text: action };
}

export const ALLOCATION_ACTION_OPTIONS = Object.entries(
  ALLOCATION_ACTION_MAP,
).map(([value, { text }]) => ({ value, label: text }));
