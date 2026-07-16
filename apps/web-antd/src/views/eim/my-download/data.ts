import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import {
  DOWNLOAD_TASK_PROGRESS_OPTIONS,
  DOWNLOAD_TASK_STATE_OPTIONS,
  formatDownloadField,
} from '#/utils/downloadTaskStatus';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入下载ID' },
    fieldName: 'id',
    label: '下载ID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入ICCID' },
    fieldName: 'iccid',
    label: 'ICCID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入EID' },
    fieldName: 'eid',
    label: 'EID',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: DOWNLOAD_TASK_PROGRESS_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'downloadRate',
    label: '进度',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: DOWNLOAD_TASK_STATE_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'state',
    label: '状态',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入操作人' },
    fieldName: 'operatorUser',
    label: '操作人',
  },
  {
    component: 'RangePicker',
    fieldName: 'operateTime',
    label: '操作时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: '下载ID', field: 'id', minWidth: 100 },
  { title: 'ICCID', field: 'iccid', minWidth: 190 },
  { title: 'EID', field: 'eid', minWidth: 200 },
  {
    title: '进度',
    field: 'downloadRate',
    minWidth: 90,
    slots: { default: 'progress' },
  },
  {
    title: '状态',
    field: 'state',
    minWidth: 100,
    slots: { default: 'state' },
  },
  {
    title: '操作人',
    field: 'operatorUser',
    minWidth: 120,
    formatter: ({ cellValue }) => formatDownloadField(cellValue),
  },
  {
    title: '操作时间',
    field: 'operatorTime',
    minWidth: 170,
    formatter: ({ row, cellValue }) =>
      formatDownloadField(cellValue ?? row.creationTime),
  },
];

export const fieldMappingTime = [
  [
    'operateTime',
    ['startCreationTime', 'endCreationTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
] as [string, [string, string], [string, string]][];
