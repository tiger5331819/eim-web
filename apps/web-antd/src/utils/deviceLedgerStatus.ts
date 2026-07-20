import type { DeviceLedgerVo, DeviceProfileRecordVo } from '#/api/system/device/model';

/** 在线状态筛选项 */
export const ONLINE_STATUS_OPTIONS = [
  { label: '在线', value: 1 },
  { label: '离线', value: 0 },
  { label: '未知', value: -1 },
];

/** 码号操作类型筛选项 */
export const PROFILE_OPERATION_OPTIONS = [
  { label: '下载码号', value: 'DOWNLOAD' },
  { label: '启用码号', value: 'ENABLE' },
  { label: '停用码号', value: 'DISABLE' },
  { label: '删除码号', value: 'DELETE' },
  { label: '更新APN', value: 'UPDATE_APN' },
];

const PROFILE_OPERATION_MAP: Record<string, { color: string; text: string }> = {
  DOWNLOAD: { color: 'blue', text: '下载码号' },
  ENABLE: { color: 'green', text: '启用码号' },
  DISABLE: { color: 'orange', text: '停用码号' },
  DELETE: { color: 'red', text: '删除码号' },
  UPDATE_APN: { color: 'default', text: '更新APN' },
};

export function formatEmpty(value?: null | number | string) {
  if (value === undefined || value === null || value === '') {
    return '--';
  }
  return String(value);
}

export function formatActivationField(
  activationTime?: string,
  value?: null | string,
) {
  return activationTime ? formatEmpty(value) : '--';
}

export function getTenantName(row: DeviceLedgerVo) {
  return row.tenantName || row.companyName || '--';
}

export function getOperatorName(row: DeviceLedgerVo) {
  return row.operatorName || row.providerName || '--';
}

export function getSeedNumber(row: DeviceLedgerVo) {
  return formatEmpty(row.seedNumber);
}

export function hasBoundProfile(row: DeviceLedgerVo) {
  return Boolean(row.iccid?.trim());
}

export function getBoundOperatorName(row: DeviceLedgerVo) {
  if (!hasBoundProfile(row)) return '--';
  return getOperatorName(row);
}

export function getBoundIccid(row: DeviceLedgerVo) {
  if (!hasBoundProfile(row)) return '--';
  return formatEmpty(row.iccid);
}

export function getBoundApn(row: DeviceLedgerVo) {
  if (!hasBoundProfile(row)) return '--';
  return getDeviceApn(row);
}

export function getDeviceApn(row: DeviceLedgerVo) {
  return row.apn || row.apnName || '--';
}

export function getCreateTime(row: DeviceLedgerVo) {
  return row.createTime || row.creationTime || '--';
}

export function getOnlineStatusMeta(row: {
  online?: number;
}) {
  if (row.online === 1) {
    return { color: 'green', text: '在线' };
  }
  if (row.online === 0) {
    return { color: 'default', text: '离线' };
  }
  return { color: 'gold', text: '未知' };
}

export function getProfileOperationMeta(
  type?: string,
  typeText?: string,
  name?: string,
) {
  if (typeText) {
    const byText = Object.values(PROFILE_OPERATION_MAP).find(
      (item) => item.text === typeText,
    );
    if (byText) return byText;
    return { color: 'default', text: typeText };
  }
  if (type) {
    return (
      PROFILE_OPERATION_MAP[type] ??
      PROFILE_OPERATION_MAP[type.toUpperCase()] ?? {
        color: 'default',
        text: type,
      }
    );
  }
  if (name) {
    const byName = Object.values(PROFILE_OPERATION_MAP).find(
      (item) => item.text === name,
    );
    if (byName) return byName;
    return { color: 'default', text: name };
  }
  return { color: 'default', text: '--' };
}

export function mapDeviceLedgerQuery(values: Record<string, any> = {}) {
  return { ...values };
}

export function isProfileEnabled(state?: number | string) {
  return String(state) === '1';
}

export function normalizeProfileRecord(row: DeviceProfileRecordVo) {
  return {
    ...row,
    operatorName: row.operatorName || '--',
    operateTime: row.operateTime || row.creationTime || '--',
  };
}
