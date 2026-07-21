/** 租户状态 */
const TENANT_STATUS_MAP: Record<string, { color: string; text: string }> = {
  '0': { color: 'green', text: '启用' },
  '1': { color: 'red', text: '禁用' },
  启用: { color: 'green', text: '启用' },
  禁用: { color: 'red', text: '禁用' },
};

export function getTenantStatusMeta(status?: string) {
  if (!status) return { color: 'default', text: '--' };
  return (
    TENANT_STATUS_MAP[status] ?? { color: 'default', text: status }
  );
}

export const TENANT_STATUS_OPTIONS = [
  { value: '启用', label: '启用' },
  { value: '禁用', label: '禁用' },
];

const TENANT_STATUS_API_MAP: Record<string, string> = {
  启用: '0',
  禁用: '1',
};

/** 预警状态 */
const WARN_LEVEL_MAP: Record<string, { color: string; text: string }> = {
  NORMAL: { color: 'green', text: '正常' },
  WARN: { color: 'orange', text: '预警' },
  LOCKED: { color: 'red', text: '锁定' },
  正常: { color: 'green', text: '正常' },
  预警: { color: 'orange', text: '预警' },
  锁定: { color: 'red', text: '锁定' },
};

export function getWarnLevelMeta(level?: string) {
  if (!level) return { color: 'default', text: '--' };
  return (
    WARN_LEVEL_MAP[level] ?? WARN_LEVEL_MAP[level.toUpperCase()] ?? {
      color: 'default',
      text: level,
    }
  );
}

export const WARN_LEVEL_OPTIONS = [
  { value: '正常', label: '正常' },
  { value: '预警', label: '预警' },
  { value: '锁定', label: '锁定' },
];

const WARN_LEVEL_API_MAP: Record<string, string> = {
  正常: 'NORMAL',
  预警: 'WARN',
  锁定: 'LOCKED',
};

/** 变动类型 */
const CHANGE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  ADD: { color: 'green', text: '充值' },
  ADJUST: { color: 'red', text: '扣减' },
  RELEASE: { color: 'orange', text: '回退' },
  CONFIRM: { color: 'red', text: '消耗' },
  FREEZE: { color: 'orange', text: '冻结' },
  EXPIRE: { color: 'red', text: '过期' },
  充值: { color: 'green', text: '充值' },
  扣减: { color: 'red', text: '扣减' },
  回退: { color: 'orange', text: '回退' },
  冻结: { color: 'orange', text: '冻结' },
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
  { value: '消耗', label: '消耗' },
  { value: '回退', label: '回退' },
  { value: '扣减', label: '扣减' },
  { value: '冻结', label: '冻结' },
];

const CHANGE_TYPE_API_MAP: Record<string, string> = {
  充值: 'ADD',
  扣减: 'ADJUST',
  回退: 'RELEASE',
  冻结: 'FREEZE',
  消耗: 'CONFIRM',
};

export function getAvailableQuotaClass(quota?: number) {
  if (quota === undefined || quota === null) return '';
  if (quota === 0) return 'text-red-600 dark:text-red-400';
  return '';
}

export function mapTenantQuery(formValues: Record<string, any> = {}) {
  const { tenantStatus, warnLevel, ...rest } = formValues;
  return {
    ...rest,
    ...(tenantStatus
      ? { tenantStatus: TENANT_STATUS_API_MAP[tenantStatus] ?? tenantStatus }
      : {}),
    ...(warnLevel
      ? { warnLevel: WARN_LEVEL_API_MAP[warnLevel] ?? warnLevel }
      : {}),
  };
}

export function mapRecordQuery(formValues: Record<string, any> = {}) {
  const { changeType, ...rest } = formValues;
  return {
    ...rest,
    ...(changeType
      ? { changeType: CHANGE_TYPE_API_MAP[changeType] ?? changeType }
      : {}),
  };
}

export const ADJUST_TYPE_OPTIONS = [
  { value: 'RECHARGE', label: '充值' },
  { value: 'DEDUCT', label: '扣减' },
];
