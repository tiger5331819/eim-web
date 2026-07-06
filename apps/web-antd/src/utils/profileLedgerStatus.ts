/** 码号状态映射 */
export const CODE_STATUS_MAP: Record<string, { color: string; text: string }> = {
  IDLE: { color: 'blue', text: '空闲' },
  DOWNLOADED: { color: 'green', text: '已下载' },
  LOCKED: { color: 'orange', text: '锁定' },
  RECYCLABLE: { color: 'gold', text: '可回收' },
  UNRECYCLABLE: { color: 'red', text: '不可回收' },
};

export function getCodeStatusMeta(status?: string, statusText?: string) {
  if (statusText) {
    const byText = Object.values(CODE_STATUS_MAP).find(
      (item) => item.text === statusText,
    );
    if (byText) return byText;
    return { color: 'default', text: statusText };
  }
  if (!status) return { color: 'default', text: '--' };
  return (
    CODE_STATUS_MAP[status] ??
    CODE_STATUS_MAP[status.toUpperCase()] ?? {
      color: 'default',
      text: status,
    }
  );
}

export const CODE_STATUS_OPTIONS = Object.entries(CODE_STATUS_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);


/** 入池状态映射 */
export const POOL_ENTRY_STATUS_MAP: Record<
  string,
  { color: string; text: string }
> = {
  UNPOOLED: { color: 'blue', text: '未入池' },
  POOLED: { color: 'cyan', text: '已入池' },
};

export function getPoolEntryStatusMeta(status?: string, statusText?: string) {
  if (statusText) {
    const byText = Object.values(POOL_ENTRY_STATUS_MAP).find(
      (item) => item.text === statusText,
    );
    if (byText) return byText;
    return { color: 'default', text: statusText };
  }
  if (!status) return { color: 'default', text: '--' };
  return (
    POOL_ENTRY_STATUS_MAP[status] ??
    POOL_ENTRY_STATUS_MAP[status.toUpperCase()] ?? {
      color: 'default',
      text: status,
    }
  );
}

export const POOL_ENTRY_STATUS_OPTIONS = Object.entries(POOL_ENTRY_STATUS_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);


/** 导入状态映射 */
export const IMPORT_STATUS_MAP: Record<string, { color: string; text: string }> =
  {
    PENDING: { color: 'default', text: '待开始' },
    RUNNING: { color: 'blue', text: '进行中' },
    SUCCESS: { color: 'green', text: '已完成' },
    ERROR: { color: 'red', text: '已出错' },
  };

export function getImportStatusMeta(status?: string, statusText?: string) {
  if (statusText) {
    const byText = Object.values(IMPORT_STATUS_MAP).find(
      (item) => item.text === statusText,
    );
    if (byText) return byText;
    return { color: 'default', text: statusText };
  }
  if (!status) return { color: 'default', text: '--' };
  return (
    IMPORT_STATUS_MAP[status] ??
    IMPORT_STATUS_MAP[status.toUpperCase()] ?? {
      color: 'default',
      text: status,
    }
  );
}

export const IMPORT_STATUS_OPTIONS = Object.entries(IMPORT_STATUS_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);

export function mapLedgerQuery(formValues: Record<string, any> = {}) {
  return { ...formValues };
}

export function mapImportLogQuery(formValues: Record<string, any> = {}) {
  return { ...formValues };
}

export function formatDownloadField(
  codeStatus?: string,
  value?: string,
) {
  const status = codeStatus?.toUpperCase();
  if (
    status === 'DOWNLOADED' ||
    status === 'RECYCLABLE' ||
    status === 'UNRECYCLABLE'
  ) {
    return value || '--';
  }
  return '--';
}

export function formatTenantName(
  poolStatus?: string,
  tenantName?: string,
) {
  if (poolStatus?.toUpperCase() === 'POOLED' && tenantName) {
    return tenantName;
  }
  return '--';
}

export function canPoolIn(row: { poolStatus?: string }) {
  return row.poolStatus?.toUpperCase() === 'UNPOOLED';
}

export function canPoolOut(row: {
  poolStatus?: string;
  codeStatus?: string;
}) {
  return (
    row.poolStatus?.toUpperCase() === 'POOLED' &&
    row.codeStatus?.toUpperCase() === 'IDLE'
  );
}

export function canRecycle(row: {
  poolStatus?: string;
  codeStatus?: string;
}) {
  return (
    row.poolStatus?.toUpperCase() === 'POOLED' &&
    row.codeStatus?.toUpperCase() === 'RECYCLABLE'
  );
}

export function canDelete(row: { poolStatus?: string }) {
  return row.poolStatus?.toUpperCase() === 'UNPOOLED';
}

export function isRecyclableRow(row: { codeStatus?: string }) {
  return row.codeStatus?.toUpperCase() === 'RECYCLABLE';
}
