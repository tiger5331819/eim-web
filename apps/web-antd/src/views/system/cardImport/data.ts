import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getCardProviderDict } from './hooks/useGetDict';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'eid',
    label: 'EID',
  },
  {
    component: 'Input',
    fieldName: 'iccid',
    label: '预制种子号',
  },
  {
    component: 'Input',
    fieldName: 'eimFqdn',
    label: '预制EIM',
  },
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
  {
    component: 'Input',
    fieldName: 'projectName',
    label: '所属项目',
  },
  {
    component: 'Input',
    fieldName: 'tenantName',
    label: '所属租户',
  },
  {
    component: 'Input',
    fieldName: 'operator',
    label: '操作人',
  },
  {
    component: 'RangePicker',
    fieldName: 'creationTime',
    label: '入库时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: 'EID', field: 'eid' },
  { title: '预制种子号ICCID', field: 'iccid' },
  { title: '预制EIM', field: 'eimFqdn' },
  { title: '制卡商', field: 'cardProviderName' },
  { title: '运营商', field: 'providerName' },
  { title: '生产批次', field: 'productionBatch' },
  { title: '所属项目', field: 'projectName' },
  { title: '所属租户', field: 'companyName' },
  { title: '操作人', field: 'operator' },
  { title: '入库时间', field: 'creationTime' },
];
