import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import { z } from '#/adapter/form';
import { getDictOptions } from '#/utils/dict';

const passwordPattern = /^(?![0-9]+$)(?![a-zA-Z]+$)[A-Za-z0-9]{8,20}$/;

const domainPattern =
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入租户名称',
    },
    fieldName: 'companyName',
    label: '租户名称',
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
    label: '租户状态',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入联系人',
    },
    fieldName: 'contactUserName',
    label: '联系人',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '创建时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    title: '租户编号',
    field: 'tenantId',
    minWidth: 120,
  },
  {
    title: '租户名称',
    field: 'companyName',
    minWidth: 160,
  },
  {
    title: '自定义域名',
    field: 'domain',
    minWidth: 160,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '租户状态',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
  },
  {
    title: '用户数',
    field: 'userCount',
    minWidth: 90,
  },
  {
    title: 'License余额',
    field: 'licenseBalance',
    minWidth: 110,
  },
  {
    title: '码号数',
    field: 'assignedProfileCount',
    minWidth: 90,
    formatter: ({ cellValue }) => cellValue ?? 0,
  },
  {
    title: '过期时间',
    field: 'expireTime',
    minWidth: 120,
    formatter: ({ cellValue }) => {
      if (!cellValue) return '--';
      return cellValue.slice(0, 10);
    },
  },
  {
    title: '联系人',
    field: 'contactUserName',
    minWidth: 110,
  },
  {
    title: '联系电话',
    field: 'contactPhone',
    minWidth: 130,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '创建人',
    field: 'createByName',
    minWidth: 110,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    title: '创建时间',
    field: 'createTime',
    minWidth: 170,
    formatter: ({ cellValue }) => cellValue || '--',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 160,
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
      placeholder: '请输入租户名称',
    },
    fieldName: 'companyName',
    label: '租户名称',
    rules: z
      .string()
      .min(1, { message: '请输入租户名称' })
      .max(50, { message: '租户名称最长50字符' }),
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 20,
      placeholder: '请输入联系人',
    },
    fieldName: 'contactUserName',
    label: '联系人',
    rules: z
      .string()
      .min(1, { message: '请输入联系人' })
      .max(20, { message: '联系人最长20字符' }),
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 11,
      placeholder: '请输入11位手机号',
    },
    fieldName: 'contactPhone',
    label: '联系电话',
    rules: z
      .string()
      .regex(/^\d{11}$/, { message: '请输入11位手机号' }),
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
      placeholder: '请输入用户账号',
    },
    dependencies: {
      if: (values) => !!values?.id,
      triggerFields: ['id'],
    },
    fieldName: 'adminAccount',
    label: '用户账号',
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 30,
      placeholder: '请输入用户账号',
    },
    dependencies: {
      if: (values) => !values?.id,
      triggerFields: ['id'],
    },
    fieldName: 'username',
    label: '用户账号',
    rules: z
      .string()
      .min(1, { message: '请输入用户账号' })
      .max(30, { message: '用户账号最长30字符' }),
  },
  {
    component: 'InputPassword',
    componentProps: {
      placeholder: '请输入密码（8-20位，含字母和数字）',
    },
    dependencies: {
      if: (values) => !values?.id,
      triggerFields: ['id'],
    },
    fieldName: 'password',
    label: '账户密码',
    rules: z
      .string()
      .regex(passwordPattern, {
        message: '密码需8-20位，且同时包含字母和数字',
      }),
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      placeholder: '请选择套餐',
    },
    fieldName: 'packageId',
    label: '租户套餐',
    rules: 'selectRequired',
  },
  {
    component: 'DatePicker',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      getPopupContainer,
      placeholder: '请选择过期时间（选填）',
    },
    fieldName: 'expireTime',
    label: '过期时间',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '不限制', value: 'unlimited' },
        { label: '限制', value: 'limited' },
      ],
    },
    defaultValue: 'unlimited',
    fieldName: 'accountLimitType',
    label: '用户数量限额',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      min: 1,
      precision: 0,
      placeholder: '请输入限制数量',
    },
    dependencies: {
      if: (values) => values.accountLimitType === 'limited',
      rules: (values) => {
        if (values.accountLimitType === 'limited') {
          return z
            .number({ message: '请输入限制数量' })
            .int({ message: '请输入正整数' })
            .min(1, { message: '用户数量至少为1' });
        }
        return z.any().optional();
      },
      triggerFields: ['accountLimitType'],
    },
    fieldName: 'accountCount',
    label: '限制数量',
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 30,
      placeholder: '请输入自定义域名',
    },
    fieldName: 'domain',
    label: '自定义域名',
    rules: z
      .string()
      .min(1, { message: '请输入自定义域名' })
      .max(30, { message: '域名最长30字符' })
      .regex(domainPattern, { message: '请输入合法的域名格式' }),
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 100,
      placeholder: '请输入企业地址',
    },
    fieldName: 'address',
    label: '企业地址',
  },
  {
    component: 'Input',
    componentProps: {
      maxlength: 30,
      placeholder: '请输入企业代码',
    },
    fieldName: 'licenseNumber',
    label: '企业代码',
  },
  {
    component: 'Textarea',
    componentProps: {
      maxlength: 500,
      showCount: true,
      rows: 3,
      placeholder: '请输入企业介绍',
    },
    fieldName: 'intro',
    formItemClass: 'items-start',
    label: '企业介绍',
  },
  {
    component: 'Textarea',
    componentProps: {
      maxlength: 200,
      showCount: true,
      rows: 2,
      placeholder: '请输入备注',
    },
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
