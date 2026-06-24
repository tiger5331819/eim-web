import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { EnableStatus } from '@vben/constants';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'operatorName',
    label: '运营商名称',
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: EnableStatus.Enable },
        { label: '禁用', value: EnableStatus.Disable },
      ],
    },
    fieldName: 'status',
    label: '状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '运营商名称',
    field: 'operatorName',
    minWidth: 160,
  },
  {
    title: '运营商编码',
    field: 'operatorCode',
    width: 140,
    align: 'center',
  },
  {
    title: '关联码号数',
    field: 'profileCount',
    width: 120,
    align: 'center',
  },
  {
    title: '关联APN数',
    field: 'apnCount',
    width: 120,
    align: 'center',
  },
  {
    title: '备注',
    field: 'remark',
    minWidth: 160,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '创建时间',
    field: 'createTime',
    width: 170,
  },
  {
    title: '状态',
    field: 'status',
    width: 100,
    slots: { default: 'status' },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'id',
    label: 'id',
  },
  {
    component: 'Input',
    fieldName: 'operatorCode',
    label: '运营商编码',
    rules: 'required',
    componentProps: {
      placeholder: '如 46001',
    },
  },
  {
    component: 'Input',
    fieldName: 'operatorName',
    label: '运营商名称',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '启用', value: EnableStatus.Enable },
        { label: '禁用', value: EnableStatus.Disable },
      ],
    },
    defaultValue: EnableStatus.Enable,
    fieldName: 'status',
    label: '状态',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
