import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getLedgerTenantOptions } from '#/api/system/profile-ledger';
import {
  formatInventoryField,
  INVENTORY_CHANGE_TYPE_OPTIONS,
} from '#/utils/inventoryChangeStatus';

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
      options: INVENTORY_CHANGE_TYPE_OPTIONS,
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
    fieldName: 'tenantId',
    label: '租户',
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
  { title: '变动编号', field: 'changeNo', minWidth: 180 },
  {
    title: '变动类型',
    field: 'changeType',
    minWidth: 100,
    slots: { default: 'changeType' },
  },
  {
    title: '变动数量',
    field: 'changeCount',
    minWidth: 100,
    slots: { default: 'changeCount' },
  },
  {
    title: '目标/源租户',
    field: 'changeTenantName',
    minWidth: 160,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '备注',
    field: 'remark',
    minWidth: 140,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '操作人',
    field: 'operatorName',
    minWidth: 120,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '操作时间',
    field: 'operateTime',
    minWidth: 170,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 90,
  },
];

export const snapshotQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入快照号' },
    fieldName: 'snapshotNo',
    label: '快照号',
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
    component: 'Input',
    componentProps: { placeholder: '请输入制卡商' },
    fieldName: 'cardVendor',
    label: '制卡商',
  },
];

export const snapshotColumns: VxeGridProps['columns'] = [
  {
    title: '快照号',
    field: 'snapshotNo',
    minWidth: 200,
    formatter: ({ row, cellValue }) =>
      formatInventoryField(cellValue ?? row.id?.toString()),
  },
  { title: 'EID', field: 'eid', minWidth: 200 },
  {
    title: '预制种子号',
    field: 'seedNo',
    minWidth: 140,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '制卡商',
    field: 'cardVendor',
    minWidth: 140,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
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
    component: 'Input',
    componentProps: { placeholder: '请输入EID' },
    fieldName: 'eid',
    label: 'EID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入制卡商' },
    fieldName: 'cardVendor',
    label: '制卡商',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: INVENTORY_CHANGE_TYPE_OPTIONS,
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
    fieldName: 'tenantId',
    label: '租户',
  },
  {
    component: 'RangePicker',
    fieldName: 'operateTime',
    label: '操作时间',
  },
];

export const detailColumns: VxeGridProps['columns'] = [
  { title: '变动编号', field: 'changeNo', minWidth: 180 },
  {
    title: '快照号',
    field: 'snapshotNo',
    minWidth: 200,
    formatter: ({ row, cellValue }) =>
      formatInventoryField(cellValue ?? row.id?.toString()),
  },
  {
    title: '变动类型',
    field: 'changeType',
    minWidth: 100,
    slots: { default: 'changeType' },
  },
  { title: 'EID', field: 'eid', minWidth: 200 },
  {
    title: '预制种子号',
    field: 'seedNo',
    minWidth: 140,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '制卡商',
    field: 'cardVendor',
    minWidth: 140,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '租户名称',
    field: 'changeTenantName',
    minWidth: 160,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
  {
    title: '操作时间',
    field: 'updateTime',
    minWidth: 170,
    formatter: ({ cellValue }) => formatInventoryField(cellValue),
  },
];

export const logFieldMappingTime = [
  [
    'operateTime',
    ['beginOperateTime', 'endOperateTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
] as [string, [string, string], [string, string]][];

export const detailFieldMappingTime = [...logFieldMappingTime];
