/** 变动类型映射：入池=绿 / 出池=蓝 / 回收=橙 / 删除=红 */
const CHANGE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  POOL_IN: { color: 'green', text: '入池' },
  POOL_OUT: { color: 'blue', text: '出池' },
  RECYCLE: { color: 'orange', text: '回收' },
  DELETE: { color: 'red', text: '删除' },
  入池: { color: 'green', text: '入池' },
  出池: { color: 'blue', text: '出池' },
  回收: { color: 'orange', text: '回收' },
  删除: { color: 'red', text: '删除' },
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
    CHANGE_TYPE_MAP[type.toUpperCase()] ?? {
      color: 'default',
      text: type,
    }
  );
}

export const CHANGE_TYPE_OPTIONS = [
  { value: '入池', label: '入池' },
  { value: '出池', label: '出池' },
  { value: '回收', label: '回收' },
  { value: '删除', label: '删除' },
];

const CHANGE_TYPE_API_MAP: Record<string, string> = {
  入池: 'POOL_IN',
  出池: 'POOL_OUT',
  回收: 'RECYCLE',
  删除: 'DELETE',
};

export function mapChangeLogQuery(formValues: Record<string, any> = {}) {
  const { changeType, ...rest } = formValues;
  return {
    ...rest,
    ...(changeType
      ? { changeType: CHANGE_TYPE_API_MAP[changeType] ?? changeType }
      : {}),
  };
}

export function mapChangeDetailQuery(formValues: Record<string, any> = {}) {
  const { changeType, ...rest } = formValues;
  return {
    ...rest,
    ...(changeType
      ? { changeType: CHANGE_TYPE_API_MAP[changeType] ?? changeType }
      : {}),
  };
}

export function formatChangeTenantName(tenantName?: string) {
  return tenantName?.trim() ? tenantName : '--';
}
