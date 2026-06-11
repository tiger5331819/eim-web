import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ALLOCATION_ACTION_OPTIONS } from '#/utils/poolStatus';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'iccid', label: 'ICCID' },
  { component: 'Input', fieldName: 'profileId', label: 'Profile ID' },
  { component: 'Input', fieldName: 'toTenantId', label: '目标租户ID' },
  {
    component: 'Select',
    fieldName: 'actionType',
    label: '动作类型',
    componentProps: {
      allowClear: true,
      options: ALLOCATION_ACTION_OPTIONS,
      placeholder: '请选择',
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 60 },
  { title: 'ICCID', field: 'iccid', minWidth: 180 },
  { title: 'Profile ID', field: 'profileId', width: 140 },
  {
    title: '动作',
    field: 'actionType',
    width: 100,
    slots: { default: 'actionType' },
  },
  { title: '源租户', field: 'fromTenantId', width: 160 },
  { title: '目标租户', field: 'toTenantId', width: 160 },
  {
    title: '状态变更',
    field: 'beforeStatus',
    width: 160,
    slots: { default: 'statusChange' },
  },
  { title: '操作人', field: 'operatorName', width: 110 },
  { title: '备注', field: 'remark', minWidth: 160, showOverflow: true },
  { title: '时间', field: 'createTime', width: 170 },
];
