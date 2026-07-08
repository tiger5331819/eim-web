/** 分配状态：未分配=蓝 / 已分配=青 */
const ASSIGNED_MAP: Record<string, { color: string; text: string }> = {
  '0': { color: 'blue', text: '未分配' },
  '1': { color: 'cyan', text: '已分配' },
  false: { color: 'blue', text: '未分配' },
  true: { color: 'cyan', text: '已分配' },
  未分配: { color: 'blue', text: '未分配' },
  已分配: { color: 'cyan', text: '已分配' },
};

export const CARD_VENDOR_OPTIONS = [
  { value: '东信和平', label: '东信和平' },
  { value: '华弘', label: '华弘' },
  { value: '捷德', label: '捷德' },
  { value: 'Valid', label: 'Valid' },
  { value: '天喻', label: '天喻' },
];

export const ASSIGNED_STATUS_OPTIONS = [
  { value: '未分配', label: '未分配' },
  { value: '已分配', label: '已分配' },
];

const ASSIGNED_API_MAP: Record<string, string> = {
  未分配: '0',
  已分配: '1',
};

export function getAssignedMeta(assigned?: boolean | string, assignedText?: string) {
  if (assignedText) {
    const byText = ASSIGNED_MAP[assignedText];
    if (byText) return byText;
    return { color: 'default', text: assignedText };
  }
  if (assigned === undefined || assigned === null) {
    return { color: 'default', text: '--' };
  }
  const key = String(assigned);
  return ASSIGNED_MAP[key] ?? { color: 'default', text: key };
}

export function formatInventoryField(value?: string) {
  return value?.trim() ? value : '--';
}

export function mapInventoryQuery(formValues: Record<string, any> = {}) {
  const { assigned, ...rest } = formValues;
  return {
    ...rest,
    ...(assigned ? { assigned: ASSIGNED_API_MAP[assigned] ?? assigned } : {}),
  };
}

export function mapImportLogQuery(formValues: Record<string, any> = {}) {
  return { ...formValues };
}

export function isAssigned(row: { assigned?: boolean }) {
  return row.assigned === true;
}

export function canAssign(row: { assigned?: boolean }) {
  return !isAssigned(row);
}

export function canDelete(row: { assigned?: boolean }) {
  return !isAssigned(row);
}

export function canRecycle(row: { assigned?: boolean }) {
  return isAssigned(row);
}

export function canDownloadImportDetail(status?: string) {
  const value = status?.toUpperCase();
  return value === 'SUCCESS' || value === 'ERROR';
}
