import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getTenantPoolOperatorOptions } from '#/api/system/tenant-pool';
import { CODE_STATUS_OPTIONS } from '#/utils/profileLedgerStatus';
import { formatTenantPoolName } from '#/utils/tenantPoolStatus';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入租户名称' },
    fieldName: 'tenantName',
    label: '租户名称',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    title: '租户名称',
    field: 'tenantName',
    minWidth: 180,
    formatter: ({ cellValue }) => formatTenantPoolName(cellValue),
  },
  {
    title: '空闲码号数',
    field: 'idle',
    minWidth: 110,
    slots: { default: 'idle' },
  },
  {
    title: '已下载码号数',
    field: 'downloaded',
    minWidth: 120,
    slots: { default: 'downloaded' },
  },
  {
    title: '锁定码号数',
    field: 'locked',
    minWidth: 110,
    slots: { default: 'locked' },
  },
  {
    title: '可回收码号数',
    field: 'recyclable',
    minWidth: 120,
    slots: { default: 'recyclable' },
  },
  {
    title: '不可回收码号数',
    field: 'unrecyclable',
    minWidth: 130,
    slots: { default: 'unrecyclable' },
  },
  {
    title: '总数',
    field: 'total',
    minWidth: 90,
    slots: { default: 'total' },
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

export const detailQuerySchema: FormSchemaGetter = () => [
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
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getTenantPoolOperatorOptions,
      params: {},
      shouldFetch: (params: { tenantId?: string }) => !!params.tenantId,
      placeholder: '请选择',
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'operatorId',
    label: '运营商',
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
    fieldName: 'assignUser',
    label: '分配人',
  },
  {
    component: 'RangePicker',
    fieldName: 'assignTime',
    label: '分配时间',
  },
  {
    component: 'RangePicker',
    fieldName: 'downloadTime',
    label: '下载时间',
  },
];

export const detailColumns: VxeGridProps['columns'] = [
  { title: 'ACcode', field: 'accode', minWidth: 130 },
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
    title: '码号状态',
    field: 'codeStatus',
    minWidth: 100,
    slots: { default: 'codeStatus' },
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
    title: '下载时间',
    field: 'downloadedTime',
    minWidth: 170,
    slots: { default: 'downloadedTime' },
  },
  {
    title: '创建人',
    field: 'createByName',
    minWidth: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '创建时间',
    field: 'createTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
];

export const detailFieldMappingTime = [
  [
    'assignTime',
    ['beginAssignTime', 'endAssignTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
  [
    'downloadTime',
    ['beginDownloadTime', 'endDownloadTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
] as [string, [string, string], [string, string]][];
