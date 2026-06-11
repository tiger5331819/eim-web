import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

const METHOD_COLOR: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'purple',
};

export function getMethodColor(m?: string) {
  if (!m) return 'default';
  return METHOD_COLOR[m.toUpperCase()] ?? 'default';
}

export const METHOD_OPTIONS = Object.keys(METHOD_COLOR).map((m) => ({
  label: m,
  value: m,
}));

export const SUCCESS_OPTIONS = [
  { value: true, label: '成功' },
  { value: false, label: '失败' },
];

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'tenantId', label: '租户ID' },
  { component: 'Input', fieldName: 'userName', label: '调用用户' },
  { component: 'Input', fieldName: 'apiName', label: '接口名称' },
  {
    component: 'Select',
    fieldName: 'requestMethod',
    label: 'HTTP方法',
    componentProps: {
      allowClear: true,
      options: METHOD_OPTIONS,
      placeholder: '请选择',
    },
  },
  {
    component: 'Select',
    fieldName: 'success',
    label: '是否成功',
    componentProps: {
      allowClear: true,
      options: SUCCESS_OPTIONS,
      placeholder: '请选择',
    },
  },
  { component: 'RangePicker', fieldName: 'createTime', label: '调用时间' },
];

export const columns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 60 },
  { title: '租户', field: 'tenantId', width: 140 },
  { title: '调用用户', field: 'userName', width: 110 },
  { title: '接口名称', field: 'apiName', minWidth: 200, showOverflow: true },
  { title: '方法', field: 'requestMethod', width: 80, slots: { default: 'method' } },
  { title: 'URI', field: 'requestUri', minWidth: 200, showOverflow: true },
  { title: '请求IP', field: 'requestIp', width: 130 },
  { title: '结果', field: 'success', width: 80, slots: { default: 'success' } },
  { title: '耗时(ms)', field: 'costTime', width: 100 },
  { title: '调用时间', field: 'createTime', width: 170 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 100,
  },
];
