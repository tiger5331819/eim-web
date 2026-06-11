import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'eid', label: 'EID' },
  { component: 'Input', fieldName: 'iccid', label: '预制种子号' },
  { component: 'Input', fieldName: 'imei', label: 'IMEI' },
  { component: 'Input', fieldName: 'eimFqdn', label: 'EIMId' },
  {
    component: 'Select',
    componentProps: { options: getDictOptions('sys_device_status') },
    fieldName: 'online',
    label: '在线状态',
  },
  { component: 'Input', fieldName: 'name', label: '设备名称' },
  { component: 'Input', fieldName: 'projectName', label: '所属项目' },
  { component: 'Input', fieldName: 'tenantName', label: '所属租户' },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'EID', field: 'eid', minWidth: 180 },
  { title: '预制种子号', field: 'iccid', width: 180 },
  {
    title: '当前码号',
    field: 'currentIccid',
    width: 180,
    formatter: ({ row }) => row.currentIccid || row.iccid || '--',
  },
  { title: 'IMEI', field: 'imei', width: 150 },
  {
    title: '在线状态',
    field: 'online',
    width: 100,
    slots: {
      default: ({ row }) => renderDict(row.online, 'sys_device_status'),
    },
  },
  { title: '设备名称', field: 'name', width: 140 },
  { title: '所属租户', field: 'companyName', width: 160 },
  { title: '所属项目', field: 'projectName', width: 140 },
  { title: '创建时间', field: 'creationTime', width: 170 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];
