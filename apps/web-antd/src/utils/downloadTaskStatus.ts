/** 下载任务状态：-1 失败 / 0 未完成 / 1 已完成 / 2 已取消 */
const STATE_MAP: Record<string, { color: string; text: string }> = {
  '-1': { color: 'error', text: '失败' },
  '0': { color: 'default', text: '未完成' },
  '1': { color: 'success', text: '已完成' },
  '2': { color: 'default', text: '已取消' },
  失败: { color: 'error', text: '失败' },
  未完成: { color: 'default', text: '未完成' },
  已完成: { color: 'success', text: '已完成' },
  已取消: { color: 'default', text: '已取消' },
};

export function getDownloadTaskStateMeta(state?: number | string, stateText?: string) {
  if (stateText) {
    const byText = STATE_MAP[stateText];
    if (byText) return byText;
    return { color: 'default', text: stateText };
  }
  if (state === undefined || state === null || state === '') {
    return { color: 'default', text: '--' };
  }
  return STATE_MAP[String(state)] ?? { color: 'default', text: String(state) };
}

export const DOWNLOAD_TASK_STATE_OPTIONS = [
  { value: 0, label: '未完成' },
  { value: 1, label: '已完成' },
  { value: -1, label: '失败' },
  { value: 2, label: '已取消' },
];

export const DOWNLOAD_TASK_PROGRESS_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' },
];

export function formatDownloadProgress(
  state?: number | string,
  downloadRate?: number,
) {
  const stateNum = Number(state);
  if (stateNum === 1) return '100%';
  if (downloadRate === undefined || downloadRate === null) return '--';
  return `${downloadRate}%`;
}

export function formatDownloadField(value?: string) {
  return value?.trim() ? value : '--';
}

export function mapDownloadTaskQuery(formValues: Record<string, any> = {}) {
  const { state, downloadRate, ...rest } = formValues;
  return {
    ...rest,
    ...(state !== undefined && state !== null && state !== ''
      ? { state }
      : {}),
    ...(downloadRate !== undefined && downloadRate !== null && downloadRate !== ''
      ? { downloadRate }
      : {}),
  };
}
