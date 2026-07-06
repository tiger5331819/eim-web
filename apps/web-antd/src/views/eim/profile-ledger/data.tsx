import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getLedgerTenantOptions } from '#/api/system/profile-ledger';
import { getOperatorOptions } from '#/api/system/operator';
import {
  CODE_STATUS_OPTIONS,
  formatDownloadField,
  formatTenantName,
  IMPORT_STATUS_OPTIONS,
  POOL_ENTRY_STATUS_OPTIONS,
} from '#/utils/profileLedgerStatus';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getLedgerTenantOptions,
      placeholder: '请选择',
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'tenantId',
    label: '租户',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'productionBatch',
    label: '导入批次',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'accode',
    label: 'ACcode',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'iccid',
    label: 'ICCID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'msisdn',
    label: 'MSISDN',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'imsi',
    label: 'IMSI',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getOperatorOptions,
      placeholder: '请选择',
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'operatorId',
    label: '运营商',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'resourceSource',
    label: '资源来源',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: CODE_STATUS_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'codeStatus',
    label: '码号状态',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'downloadUser',
    label: '下载人',
  },
  {
    component: 'RangePicker',
    fieldName: 'downloadTime',
    label: '下载时间',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: POOL_ENTRY_STATUS_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'poolStatus',
    label: '入池状态',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'assignUser',
    label: '分配人',
  },
  {
    component: 'RangePicker',
    fieldName: 'assignTime',
    label: '分配时间',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'createByName',
    label: '创建人',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '创建时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '租户',
    field: 'tenantName',
    minWidth: 140,
    formatter: ({ row }) => formatTenantName(row.poolStatus, row.tenantName),
  },
  {
    title: '导入批次',
    field: 'productionBatch',
    minWidth: 160,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  { title: 'ACcode', field: 'accode', minWidth: 140 },
  { title: 'ICCID', field: 'iccid', minWidth: 190 },
  { title: 'MSISDN', field: 'msisdn', minWidth: 140 },
  { title: 'IMSI', field: 'imsi', minWidth: 150 },
  {
    title: '运营商',
    field: 'operatorName',
    minWidth: 120,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '资源来源',
    field: 'resourceSource',
    minWidth: 140,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '码号状态',
    field: 'codeStatus',
    minWidth: 100,
    slots: { default: 'codeStatus' },
  },
  {
    title: '下载人',
    field: 'downloadUser',
    minWidth: 110,
    formatter: ({ row }) =>
      formatDownloadField(row.codeStatus, row.downloadUser),
  },
  {
    title: '下载时间',
    field: 'downloadedTime',
    minWidth: 170,
    formatter: ({ row }) =>
      formatDownloadField(row.codeStatus, row.downloadedTime),
  },
  {
    title: '入池状态',
    field: 'poolStatus',
    minWidth: 100,
    slots: { default: 'poolStatus' },
  },
  {
    title: '分配人',
    field: 'assignUser',
    minWidth: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '分配时间',
    field: 'assignedTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '创建人',
    field: 'createByName',
    minWidth: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  { title: '创建时间', field: 'createTime', minWidth: 170 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 200,
  },
];

export const importLogQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'importBatch',
    label: '导入批次号',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'operatorName',
    label: '操作人',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: IMPORT_STATUS_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'status',
    label: '导入状态',
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
    title: '导入批次号',
    field: 'importBatch',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '导入状态',
    field: 'status',
    minWidth: 100,
    slots: { default: 'importStatus' },
  },
  {
    title: '码号数',
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
  { title: '开始时间', field: 'startTime', minWidth: 170 },
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

export const ledgerFieldMappingTime = [
  [
    'downloadTime',
    ['beginDownloadTime', 'endDownloadTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
  [
    'assignTime',
    ['beginAssignTime', 'endAssignTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
  [
    'createTime',
    ['beginCreateTime', 'endCreateTime'],
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
