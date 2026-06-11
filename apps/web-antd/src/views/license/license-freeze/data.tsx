import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { useTenantStore } from '#/store/tenant';

const FREEZE_STATUS_MAP: Record<string, { color: string; text: string }> = {
  FROZEN:    { color: 'orange', text: '冻结中' },
  CONFIRMED: { color: 'green',  text: '已确认扣减' },
  RELEASED:  { color: 'blue',   text: '已释放' },
  EXPIRED:   { color: 'red',    text: '已过期' },
};

export function getFreezeStatusMeta(status: string) {
  return FREEZE_STATUS_MAP[status] ?? { color: 'default', text: status };
}

export const FREEZE_STATUS_OPTIONS = Object.entries(FREEZE_STATUS_MAP).map(
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
        placeholder: '请选择状态',
        options: FREEZE_STATUS_OPTIONS,
      },
      fieldName: 'status',
      label: '冻结状态',
    },
  ];
};

export const columns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 60 },
  { title: '租户ID', field: 'tenantId', width: 160 },
  { title: '任务ID', field: 'taskId', width: 180, showOverflow: true },
  { title: 'Profile ID', field: 'profileId', width: 140, showOverflow: true },
  { title: 'ICCID', field: 'iccid', width: 180 },
  { title: '冻结额度', field: 'freezeQuota', width: 100 },
  {
    title: '状态',
    field: 'status',
    width: 110,
    slots: { default: 'status' },
  },
  { title: '冻结时间', field: 'freezeTime', width: 170 },
  { title: '确认时间', field: 'confirmTime', width: 170 },
  { title: '释放时间', field: 'releaseTime', width: 170 },
  { title: '过期时间', field: 'expireTime', width: 170 },
  { title: '备注', field: 'remark', minWidth: 140, showOverflow: true },
];
