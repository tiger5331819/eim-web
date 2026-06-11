import type { FormSchemaGetter } from '#/adapter/form';

import { useTenantStore } from '#/store/tenant';

/** 顶部租户选择器 schema */
export const tenantSelectSchema: FormSchemaGetter = () => {
  const tenantStore = useTenantStore();
  return [
    {
      component: 'Select',
      componentProps: {
        allowClear: false,
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
  ];
};
