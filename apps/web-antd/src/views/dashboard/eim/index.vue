<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { Card, Row, Col, Statistic } from 'antdv-next';

defineOptions({ name: 'EimDashboard' });

const modules = [
  {
    title: '租户License',
    desc: '余额查询、变更流水、冻结记录',
    icon: '💰',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/eim-license/balance',
  },
  {
    title: '码号资源池',
    desc: '池统计、资源调配、调配日志',
    icon: '📦',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    path: '/eim-profile-pool/stats',
  },
  {
    title: '库存管理',
    desc: '卡入库、批量导入、分配管理',
    icon: '🗂️',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    path: '/cardImport',
  },
  {
    title: '设备管理',
    desc: 'eUICC设备、业务号下载',
    icon: '📱',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    path: '/device',
  },
  {
    title: 'APN列表',
    desc: 'APN配置、默认设置、按运营商查询',
    icon: '📡',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    path: '/apn',
  },
  {
    title: '任务列表',
    desc: '下载任务、进度跟踪、导出',
    icon: '📋',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    path: '/task',
  },
  {
    title: 'OpenAPI日志',
    desc: '接口调用记录、请求响应详情',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    path: '/eim-openapi-log',
  },
];

function navigate(path: string) {
  window.open(path, '_self');
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mx-auto max-w-5xl px-4 py-6">
      <!-- 欢迎区域 -->
      <div class="mb-8 text-center">
        <h1
          class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
        >
          eIM
        </h1>
        <p class="mt-2 text-gray-500">eSIM 管理平台 · 一站式设备与码号资源管理</p>
      </div>

      <!-- 快捷入口 -->
      <Row :gutter="[16, 16]">
        <Col v-for="mod in modules" :key="mod.path" :xs="24" :sm="12" :lg="8">
          <Card
            hoverable
            class="cursor-pointer border-none shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            :body-style="{ padding: '20px' }"
            @click="navigate(mod.path)"
          >
            <div class="flex items-start gap-4">
              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                :style="{ background: mod.gradient }"
              >
                {{ mod.icon }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {{ mod.title }}
                </div>
                <div class="mt-1 text-xs text-gray-400">
                  {{ mod.desc }}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>
