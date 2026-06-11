import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useTenantStore } from '#/store/tenant';

const CHANGE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  ADD:      { color: 'blue',    text: '添加' },
  ADJUST:   { color: 'purple',  text: '调整' },
  FREEZE:   { color: 'orange',  text: '冻结' },
  CONFIRM:  { color: 'green',   text: '确认扣减' },
  RELEASE:  { color: 'cyan',    text: '释放' },
  EXPIRE:   { color: 'red',     text: '过期' },
};

export function getChangeTypeMeta(type: string) {
  return CHANGE_TYPE_MAP[type] ?? { color: 'default', text: type };
}

export const CHANGE_TYPE_OPTIONS = Object.entries(CHANGE_TYPE_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);

export const querySchema: FormSchemaGetter = () => {
  const tenantStore = useTenantStore();
  return [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择租户',
        options: tenantStore.tenantList.map((t) => ({
          label: t.companyName,
          value: t.tenantId,
        })),
      },
      fieldName: 'tenantId',
      label: '租户',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择变更类型',
        options: CHANGE_TYPE_OPTIONS,
      },
      fieldName: 'changeType',
      label: '变更类型',
    },
  ];
};

export const columns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 60 },
  { title: '租户ID', field: 'tenantId', width: 160 },
  {
    title: '变更类型',
    field: 'changeType',
    width: 110,
    slots: { default: 'changeType' },
  },
  {
    title: '变更数量',
    field: 'changeQuota',
    width: 110,
    slots: { default: 'changeQuota' },
  },
  { title: '变更前可用', field: 'beforeAvailable', width: 110 },
  { title: '变更后可用', field: 'afterAvailable', width: 110 },
  { title: '业务类型', field: 'bizType', width: 100 },
  { title: '业务ID', field: 'bizId', width: 140 },
  { title: '操作人', field: 'operatorName', width: 110 },
  { title: '备注', field: 'remark', minWidth: 160, showOverflow: true },
  { title: '变更时间', field: 'createTime', width: 170 },
];
