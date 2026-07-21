import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { EuiccAssignRecordVo } from '#/api/system/inventory/model';

import { getLedgerTenantOptions } from '#/api/system/profile-ledger';
import {
  ASSIGNED_STATUS_OPTIONS,
  CARD_VENDOR_OPTIONS,
  formatInventoryField,
} from '#/utils/inventoryStatus';
import { IMPORT_STATUS_OPTIONS } from '#/utils/profileLedgerStatus';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入入库批次号' },
    fieldName: 'importBatch',
    label: '入库批次号',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入EID' },
    fieldName: 'eid',
    label: 'EID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入预制种子号' },
    fieldName: 'seedNo',
    label: '预制种子号',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: CARD_VENDOR_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'cardVendor',
    label: '制卡商',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '入库时间',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入入库人' },
    fieldName: 'createByName',
    label: '入库人',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: ASSIGNED_STATUS_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'assigned',
    label: '分配状态',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getLedgerTenantOptions,
      placeholder: '全部',
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'assignedTenantId',
    label: '分配租户',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入分配人' },
    fieldName: 'assignedUser',
    label: '分配人',
  },
  {
    component: 'RangePicker',
    fieldName: 'assignedTime',
    label: '分配时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: '入库批次号', field: 'importBatch', minWidth: 150 },
  { title: 'EID', field: 'eid', minWidth: 190 },
  {
    title: '预制种子号',
    field: 'seedNo',
    minWidth: 140,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '制卡商',
    field: 'cardVendor',
    minWidth: 110,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '入库时间',
    field: 'createTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '入库人',
    field: 'createByName',
    minWidth: 110,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '分配状态',
    field: 'assigned',
    minWidth: 100,
    slots: { default: 'assigned' },
  },
  {
    title: '分配租户',
    field: 'assignedTenantName',
    minWidth: 160,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '分配人',
    field: 'assignedUser',
    minWidth: 110,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '分配时间',
    field: 'assignedTime',
    minWidth: 170,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 120,
  },
];

export const importLogQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入入库批次号' },
    fieldName: 'importBatch',
    label: '入库批次号',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: IMPORT_STATUS_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'status',
    label: '导入状态',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入操作人' },
    fieldName: 'operatorName',
    label: '操作人',
  },
  {
    component: 'RangePicker',
    fieldName: 'startTime',
    label: '开始时间',
  },
  {
    component: 'RangePicker',
    fieldName: 'endTime',
    label: '完成时间',
  },
];

export const importLogColumns: VxeGridProps['columns'] = [
  {
    title: '入库批次号',
    field: 'importBatch',
    minWidth: 170,
    fixed: 'left',
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '导入状态',
    field: 'status',
    minWidth: 100,
    slots: { default: 'importStatus' },
  },
  {
    title: 'EID数',
    field: 'totalCount',
    minWidth: 90,
    formatter: ({ cellValue }) =>
      cellValue === undefined || cellValue === null ? '--' : cellValue,
  },
  {
    title: '成功数',
    field: 'successCount',
    minWidth: 90,
    formatter: ({ cellValue }) =>
      cellValue === undefined || cellValue === null ? '--' : cellValue,
  },
  {
    title: '失败数',
    field: 'failCount',
    minWidth: 90,
    formatter: ({ cellValue }) =>
      cellValue === undefined || cellValue === null ? '--' : cellValue,
  },
  {
    title: '操作人',
    field: 'operatorName',
    minWidth: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '开始时间',
    field: 'startTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '完成时间',
    field: 'endTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 100,
  },
];

export function getUnrecyclableCount(row: EuiccAssignRecordVo) {
  if (row.unrecyclableCount != null) return row.unrecyclableCount;
  if (row.downloadedCount != null) return row.downloadedCount;
  if (row.totalCount != null && row.recyclableCount != null) {
    return Math.max(row.totalCount - row.recyclableCount, 0);
  }
  return undefined;
}

export function formatUnrecyclableDisplay(row: EuiccAssignRecordVo) {
  const count = getUnrecyclableCount(row);
  if (count === undefined) return '--';
  return `${count} (已下载号码)`;
}

export const recycleRecordQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入变动编号' },
    fieldName: 'changeNo',
    label: '变动编号',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getLedgerTenantOptions,
      placeholder: '全部',
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'tenantId',
    label: '租户',
  },
];

export const recycleRecordColumns: VxeGridProps['columns'] = [
  { type: 'radio', width: 60 },
  { title: '变动编号', field: 'changeNo', minWidth: 180 },
  {
    title: '租户',
    field: 'tenantName',
    minWidth: 160,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '分配数量',
    field: 'totalCount',
    minWidth: 100,
    formatter: ({ cellValue }) =>
      cellValue === undefined || cellValue === null ? '--' : cellValue,
  },
  {
    title: '可回收数量',
    field: 'recyclableCount',
    minWidth: 110,
    slots: { default: 'recyclableCount' },
  },
  {
    title: '操作时间',
    field: 'operateTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
];

export const inventoryFieldMappingTime = [
  [
    'createTime',
    ['beginCreateTime', 'endCreateTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
  [
    'assignedTime',
    ['beginAssignedTime', 'endAssignedTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
] as [string, [string, string], [string, string]][];

export const importLogFieldMappingTime = [
  [
    'startTime',
    ['beginStartTime', 'endStartTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
  [
    'endTime',
    ['beginEndTime', 'endEndTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
] as [string, [string, string], [string, string]][];
