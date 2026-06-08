import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'dpSource', label: 'DP+来源' },
  { component: 'Input', fieldName: 'iccid', label: 'ICCID' },
  { component: 'Input', fieldName: 'eid', label: 'EID' },
  { component: 'Select', componentProps: { options: getDictOptions('sys_profile_state') }, fieldName: 'state', label: '状态' },
  { component: 'Input', fieldName: 'projectName', label: '所属项目' },
  { component: 'Input', fieldName: 'tenantName', label: '所属租户' },
  { component: 'Select', componentProps: { options: getDictOptions('sys_allocate_status') }, fieldName: 'assigned', label: '分配状态' },
  { component: 'Select', componentProps: { options: getDictOptions('sys_installed_status') }, fieldName: 'installed', label: '下号状态' },
];

export const columns: VxeGridProps['columns'] = [
  { title: '运营商', field: 'carrierName', width: 200 },
  { title: '批次', field: 'productionBatch', width: 200 },
  { title: 'APNID', field: 'apnId', width: 200 },
  { title: 'APN', field: 'apn', width: 200 },
  { title: '地区码', field: 'apnLocal', width: 200 },
  { title: '分配状态', field: 'assignedState', width: 200, slots: { default: ({ row }) => renderDict(row.assignedState, 'sys_allocate_status') } },
  { title: '所属企业', field: 'companyName', width: 200 },
  { title: '所属项目', field: 'projectName', width: 200 },
  { title: '下号状态', field: 'installedState', width: 200, slots: { default: ({ row }) => renderDict(row.installedState, 'sys_installed_status') } },
  { field: 'action', fixed: 'right', slots: { default: 'action' }, title: '操作', resizable: false, width: 'auto' },
];
