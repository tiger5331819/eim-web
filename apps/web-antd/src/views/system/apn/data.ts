import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import { z } from '#/adapter/form';
import {
  getEnabledOperatorOptions,
  getOperatorOptions,
} from '#/api/system/operator';
import { getDictOptions } from '#/utils/dict';

/** 是否默认 APN 选项 */
export const IS_DEFAULT_OPTIONS = [
  { value: '1', label: '是' },
  { value: '0', label: '否' },
];

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'ApiSelect',
    componentProps: {
      api: getOperatorOptions,
      placeholder: '请选择运营商',
      allowClear: true,
    },
    fieldName: 'operatorId',
    label: '所属运营商',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入APN名称',
    },
    fieldName: 'name',
    label: 'APN名称',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      getPopupContainer,
      options: IS_DEFAULT_OPTIONS,
      placeholder: '全部',
    },
    fieldName: 'isDefault',
    label: '默认APN',
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
    label: '状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    title: 'APN名称',
    field: 'name',
    minWidth: 180,
    formatter: ({ row }) => row.name || row.apn || '--',
  },
  {
    title: '所属运营商',
    field: 'operatorName',
    minWidth: 140,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '默认APN',
    field: 'isDefault',
    width: 110,
    slots: { default: 'isDefault' },
  },
  {
    title: '状态',
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
    formatter: ({ row }) => row.createTime || row.creationTime || '--',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 100,
  },
];

export const modalSchema: FormSchemaGetter = () => [
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
    component: 'ApiSelect',
    componentProps: {
      api: getEnabledOperatorOptions,
      placeholder: '请选择运营商',
    },
    dependencies: {
      componentProps(values) {
        return {
          disabled: !!values?.id,
        };
      },
      triggerFields: ['id'],
    },
    fieldName: 'operatorId',
    label: '所属运营商',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 100,
      placeholder: '请输入APN名称',
    },
    fieldName: 'name',
    label: 'APN名称',
    rules: z
      .string()
      .min(1, { message: '请输入APN名称' })
      .max(100, { message: 'APN名称最长100字符' }),
  },
  {
    component: 'Textarea',
    componentProps: {
      maxlength: 200,
      placeholder: '请输入备注信息',
      rows: 3,
      showCount: true,
    },
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
