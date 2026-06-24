import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getOperatorOptions } from '#/api/system/operator';

/** APN 来源映射 — 与后端 sourceType 字段值对齐 */
const SOURCE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  MANUAL:   { color: 'blue',   text: '手动录入' },
  DP_PLUS:  { color: 'purple', text: 'DP+ 同步' },
};

export function getSourceTypeMeta(type?: string) {
  if (!type) return { color: 'default', text: '--' };
  return SOURCE_TYPE_MAP[type] ?? { color: 'default', text: type };
}

export const SOURCE_TYPE_OPTIONS = Object.entries(SOURCE_TYPE_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);

/** 是否默认 APN 选项 */
export const IS_DEFAULT_OPTIONS = [
  { value: '1', label: '是' },
  { value: '0', label: '否' },
];

/** 状态选项 */
export const STATUS_OPTIONS = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
];

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
  },
  {
    component: 'Input',
    fieldName: 'apn',
    label: 'APN',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      api: getOperatorOptions,
      placeholder: '请选择运营商',
      allowClear: true,
    },
    fieldName: 'operatorId',
    label: '运营商',
  },
  {
    component: 'Select',
    fieldName: 'isDefault',
    label: '是否默认',
    componentProps: {
      allowClear: true,
      options: IS_DEFAULT_OPTIONS,
      placeholder: '请选择',
    },
  },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    componentProps: {
      allowClear: true,
      options: STATUS_OPTIONS,
      placeholder: '请选择',
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'APN ID', field: 'id', width: 100 },
  { title: '名称', field: 'name', minWidth: 120 },
  { title: 'APN', field: 'apn', minWidth: 120 },
  { title: '适用地区', field: 'local', width: 120 },
  {
    title: '运营商',
    field: 'operatorName',
    width: 160,
    formatter: ({ row }) => {
      const code = row.operatorCode ? `（${row.operatorCode}）` : '';
      return row.operatorName ? `${row.operatorName}${code}` : '--';
    },
  },
  {
    title: '是否默认',
    field: 'isDefault',
    width: 100,
    slots: { default: 'isDefault' },
  },
  {
    title: '状态',
    field: 'status',
    width: 100,
    slots: { default: 'status' },
  },
  {
    title: '来源',
    field: 'sourceType',
    width: 110,
    slots: { default: 'sourceType' },
  },
  { title: '创建时间', field: 'creationTime', width: 170 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 200,
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show(values) {
        return !values?.id;
      },
      triggerFields: ['id'],
    },
    fieldName: 'id',
    label: 'APN ID',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'apn',
    label: 'APN',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'local',
    label: '适用地区',
    rules: 'required',
  },
  {
    component: 'ApiSelect',
    fieldName: 'operatorId',
    label: '运营商',
    rules: 'required',
    componentProps: {
      api: getOperatorOptions,
      placeholder: '请选择运营商',
    },
  },
  {
    component: 'Switch',
    fieldName: 'isDefault',
    label: '设为默认',
    defaultValue: '0',
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
      checkedValue: '1',
      unCheckedValue: '0',
    },
    help: '同一运营商只能有一个默认 APN，设置时会自动替换原默认',
  },
  {
    component: 'Switch',
    fieldName: 'status',
    label: '状态',
    defaultValue: '0',
    componentProps: {
      checkedChildren: '正常',
      unCheckedChildren: '停用',
      checkedValue: '0',
      unCheckedValue: '1',
    },
  },
];
