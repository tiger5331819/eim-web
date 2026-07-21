import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MyLicenseVo } from '#/api/system/my-license/model';

import {
  CHANGE_TYPE_OPTIONS,
  DOWNLOAD_RESULT_OPTIONS,
  getAvailableQuotaClass,
} from '#/utils/myLicenseStatus';

const DOWNLOAD_RESULT_API_MAP: Record<string, string> = {
  成功: 'SUCCESS',
  失败: 'FAIL',
  下载中: 'DOWNLOAD',
};

const CHANGE_TYPE_API_MAP: Record<string, string> = {
  充值: 'ADD',
  扣减: 'ADJUST',
  回退: 'RELEASE',
  冻结: 'FREEZE',
  消耗: 'CONFIRM',
};

export function mapFreezeQuery(formValues: Record<string, any> = {}) {
  const { downloadResult, ...rest } = formValues;
  return {
    ...rest,
    ...(downloadResult
      ? {
          downloadResult:
            DOWNLOAD_RESULT_API_MAP[downloadResult] ?? downloadResult,
        }
      : {}),
  };
}

export function mapRecordQuery(formValues: Record<string, any> = {}) {
  const { changeType, ...rest } = formValues;
  return {
    ...rest,
    ...(changeType
      ? { changeType: CHANGE_TYPE_API_MAP[changeType] ?? changeType }
      : {}),
  };
}

export const freezeQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'id',
    label: '流水号',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: DOWNLOAD_RESULT_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'downloadResult',
    label: '下载结果',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'taskId',
    label: '下载任务ID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'operatorName',
    label: '操作人',
  },
  {
    component: 'RangePicker',
    fieldName: 'operateTime',
    label: '操作时间',
  },
];

export const freezeColumns: VxeGridProps['columns'] = [
  { title: '流水号', field: 'id', minWidth: 150 },
  {
    title: '消耗数量',
    field: 'consumeQuota',
    minWidth: 100,
    formatter: ({ row }) => row.consumeQuota ?? row.freezeQuota ?? '--',
  },
  {
    title: '下载结果',
    field: 'downloadResult',
    minWidth: 100,
    slots: { default: 'downloadResult' },
  },
  {
    title: '下载任务ID',
    field: 'taskId',
    minWidth: 160,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '操作人',
    field: 'operatorName',
    minWidth: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  { title: '操作时间', field: 'operateTime', minWidth: 170 },
];

export const recordQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'recordNo',
    label: '流水号',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: CHANGE_TYPE_OPTIONS,
      placeholder: '请选择',
    },
    fieldName: 'changeType',
    label: '变动类型',
  },
  {
    component: 'RangePicker',
    fieldName: 'changeTime',
    label: '变动时间',
  },
];

export const recordColumns: VxeGridProps['columns'] = [
  { title: '流水号', field: 'id', minWidth: 150 },
  {
    title: '变动数量',
    field: 'changeQuota',
    minWidth: 110,
    slots: { default: 'changeQuota' },
  },
  { title: '变动后额度', field: 'afterAvailable', minWidth: 110 },
  {
    title: '变动类型',
    field: 'changeType',
    minWidth: 100,
    slots: { default: 'changeType' },
  },
  { title: '变动时间', field: 'createTime', minWidth: 170 },
];

export function buildOverviewItems(license: MyLicenseVo | null) {
  const dash = (value?: number | string) =>
    value === undefined || value === null ? '-' : value;

  const available = license?.availableQuota;
  const availableClass = getAvailableQuotaClass(available);

  return [
    {
      title: '总额度',
      value: dash(license?.totalQuota),
      icon: 'lucide:layers',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: '可用剩余额度',
      value: dash(available),
      valueClass: availableClass,
      icon: 'lucide:wallet',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: '今日消耗',
      value: dash(license?.todayConsumed),
      icon: 'lucide:calendar-clock',
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      title: '本月消耗',
      value: dash(license?.monthConsumed),
      icon: 'lucide:chart-column',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: '最近充值时间',
      value: license?.lastRechargeTime || '-',
      small: true,
      icon: 'lucide:clock',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];
}
