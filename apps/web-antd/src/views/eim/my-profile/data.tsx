import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MyProfileStatsVo } from '#/api/system/my-profile/model';

import { getOperatorOptions } from '#/api/system/operator';
import { MY_PROFILE_STATUS_OPTIONS } from '#/utils/myProfileStatus';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'accode',
    label: 'ACcode',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'iccid',
    label: 'ICCID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'msisdn',
    label: 'MSISDN',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'imsi',
    label: 'IMSI',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getOperatorOptions,
      placeholder: '请选择',
    },
    fieldName: 'operatorId',
    label: '运营商',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: MY_PROFILE_STATUS_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'status',
    label: '码号状态',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'eid',
    label: '绑定EID',
  },
];

export const columns: VxeGridProps['columns'] = [
  { title: 'ACcode', field: 'accode', minWidth: 130 },
  { title: 'ICCID', field: 'iccid', minWidth: 190 },
  { title: 'MSISDN', field: 'msisdn', minWidth: 140 },
  { title: 'IMSI', field: 'imsi', minWidth: 150 },
  {
    title: '运营商',
    field: 'operatorName',
    minWidth: 120,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '码号状态',
    field: 'status',
    width: 100,
    slots: { default: 'status' },
  },
  {
    title: '绑定EID',
    field: 'eid',
    minWidth: 180,
    slots: { default: 'eid' },
  },
  {
    title: '下载时间',
    field: 'downloadedTime',
    width: 170,
    slots: { default: 'downloadedTime' },
  },
  { title: '创建时间', field: 'createTime', width: 170 },
];

export const deletedQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'accode',
    label: 'ACcode',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'iccid',
    label: 'ICCID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'msisdn',
    label: 'MSISDN',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'imsi',
    label: 'IMSI',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getOperatorOptions,
      placeholder: '请选择',
    },
    fieldName: 'operatorId',
    label: '运营商',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'eid',
    label: '绑定EID',
  },
];

export const deletedColumns: VxeGridProps['columns'] = [
  { title: 'ACcode', field: 'accode', minWidth: 130 },
  { title: 'ICCID', field: 'iccid', minWidth: 190 },
  { title: 'MSISDN', field: 'msisdn', minWidth: 140 },
  { title: 'IMSI', field: 'imsi', minWidth: 150 },
  {
    title: '运营商',
    field: 'operatorName',
    minWidth: 120,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '绑定EID',
    field: 'eid',
    minWidth: 180,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '操作人',
    field: 'deleteOperatorName',
    width: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '操作时间',
    field: 'deleteTime',
    width: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
];

export function buildStatsItems(stats: MyProfileStatsVo | null) {
  const dash = (value?: number) =>
    value === undefined || value === null ? '-' : value;

  return [
    {
      title: '码号总数',
      value: dash(stats?.total),
      icon: 'lucide:layers',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: '空闲',
      value: dash(stats?.idle),
      icon: 'lucide:circle-dashed',
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      title: '已下载',
      value: dash(stats?.downloaded),
      icon: 'lucide:download',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: '锁定',
      value: dash(stats?.locked),
      icon: 'lucide:lock',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];
}
