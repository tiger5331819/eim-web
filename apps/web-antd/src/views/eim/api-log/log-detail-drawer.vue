<script setup lang="ts">
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, DescriptionsItem, Tag } from 'antdv-next';

import { apiLogDetail } from '#/api/system/api-log';
import type { ApiLogVO } from '#/api/system/api-log/model';

import { getMethodColor } from './data';

const loading = ref(false);
const log = ref<ApiLogVO | null>(null);

const [BasicDrawer, drawerApi] = useVbenDrawer({
  title: '日志详情',
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    const data = drawerApi.getData() as {
      id?: number | string;
      row?: ApiLogVO;
    };
    if (data?.row && !data.id) {
      log.value = data.row;
      return;
    }
    if (!data?.id) return;
    loading.value = true;
    try {
      log.value = await apiLogDetail(data.id);
    } catch {
      log.value = data.row || null;
    } finally {
      loading.value = false;
    }
  },
  onClosed: () => {
    log.value = null;
  },
});
</script>

<template>
  <BasicDrawer class="w-[720px]" :loading="loading">
    <div v-if="log" class="space-y-4">
      <Descriptions :column="2" bordered size="small">
        <DescriptionsItem label="日志ID">{{ log.id }}</DescriptionsItem>
        <DescriptionsItem label="TraceId">
          <code class="text-xs">{{ log.traceId || '--' }}</code>
        </DescriptionsItem>
        <DescriptionsItem label="租户">
          {{ log.tenantName || log.tenantId || '--' }}
        </DescriptionsItem>
        <DescriptionsItem label="用户">
          {{ log.userName || '--' }}
        </DescriptionsItem>
        <DescriptionsItem label="接口" :span="2">
          {{ log.apiName || '--' }}
        </DescriptionsItem>
        <DescriptionsItem label="方法">
          <Tag :color="getMethodColor(log.requestMethod)">
            {{ log.requestMethod }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem label="结果">
          <Tag :color="log.success ? 'green' : 'red'">
            {{ log.success ? '成功' : '失败' }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem label="URI" :span="2">
          <code class="text-xs">{{ log.requestUri || '--' }}</code>
        </DescriptionsItem>
        <DescriptionsItem label="请求IP">
          {{ log.requestIp || '--' }}
        </DescriptionsItem>
        <DescriptionsItem label="耗时">
          <Tag color="cyan">{{ log.costTime ?? 0 }} ms</Tag>
        </DescriptionsItem>
        <DescriptionsItem label="状态码">
          {{ log.statusCode ?? '--' }}
        </DescriptionsItem>
        <DescriptionsItem label="调用时间">
          {{ log.createTime || '--' }}
        </DescriptionsItem>
        <DescriptionsItem v-if="log.deviceEid" label="设备EID" :span="2">
          {{ log.deviceEid }}
        </DescriptionsItem>
      </Descriptions>

      <div>
        <div class="mb-2 text-sm font-semibold">请求参数</div>
        <pre
          class="max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs dark:bg-gray-800"
        >{{ log.requestParams || '(无)' }}</pre>
      </div>

      <div>
        <div class="mb-2 text-sm font-semibold">响应信息</div>
        <pre
          class="max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs dark:bg-gray-800"
        >{{ log.responseBody || '(无)' }}</pre>
      </div>

      <div v-if="log.errorMsg">
        <div class="mb-2 text-sm font-semibold text-rose-600">异常信息</div>
        <pre
          class="max-h-40 overflow-auto rounded bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
        >{{ log.errorMsg }}</pre>
      </div>
    </div>
  </BasicDrawer>
</template>
