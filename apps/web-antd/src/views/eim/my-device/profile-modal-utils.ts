import type { ApnVO } from '#/api/system/apn/model';
import type { DeviceProfileVo } from '#/api/system/device/model';

import { getTenantPoolOperatorOptions } from '#/api/system/tenant-pool';

export function mapApnSelectOptions(list?: ApnVO[]) {
  return (list || []).map((item) => ({
    label: item.apn || item.name || String(item.id),
    value: String(item.id),
  }));
}

export function resolveDefaultApnId(
  list: ApnVO[],
  preferred?: {
    apn?: string;
    apnId?: string;
    apnName?: string;
  },
) {
  if (preferred?.apnId) {
    const byId = list.find((item) => String(item.id) === String(preferred.apnId));
    if (byId) return String(byId.id);
  }
  const apnText = preferred?.apn || preferred?.apnName;
  if (apnText) {
    const byApn = list.find(
      (item) => item.apn === apnText || item.name === apnText,
    );
    if (byApn) return String(byApn.id);
  }
  const defaultApn = list.find((item) => item.isDefault === '1');
  if (defaultApn) return String(defaultApn.id);
  return list[0] ? String(list[0].id) : undefined;
}

export async function resolveProfileOperatorId(
  row: DeviceProfileVo,
  tenantId?: string,
) {
  if (row.operatorId !== undefined && row.operatorId !== null && row.operatorId !== '') {
    return row.operatorId;
  }
  const operatorName = row.operatorName || row.issuer || row.providerName;
  if (!operatorName) return undefined;
  const options = await getTenantPoolOperatorOptions(
    tenantId ? { tenantId: String(tenantId) } : undefined,
  );
  const matched = options.find(
    (item) =>
      item.label === operatorName ||
      String(item.label).includes(operatorName) ||
      operatorName.includes(String(item.label)),
  );
  return matched?.value;
}
