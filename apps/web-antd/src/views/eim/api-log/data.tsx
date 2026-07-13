import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

const METHOD_COLOR: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
};

export function getMethodColor(m?: string) {
  if (!m) return 'default';
  return METHOD_COLOR[m.toUpperCase()] ?? 'default';
}

export const METHOD_OPTIONS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
];

export const SUCCESS_OPTIONS = [
  { label: '成功', value: true },
  { label: '失败', value: false },
];

export function truncateText(text?: string, max = 50) {
  if (!text) return '--';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export const fieldMappingTime: [
  string,
  [string, string],
  [string, string],
][] = [
  [
    'createTime',
    ['beginCreateTime', 'endCreateTime'],
    ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
  ],
];

export const platformQuerySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'traceId', label: 'TraceId' },
  { component: 'Input', fieldName: 'tenantId', label: '租户ID' },
  { component: 'Input', fieldName: 'apiName', label: '接口名称' },
  { component: 'Input', fieldName: 'requestUri', label: '接口路径' },
  {
    component: 'Select',
    fieldName: 'requestMethod',
    label: '请求方式',
    componentProps: {
      allowClear: true,
      options: METHOD_OPTIONS,
      placeholder: '全部',
    },
  },
  { component: 'RangePicker', fieldName: 'createTime', label: '请求时间' },
  { component: 'Input', fieldName: 'statusCode', label: '响应状态码' },
  {
    component: 'Select',
    fieldName: 'success',
    label: '请求状态',
    componentProps: {
      allowClear: true,
      options: SUCCESS_OPTIONS,
      placeholder: '全部',
    },
  },
  { component: 'Input', fieldName: 'requestParams', label: '请求参数' },
  { component: 'Input', fieldName: 'errorMsg', label: '异常信息' },
];

export const tenantQuerySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'traceId', label: 'TraceId' },
  { component: 'Input', fieldName: 'apiName', label: '接口名称' },
  { component: 'Input', fieldName: 'requestUri', label: '接口路径' },
  {
    component: 'Select',
    fieldName: 'requestMethod',
    label: '请求方式',
    componentProps: {
      allowClear: true,
      options: METHOD_OPTIONS,
      placeholder: '全部',
    },
  },
  { component: 'RangePicker', fieldName: 'createTime', label: '请求时间' },
  { component: 'Input', fieldName: 'statusCode', label: '响应状态码' },
  {
    component: 'Select',
    fieldName: 'success',
    label: '请求状态',
    componentProps: {
      allowClear: true,
      options: SUCCESS_OPTIONS,
      placeholder: '全部',
    },
  },
  { component: 'Input', fieldName: 'deviceEid', label: '调用设备EID' },
  { component: 'Input', fieldName: 'requestParams', label: '请求参数' },
  { component: 'Input', fieldName: 'errorMsg', label: '异常信息' },
];

function overflowCol(
  title: string,
  field: string,
  minWidth = 140,
): NonNullable<VxeGridProps['columns']>[number] {
  return {
    title,
    field,
    minWidth,
    showOverflow: 'tooltip',
    formatter: ({ cellValue }) => truncateText(cellValue, 50),
  };
}

export const platformColumns: VxeGridProps['columns'] = [
  { title: '日志ID', field: 'id', width: 90, fixed: 'left' },
  { title: 'TraceId', field: 'traceId', minWidth: 160, showOverflow: true },
  { title: '租户名称', field: 'tenantName', minWidth: 140 },
  { title: '接口名称', field: 'apiName', minWidth: 140, showOverflow: true },
  { title: '接口路径', field: 'requestUri', minWidth: 180, showOverflow: true },
  {
    title: '请求方式',
    field: 'requestMethod',
    width: 100,
    slots: { default: 'method' },
  },
  { title: '请求IP', field: 'requestIp', width: 130 },
  { title: '请求时间', field: 'createTime', width: 170 },
  { title: '接口耗时', field: 'costTime', width: 100, align: 'right' },
  {
    title: '请求状态',
    field: 'success',
    width: 90,
    slots: { default: 'success' },
  },
  overflowCol('请求参数', 'requestParams', 160),
  overflowCol('响应信息', 'responseBody', 160),
  overflowCol('异常信息', 'errorMsg', 140),
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 90,
  },
];

export const tenantColumns: VxeGridProps['columns'] = [
  { title: '日志ID', field: 'id', width: 90, fixed: 'left' },
  { title: 'TraceId', field: 'traceId', minWidth: 160, showOverflow: true },
  { title: '接口名称', field: 'apiName', minWidth: 140, showOverflow: true },
  { title: '接口路径', field: 'requestUri', minWidth: 180, showOverflow: true },
  {
    title: '请求方式',
    field: 'requestMethod',
    width: 100,
    slots: { default: 'method' },
  },
  { title: '请求IP', field: 'requestIp', width: 130 },
  { title: '请求时间', field: 'createTime', width: 170 },
  { title: '接口耗时', field: 'costTime', width: 100, align: 'right' },
  {
    title: '请求状态',
    field: 'success',
    width: 90,
    slots: { default: 'success' },
  },
  overflowCol('请求参数', 'requestParams', 160),
  overflowCol('响应信息', 'responseBody', 160),
  overflowCol('异常信息', 'errorMsg', 140),
  {
    title: '调用设备EID',
    field: 'deviceEid',
    minWidth: 160,
    showOverflow: true,
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
