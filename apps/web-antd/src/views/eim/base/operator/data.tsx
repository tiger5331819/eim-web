import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import { z } from '#/adapter/form';
import { getDictOptions } from '#/utils/dict';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入运营商名称',
    },
    fieldName: 'operatorName',
    label: '运营商名称',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
      placeholder: '全部',
    },
    fieldName: 'status',
    label: '运营商状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    title: '运营商ID',
    field: 'id',
    width: 100,
  },
  {
    title: '运营商名称',
    field: 'operatorName',
    minWidth: 160,
  },
  {
    title: '运营商状态',
    field: 'status',
    width: 110,
    slots: { default: 'status' },
  },
  {
    title: '码号数',
    field: 'profileCount',
    width: 90,
    formatter: ({ cellValue }) => cellValue ?? 0,
  },
  {
    title: 'APN数',
    field: 'apnCount',
    width: 90,
    formatter: ({ cellValue }) => cellValue ?? 0,
  },
  {
    title: '创建人',
    field: 'createByName',
    width: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '创建时间',
    field: 'createTime',
    width: 170,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 140,
  },
];

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: 'id',
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 50,
      placeholder: '请输入运营商名称，最多50字',
    },
    fieldName: 'operatorName',
    label: '运营商名称',
    rules: z
      .string()
      .min(1, { message: '请输入运营商名称' })
      .max(50, { message: '运营商名称最长50字符' }),
  },
  {
    component: 'Switch',
    componentProps: {
      checkedChildren: '启用',
      class: 'w-auto',
      unCheckedChildren: '禁用',
    },
    defaultValue: true,
    fieldName: 'recycleEnabled',
    formItemClass: 'items-center',
    help: '启用后，该运营商下码号被删除后可回收至总池',
    label: '号码回收开关',
    rules: 'required',
  },
  {
    component: 'Textarea',
    componentProps: {
      maxlength: 200,
      showCount: true,
      rows: 3,
      placeholder: '请输入备注信息',
    },
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
