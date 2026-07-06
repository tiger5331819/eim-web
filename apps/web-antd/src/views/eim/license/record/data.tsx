import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { CHANGE_TYPE_OPTIONS } from '#/utils/licenseStatus';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'tenantName',
    label: '租户名称',
  },
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

export const columns: VxeGridProps['columns'] = [
  { title: '流水号', field: 'id', minWidth: 150 },
  {
    title: '租户名称',
    field: 'tenantName',
    minWidth: 180,
    formatter: ({ cellValue }) => cellValue || '--',
  },
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
