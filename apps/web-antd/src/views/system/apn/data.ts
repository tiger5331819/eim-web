import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

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
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'APN ID', field: 'id' },
  { title: '名称', field: 'name' },
  { title: 'APN', field: 'apn' },
  { title: '适用地区', field: 'local' },
  { title: '创建时间', field: 'creationTime' },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show(values) {
        // 编辑模式下隐藏ID字段（通过API获取），新增模式下显示
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
];
