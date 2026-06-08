import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions('sys_task_status'),
    },
    fieldName: 'state',
    label: '任务类型',
  },
  {
    component: 'Input',
    fieldName: 'operatorUser',
    label: '操作人',
  },
  {
    component: 'RangePicker',
    fieldName: 'creationTime',
    label: '操作时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'ICCID', field: 'iccid' },
  { title: 'EID', field: 'eid', width: 400 },
  { title: '进度条', field: 'downloadRate' },
  { title: '创建时间', field: 'creationTime' },
  {
    title: '状态',
    field: 'state',
    slots: {
      default: ({ row }) => {
        return renderDict(row.state, 'sys_task_status');
      },
    },
  },
  { title: '操作时间', field: 'operatorTime' },
  { title: '操作人', field: 'operatorUser' },
];
