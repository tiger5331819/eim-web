import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

const SOURCE_MAP: Record<string, { color: string; text: string }> = {
  MANUAL: { color: 'blue', text: '手动' },
  BATCH: { color: 'purple', text: '批量' },
  OPENAPI: { color: 'cyan', text: 'OpenAPI' },
};

export function getTaskSourceMeta(s?: string) {
  if (!s) return { color: 'default', text: '--' };
  return SOURCE_MAP[s] ?? { color: 'default', text: s };
}

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Select',
    componentProps: { options: getDictOptions('sys_task_status') },
    fieldName: 'state',
    label: '任务状态',
  },
  { component: 'Input', fieldName: 'operatorUser', label: '操作人' },
  { component: 'RangePicker', fieldName: 'creationTime', label: '操作时间' },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'ICCID', field: 'iccid', minWidth: 180 },
  { title: 'EID', field: 'eid', minWidth: 240 },
  {
    title: '操作类型',
    field: 'source',
    width: 100,
    slots: { default: 'source' },
  },
  { title: '进度', field: 'downloadRate', width: 80 },
  { title: '创建时间', field: 'creationTime', width: 170 },
  {
    title: '状态',
    field: 'state',
    width: 100,
    slots: {
      default: ({ row }) => renderDict(row.state, 'sys_task_status'),
    },
  },
  { title: '操作时间', field: 'operatorTime', width: 170 },
  { title: '操作人', field: 'operatorUser', width: 110 },
];
