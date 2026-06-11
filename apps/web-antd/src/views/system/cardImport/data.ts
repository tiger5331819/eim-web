import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getCardProviderDict } from './hooks/useGetDict';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'eid', label: 'EID' },
  { component: 'Input', fieldName: 'iccid', label: '预制种子号' },
  { component: 'Input', fieldName: 'eimFqdn', label: '预制EIM' },
  {
    component: 'ApiSelect',
    componentProps: {
      api: getCardProviderDict,
      labelField: 'label',
      valueField: 'value',
      placeholder: '请选择制卡商',
    },
    fieldName: 'cardProviderName',
    label: '制卡商',
  },
  { component: 'Input', fieldName: 'tenantName', label: '分配租户' },
  { component: 'Input', fieldName: 'operator', label: '入库人' },
  {
    component: 'RangePicker',
    fieldName: 'creationTime',
    label: '入库时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: '导入批次', field: 'productionBatch', width: 130 },
  { title: 'EID', field: 'eid', minWidth: 180 },
  { title: '预制种子号', field: 'iccid', minWidth: 180 },
  { title: '制卡商', field: 'cardProviderName', width: 110 },
  { title: '入库人', field: 'operator', width: 110 },
  { title: '入库时间', field: 'creationTime', width: 170 },
  {
    title: '分配租户',
    field: 'companyName',
    width: 160,
    formatter: ({ cellValue }) => cellValue || '--',
    slots: { default: 'companyName' },
  },
  {
    title: '分配人',
    field: 'allocator',
    width: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '分配时间',
    field: 'allocateTime',
    width: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 120,
  },
];
