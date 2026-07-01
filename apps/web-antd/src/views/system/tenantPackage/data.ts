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
      placeholder: '请输入套餐名称',
    },
    fieldName: 'packageName',
    label: '套餐名称',
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
    label: '套餐状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    title: '套餐名称',
    field: 'packageName',
    minWidth: 140,
  },
  {
    title: '备注',
    field: 'remark',
    minWidth: 180,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '绑定租户数',
    field: 'tenantCount',
    width: 110,
    formatter: ({ cellValue }) => cellValue ?? 0,
  },
  {
    title: '套餐状态',
    field: 'status',
    width: 100,
    slots: { default: 'status' },
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
    fieldName: 'packageId',
  },
  {
    component: 'Radio',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'menuCheckStrictly',
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 50,
      placeholder: '请输入套餐名称',
    },
    fieldName: 'packageName',
    label: '套餐名称',
    rules: z
      .string()
      .min(1, { message: '请输入套餐名称' })
      .max(50, { message: '套餐名称最长50字符' }),
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
  {
    component: 'menuIds',
    defaultValue: [],
    fieldName: 'menuIds',
    label: '关联菜单',
  },
];
