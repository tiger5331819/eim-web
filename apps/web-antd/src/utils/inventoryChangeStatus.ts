import type { InventoryChangeLogVo } from '#/api/system/inventory-change/model';

/** 变动类型映射：分配=青 / 回收=橙 / 删除=红 */
const CHANGE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  ASSIGN: { color: 'cyan', text: '分配' },
  RECYCLE: { color: 'orange', text: '回收' },
  DELETE: { color: 'red', text: '删除' },
  分配: { color: 'cyan', text: '分配' },
  回收: { color: 'orange', text: '回收' },
  删除: { color: 'red', text: '删除' },
};

export function getInventoryChangeTypeMeta(type?: string, typeText?: string) {
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

export const INVENTORY_CHANGE_TYPE_OPTIONS = [
  { value: '分配', label: '分配' },
  { value: '回收', label: '回收' },
  { value: '删除', label: '删除' },
];

const CHANGE_TYPE_API_MAP: Record<string, string> = {
  分配: 'ASSIGN',
  回收: 'RECYCLE',
  删除: 'DELETE',
};

export function mapInventoryChangeLogQuery(formValues: Record<string, any> = {}) {
  const { changeType, ...rest } = formValues;
  return {
    ...rest,
    ...(changeType
      ? { changeType: CHANGE_TYPE_API_MAP[changeType] ?? changeType }
      : {}),
  };
}

export function mapInventoryChangeDetailQuery(
  formValues: Record<string, any> = {},
) {
  const { changeType, ...rest } = formValues;
  return {
    ...rest,
    ...(changeType
      ? { changeType: CHANGE_TYPE_API_MAP[changeType] ?? changeType }
      : {}),
  };
}

export function formatInventoryField(value?: string) {
  return value?.trim() ? value : '--';
}

export function formatTargetSourceTenant(row: InventoryChangeLogVo) {
  const meta = getInventoryChangeTypeMeta(row.changeType, row.changeTypeText);
  if (meta.text === '删除') return '--';
  if (row.tenantName?.trim()) return row.tenantName;
  if (meta.text === '分配') {
    return formatInventoryField(row.targetTenantName);
  }
  if (meta.text === '回收') {
    return formatInventoryField(row.sourceTenantName);
  }
  return formatInventoryField(row.tenantName);
}
