<script setup lang="ts">
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, DescriptionsItem, Tag } from 'antdv-next';

import type { OpenApiLogVO } from '#/api/system/openapi-log/model';

import { getMethodColor } from './data';

const log = ref<OpenApiLogVO | null>(null);

const [BasicDrawer, drawerApi] = useVbenDrawer({
  title: '日志详情',
  onOpenChange: (isOpen) => {
    if (!isOpen) return;
    log.value = drawerApi.getData() as OpenApiLogVO;
  },
  onClosed: () => {
    log.value = null;
  },
});
</script>

<template>
  <BasicDrawer class="w-[680px]">
    <div v-if="log" class="space-y-4">
      <Descriptions :column="2" bordered size="small">
        <DescriptionsItem label="租户">{{ log.tenantId || '--' }}</DescriptionsItem>
        <DescriptionsItem label="用户">{{ log.userName || '--' }}</DescriptionsItem>
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
        <DescriptionsItem label="请求IP">{{ log.requestIp || '--' }}</DescriptionsItem>
        <DescriptionsItem label="耗时">
          <Tag color="cyan">{{ log.costTime ?? 0 }} ms</Tag>
        </DescriptionsItem>
        <DescriptionsItem label="TraceID" :span="2">
          <code class="text-xs">{{ log.traceId || '--' }}</code>
        </DescriptionsItem>
        <DescriptionsItem label="调用时间" :span="2">
          {{ log.createTime }}
        </DescriptionsItem>
      </Descriptions>

      <div>
        <div class="mb-2 text-sm font-semibold">请求参数</div>
        <pre
          class="max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs dark:bg-gray-800"
        >{{ log.requestParams || '(无)' }}</pre>
      </div>

      <div>
        <div class="mb-2 text-sm font-semibold">响应摘要</div>
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
