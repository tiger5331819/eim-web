import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { POOL_STATUS_OPTIONS } from '#/utils/poolStatus';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'iccid', label: 'ICCID' },
  { component: 'Input', fieldName: 'carrierName', label: '运营商' },
  { component: 'Input', fieldName: 'productionBatch', label: '生产批次' },
  {
    component: 'Select',
    fieldName: 'poolStatus',
    label: '池状态',
    componentProps: {
      allowClear: true,
      options: POOL_STATUS_OPTIONS,
      placeholder: '请选择',
    },
  },
  { component: 'Input', fieldName: 'tenantName', label: '分配租户' },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'ICCID', field: 'iccid', minWidth: 180 },
  { title: '运营商', field: 'carrierName', width: 140 },
  { title: '生产批次', field: 'productionBatch', width: 140 },
  { title: 'DP+来源', field: 'dpSource', width: 120 },
  { title: 'APN', field: 'apn', width: 100 },
  {
    title: '池状态',
    field: 'poolStatus',
    width: 110,
    slots: { default: 'poolStatus' },
  },
  { title: '分配租户', field: 'companyName', width: 160 },
  { title: '归属项目', field: 'projectName', width: 140 },
  { title: '更新时间', field: 'updateTime', width: 170 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 160,
  },
];
