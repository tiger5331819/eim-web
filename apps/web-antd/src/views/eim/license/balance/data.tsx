import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import {
  CHANGE_TYPE_OPTIONS,
  getAvailableQuotaClass,
  TENANT_STATUS_OPTIONS,
  WARN_LEVEL_OPTIONS,
} from '#/utils/licenseStatus';

export const ADJUST_REASON_OPTIONS = [
  '业务充值',
  '活动赠送',
  '额度扣减',
  '系统调整',
  '误操作修正',
].map((text) => ({ value: text, label: text }));

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'tenantName',
    label: '租户名称',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: TENANT_STATUS_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'tenantStatus',
    label: '租户状态',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: WARN_LEVEL_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'warnLevel',
    label: '预警状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    title: '租户名称',
    field: 'tenantName',
    minWidth: 180,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '租户状态',
    field: 'tenantStatus',
    minWidth: 100,
    slots: { default: 'tenantStatus' },
  },
  {
    title: '可用剩余额度',
    field: 'availableQuota',
    minWidth: 120,
    slots: { default: 'availableQuota' },
  },
  {
    title: '累计添加额度',
    field: 'totalQuota',
    minWidth: 120,
    formatter: ({ cellValue }) =>
      cellValue === undefined || cellValue === null ? '--' : cellValue,
  },
  {
    title: '累计消耗额度',
    field: 'totalConsumed',
    minWidth: 120,
    formatter: ({ row, cellValue }) => {
      const value = cellValue ?? row.usedQuota;
      return value === undefined || value === null ? '--' : value;
    },
  },
  {
    title: '预警状态',
    field: 'warnLevel',
    minWidth: 100,
    slots: { default: 'warnLevel' },
  },
  {
    title: '最近变动时间',
    field: 'lastChangeTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 180,
  },
];

export const drawerRecordQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'recordNo',
    label: '流水号',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: CHANGE_TYPE_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'changeType',
    label: '变动类型',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'operatorName',
    label: '操作人',
  },
];

export const drawerRecordColumns: VxeGridProps['columns'] = [
  { title: '流水号', field: 'id', minWidth: 150 },
  { title: '变动前额度', field: 'beforeAvailable', minWidth: 110 },
  {
    title: '变动数量',
    field: 'changeQuota',
    minWidth: 110,
    slots: { default: 'changeQuota' },
  },
  { title: '变动后额度', field: 'afterAvailable', minWidth: 110 },
  {
    title: '变动类型',
    field: 'changeType',
    minWidth: 100,
    slots: { default: 'changeType' },
  },
  {
    title: '操作人',
    field: 'operatorName',
    minWidth: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  { title: '操作时间', field: 'createTime', minWidth: 170 },
];

export { getAvailableQuotaClass };
