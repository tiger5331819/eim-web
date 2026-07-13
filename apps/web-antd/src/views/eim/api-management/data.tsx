import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'tenantName',
    label: '租户名称',
    componentProps: { placeholder: '请输入' },
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: '租户名称', field: 'tenantName', minWidth: 180, fixed: 'left' },
  { title: 'AppKey', field: 'appKey', minWidth: 280, showOverflow: true },
  {
    title: '状态',
    field: 'status',
    width: 120,
    slots: { default: 'status' },
  },
  { title: '创建时间', field: 'createTime', width: 180 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 180,
  },
];
