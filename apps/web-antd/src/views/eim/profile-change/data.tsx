import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getLedgerTenantOptions } from '#/api/system/profile-ledger';
import { getOperatorOptions } from '#/api/system/operator';
import {
  CHANGE_TYPE_OPTIONS,
  formatChangeTenantName,
} from '#/utils/profileChangeStatus';
import { CODE_STATUS_OPTIONS } from '#/utils/profileLedgerStatus';

export const logQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入变动编号' },
    fieldName: 'changeNo',
    label: '变动编号',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: CHANGE_TYPE_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'changeType',
    label: '变动类型',
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
    fieldName: 'changeTenantId',
    label: '变动租户',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入操作人' },
    fieldName: 'operatorName',
    label: '操作人',
  },
  {
    component: 'RangePicker',
    fieldName: 'operateTime',
    label: '操作时间',
  },
];

export const logColumns: VxeGridProps['columns'] = [
  { title: '变动编号', field: 'changeNo', minWidth: 160 },
  {
    title: '变动租户',
    field: 'changeTenantName',
    minWidth: 160,
    formatter: ({ cellValue }) => formatChangeTenantName(cellValue),
  },
  {
    title: '变动数量',
    field: 'changeCount',
    minWidth: 100,
    slots: { default: 'changeCount' },
  },
  {
    title: '变动类型',
    field: 'changeType',
    minWidth: 100,
    slots: { default: 'changeType' },
  },
  {
    title: '操作人',
    field: 'operatorName',
    minWidth: 120,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '操作时间',
    field: 'operateTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 110,
  },
];

export const snapshotQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入快照号' },
    fieldName: 'changeNo',
    label: '快照号',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入ACcode' },
    fieldName: 'accode',
    label: 'ACcode',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入ICCID' },
    fieldName: 'iccid',
    label: 'ICCID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入MSISDN' },
    fieldName: 'msisdn',
    label: 'MSISDN',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入IMSI' },
    fieldName: 'imsi',
    label: 'IMSI',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: CODE_STATUS_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'codeStatus',
    label: '码号状态',
  },
];

export const snapshotColumns: VxeGridProps['columns'] = [
  { title: '快照号', field: 'changeNo', minWidth: 90 },
  {
    title: '导入批次',
    field: 'productionBatch',
    minWidth: 150,
    formatter: ({ cellValue }) => cellValue || '--',
  },
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
    title: '来源',
    field: 'resourceSource',
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
    title: '所属租户',
    field: 'tenantNameSnap',
    minWidth: 140,
    formatter: ({ cellValue }) => formatChangeTenantName(cellValue),
  },
];

export const detailQuerySchema: FormSchemaGetter = () => [
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
    fieldName: 'changeTenantId',
    label: '变动租户',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入快照号' },
    fieldName: 'snapshotId',
    label: '快照号',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: CHANGE_TYPE_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'changeType',
    label: '变动类型',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入导入批次' },
    fieldName: 'productionBatch',
    label: '导入批次',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入ACcode' },
    fieldName: 'accode',
    label: 'ACcode',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入ICCID' },
    fieldName: 'iccid',
    label: 'ICCID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入MSISDN' },
    fieldName: 'msisdn',
    label: 'MSISDN',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入IMSI' },
    fieldName: 'imsi',
    label: 'IMSI',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getOperatorOptions,
      placeholder: '全部',
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'operatorId',
    label: '运营商',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入来源' },
    fieldName: 'resourceSource',
    label: '来源',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: CODE_STATUS_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'codeStatus',
    label: '码号状态',
  },
];

export const detailColumns: VxeGridProps['columns'] = [
  { title: '变动编号', field: 'changeNo', minWidth: 160 },
  {
    title: '变动租户',
    field: 'changeTenantName',
    minWidth: 140,
    formatter: ({ cellValue }) => formatChangeTenantName(cellValue),
  },
  { title: '快照号', field: 'id', minWidth: 90 },
  {
    title: '变动类型',
    field: 'changeType',
    minWidth: 100,
    slots: { default: 'changeType' },
  },
  {
    title: '导入批次',
    field: 'productionBatch',
    minWidth: 150,
    formatter: ({ cellValue }) => cellValue || '--',
  },
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
    title: '来源',
    field: 'resourceSource',
    minWidth: 120,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '码号状态',
    field: 'codeStatus',
    minWidth: 100,
    slots: { default: 'codeStatus' },
  },
];

export const logFieldMappingTime = [
  [
    'operateTime',
    ['beginOperateTime', 'endOperateTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
] as [string, [string, string], [string, string]][];
