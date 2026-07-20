<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { nextTick, ref } from 'vue';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deviceProfileRecordList } from '#/api/system/device';
import { getProfileOperationMeta } from '#/utils/deviceLedgerStatus';

import {
  profileRecordColumns,
  profileRecordFieldMappingTime,
  profileRecordQuerySchema,
} from './data';

const props = defineProps<{
  eid: string;
}>();

const ready = ref(false);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 72,
    componentProps: { allowClear: true },
  },
  schema: profileRecordQuerySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  fieldMappingTime: [...profileRecordFieldMappingTime],
};

const gridOptions: VxeGridProps = {
  columns: profileRecordColumns,
  height: 520,
  keepSource: true,
  emptyText: '暂无码号记录',
  toolbarConfig: {
    refresh: false,
    zoom: false,
    custom: false,
  },
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    // 由外部 query() 触发加载，避免与全局 autoLoad 重复请求
    autoLoad: false,
    ajax: {
      query: async ({ page }, formValues = {}) => {
        if (!props.eid) {
          return { rows: [], total: 0 };
        }
        return await deviceProfileRecordList(props.eid, {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  id: 'system-device-profile-record',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  separator: false,
});

function query() {
  if (!props.eid) return;
  ready.value = true;
  void nextTick(() => tableApi.reload());
}

defineExpose({ query });
</script>

<template>
  <BasicTable v-if="ready">
    <template #operType="{ row }">
      <Tag
        :color="
          getProfileOperationMeta(
            row.operType,
          ).color
        "
      >
        {{
          getProfileOperationMeta(
            row.operType,
          ).text
        }}
      </Tag>
    </template>
  </BasicTable>
</template>
