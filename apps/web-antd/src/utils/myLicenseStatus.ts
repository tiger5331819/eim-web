/** 下载结果 */
const DOWNLOAD_RESULT_MAP: Record<string, { color: string; text: string }> = {
  SUCCESS: { color: 'green', text: '成功' },
  FAIL: { color: 'red', text: '失败' },
  DOWNLOAD: { color: 'blue', text: '下载中' },
  成功: { color: 'green', text: '成功' },
  失败: { color: 'red', text: '失败' },
  下载中: { color: 'blue', text: '下载中' },
};

export function getDownloadResultMeta(result?: string) {
  if (!result) return { color: 'default', text: '--' };
  return (
    DOWNLOAD_RESULT_MAP[result] ??
    DOWNLOAD_RESULT_MAP[result.toUpperCase()] ?? {
      color: 'default',
      text: result,
    }
  );
}

export const DOWNLOAD_RESULT_OPTIONS = [
  { value: '成功', label: '成功' },
  { value: '失败', label: '失败' },
  { value: '下载中', label: '下载中' },
];

/** 变动类型：充值/回退=绿 / 扣减/消耗/过期=红 */
const CHANGE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  ADD: { color: 'green', text: '充值' },
  ADJUST: { color: 'red', text: '扣减' },
  RELEASE: { color: 'green', text: '回退' },
  CONFIRM: { color: 'red', text: '消耗' },
  EXPIRE: { color: 'red', text: '过期' },
  充值: { color: 'green', text: '充值' },
  扣减: { color: 'red', text: '扣减' },
  回退: { color: 'green', text: '回退' },
  消耗: { color: 'red', text: '消耗' },
};

export function getChangeTypeMeta(type?: string, typeText?: string) {
  if (typeText) {
    const byText = Object.values(CHANGE_TYPE_MAP).find(
      (item) => item.text === typeText,
    );
    if (byText) return byText;
    return { color: 'default', text: typeText };
  }
  if (!type) return { color: 'default', text: '--' };
  return (
    CHANGE_TYPE_MAP[type] ??
    CHANGE_TYPE_MAP[type.toUpperCase()] ?? { color: 'default', text: type }
  );
}

export const CHANGE_TYPE_OPTIONS = [
  { value: '充值', label: '充值' },
  { value: '扣减', label: '扣减' },
  { value: '回退', label: '回退' },
  { value: '消耗', label: '消耗' },
];

export function getAvailableQuotaClass(quota?: number) {
  if (quota === undefined || quota === null) return '';
  if (quota === 0) return 'text-red-600 dark:text-red-400';
  if (quota <= 10) return 'text-orange-500 dark:text-orange-400';
  return '';
}

export function shouldShowLicenseWarning(quota?: number) {
  return quota !== undefined && quota !== null && quota <= 10;
}
