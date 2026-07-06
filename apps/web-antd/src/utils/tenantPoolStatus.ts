/** 租户池五态数量标签配色 */
export const TENANT_POOL_COUNT_META = {
  idle: { color: 'blue', label: '空闲码号数' },
  downloaded: { color: 'green', label: '已下载码号数' },
  locked: { color: 'orange', label: '锁定码号数' },
  recyclable: { color: 'gold', label: '可回收码号数' },
  unrecyclable: { color: 'red', label: '不可回收码号数' },
} as const;

export function formatTenantPoolName(tenantName?: string) {
  return tenantName?.trim() ? tenantName : '未命名租户';
}

export function formatDetailDownloadTime(
  codeStatus?: string,
  downloadedTime?: string,
) {
  const status = codeStatus?.toUpperCase();
  if (status === 'LOCKED') return '--';
  if (
    status === 'DOWNLOADED' ||
    status === 'RECYCLABLE' ||
    status === 'UNRECYCLABLE'
  ) {
    return downloadedTime || '--';
  }
  return '--';
}
