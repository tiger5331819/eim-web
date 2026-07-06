/** 我的码号状态映射 */
const MY_PROFILE_STATUS_MAP: Record<string, { color: string; text: string }> =
  {
    idle: { color: 'blue', text: '空闲' },
    downloaded: { color: 'green', text: '已下载' },
    locked: { color: 'orange', text: '锁定' },
  };

export function getMyProfileStatusMeta(status?: string, statusText?: string) {
  if (!status && statusText) {
    const byText = Object.values(MY_PROFILE_STATUS_MAP).find(
      (item) => item.text === statusText,
    );
    if (byText) {
      return byText;
    }
    return { color: 'default', text: statusText };
  }
  if (!status) return { color: 'default', text: '--' };
  const key = status.toLowerCase();
  return (
    MY_PROFILE_STATUS_MAP[status] ??
    MY_PROFILE_STATUS_MAP[key] ?? { color: 'default', text: statusText || status }
  );
}

export const MY_PROFILE_STATUS_OPTIONS = [
  { value: 'idle', label: '空闲' },
  { value: 'downloaded', label: '已下载' },
  { value: 'locked', label: '锁定' },
];

export function formatBoundEid(status?: string, eid?: string) {
  if (status?.toLowerCase() === 'downloaded' && eid) {
    return eid;
  }
  return '--';
}

export function formatDownloadTime(
  status?: string,
  downloadedTime?: string,
) {
  if (status?.toLowerCase() === 'downloaded' && downloadedTime) {
    return downloadedTime;
  }
  return '--';
}
