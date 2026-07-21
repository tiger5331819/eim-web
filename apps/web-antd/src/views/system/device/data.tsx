import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getTenantPoolOperatorOptions } from '#/api/system/tenant-pool';
import { getOperatorOptions } from '#/api/system/operator';
import { getLedgerEnabledTenantOptions } from '#/api/system/profile-ledger';
import {
  formatEmpty,
  getActivationDeviceSn,
  getCreateTime,
  getOperatorName,
  getTenantName,
  ONLINE_STATUS_OPTIONS,
  PROFILE_OPERATION_OPTIONS,
} from '#/utils/deviceLedgerStatus';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'eid',
    label: 'EID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'seedNumber',
    label: '预制种子号',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'deviceSn',
    label: '设备SN',
  },
  {
    component: 'RangePicker',
    fieldName: 'activationTime',
    label: '激活时间',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: ONLINE_STATUS_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'online',
    label: '在线状态',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getLedgerEnabledTenantOptions,
      placeholder: '全部',
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'tenantId',
    label: '所属租户',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: getOperatorOptions,
      placeholder: '全部',
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'operatorId',
    label: '运营商',
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
    fieldName: 'apn',
    label: 'APN',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'createByName',
    label: '创建人',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '创建时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    title: 'EID',
    field: 'eid',
    minWidth: 190,
    formatter: ({ cellValue }) => formatEmpty(cellValue),
  },
  {
    title: '预制种子号',
    field: 'seedNumber',
    minWidth: 150,
    formatter: ({ row }) => formatEmpty(row.seedNumber || row.iccid),
  },
  {
    title: '设备SN',
    field: 'deviceSn',
    minWidth: 140,
    formatter: ({ row }) => getActivationDeviceSn(row),
  },
  {
    title: '激活时间',
    field: 'activationTime',
    minWidth: 170,
    formatter: ({ cellValue }) => formatEmpty(cellValue),
  },
  {
    title: '在线状态',
    field: 'online',
    minWidth: 100,
    slots: { default: 'onlineStatus' },
  },
  {
    title: '所属租户',
    field: 'tenantName',
    minWidth: 160,
    formatter: ({ row }) => getTenantName(row),
  },
  {
    title: '运营商',
    field: 'operatorName',
    minWidth: 120,
    formatter: ({ row }) => getOperatorName(row),
  },
  {
    title: 'ICCID',
    field: 'iccid',
    minWidth: 190,
    formatter: ({ cellValue }) => formatEmpty(cellValue),
  },
  {
    title: 'APN',
    field: 'apnName',
    minWidth: 120,
  },
  {
    title: '创建人',
    field: 'createByName',
    minWidth: 110,
    formatter: ({ cellValue }) => formatEmpty(cellValue),
  },
  {
    title: '创建时间',
    field: 'createTime',
    minWidth: 170,
    formatter: ({ row }) => getCreateTime(row),
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 90,
  },
];

export function createProfileInfoFilterSchema(
  getTenantId?: () => string | undefined,
) {
  return [
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      class: 'w-[180px]',
      placeholder: '全部',
      showSearch: true,
      optionFilterProp: 'label',
      immediate: false,
      alwaysLoad: true,
      api: async () => {
        const tenantId = getTenantId?.();
        return getTenantPoolOperatorOptions({
          tenantId: tenantId != null ? String(tenantId) : undefined,
        });
      },
    },
    fieldName: 'operatorId',
    formItemClass: 'items-center',
    label: '运营商',
  },
  {
    component: 'Input',
    componentProps: { class: 'w-[180px]', placeholder: '请输入' },
    fieldName: 'iccid',
    formItemClass: 'items-center',
    label: 'ICCID',
  },
  {
    component: 'Input',
    componentProps: { class: 'w-[180px]', placeholder: '请输入' },
    fieldName: 'apn',
    formItemClass: 'items-center',
    label: 'APN',
  },
  ];
}

export const profileRecordQuerySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'id',
    label: '操作ID',
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'iccid',
    label: 'ICCID',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: PROFILE_OPERATION_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'operType',
    label: '操作类型',
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

export const profileRecordColumns: VxeGridProps['columns'] = [
  {
    title: '操作ID',
    field: 'id',
    minWidth: 100,
    formatter: ({ cellValue }) => formatEmpty(cellValue),
  },
  {
    title: 'ICCID',
    field: 'iccid',
    minWidth: 190,
    formatter: ({ cellValue }) => formatEmpty(cellValue),
  },
  {
    title: '操作类型',
    field: 'operType',
    minWidth: 110,
    slots: { default: 'operType' },
  },
  {
    title: '操作人',
    field: 'operatorName',
    minWidth: 110,
    formatter: ({ cellValue }) => formatEmpty(cellValue),
  },
  {
    title: '操作时间',
    field: 'operateTime',
    minWidth: 170,
    formatter: ({ row }) =>
      formatEmpty(row.operateTime || row.creationTime),
  },
];

export const ledgerFieldMappingTime = [
  [
    'activationTime',
    ['beginActivationTime', 'endActivationTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
  [
    'createTime',
    ['beginCreateTime', 'endCreateTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
] as [string, [string, string], [string, string]][];

export const profileRecordFieldMappingTime = [
  [
    'operateTime',
    ['beginOperateTime', 'endOperateTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
] as [string, [string, string], [string, string]][];
