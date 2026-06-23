<script setup lang="ts">
import type { TenantLicenseVO } from '#/api/system/license/model';

import { computed, onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import {
  CheckCircleFilled,
  CloseCircleFilled,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@antdv-next/icons';
import { Button, Space, Table, Tag, Tooltip } from 'antdv-next';

import { getLicense, getMyLicense, toggleLicenseStatus } from '#/api/system/license';
import { useTenantStore } from '#/store/tenant';

import LicenseAddModal from './license-add-modal.vue';
import LicenseAdjustModal from './license-adjust-modal.vue';

const { hasAccessByCodes, hasAccessByRoles } = useAccess();
const userStore = useUserStore();
const tenantStore = useTenantStore();

const isAdmin = computed(() => hasAccessByRoles(['superadmin']));
const ownTenantId = computed(() => userStore.userInfo?.tenantId ?? '');

const fmt = (n: number) => n.toLocaleString('zh-CN');

// ============================================================
// 普通租户
// ============================================================
const license = ref<null | TenantLicenseVO>(null);
const loading = ref(false);

async function loadMyLicense() {
  loading.value = true;
  try { license.value = await getMyLicense(); } catch { license.value = null; } finally { loading.value = false; }
}

const isActive = computed(() => license.value?.status === '0');
const usagePercent = computed(() => {
  if (!license.value || license.value.totalQuota === 0) return 0;
  return Math.round((license.value.usedQuota / license.value.totalQuota) * 100);
});

// ============================================================
// 管理员
// ============================================================
const [AddModal, addModalApi] = useVbenModal({ connectedComponent: LicenseAddModal });
const [AdjustModal, adjustModalApi] = useVbenModal({ connectedComponent: LicenseAdjustModal });

const rows = ref<TenantLicenseVO[]>([]);
const tableLoading = ref(false);

async function loadAllLicenses() {
  if (tenantStore.tenantList.length === 0) return;
  tableLoading.value = true;
  try {
    const results = await Promise.all(tenantStore.tenantList.map((t) => getLicense(t.tenantId)));
    rows.value = (results.filter(Boolean) as TenantLicenseVO[]).sort((a, b) => a.tenantId.localeCompare(b.tenantId));
  } finally {
    tableLoading.value = false;
  }
}

// -------- 管理员汇总 --------
const summary = computed(() => {
  const r = rows.value;
  return {
    tenantCount: r.length,
    totalAdded: r.reduce((s, x) => s + x.totalQuota, 0),
    totalUsed: r.reduce((s, x) => s + x.usedQuota, 0),
    totalFrozen: r.reduce((s, x) => s + x.frozenQuota, 0),
    totalAvailable: r.reduce((s, x) => s + x.availableQuota, 0),
  };
});

const stats = computed(() => [
  {
    label: '租户总数',
    value: summary.value.tenantCount,
    unit: '个',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    icon: '🏢',
  },
  {
    label: '累计添加',
    value: fmt(summary.value.totalAdded),
    unit: '次',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    icon: '📦',
  },
  {
    label: '已确认扣减',
    value: fmt(summary.value.totalUsed),
    unit: '次',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    icon: '📤',
  },
  {
    label: '冻结中',
    value: fmt(summary.value.totalFrozen),
    unit: '次',
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
    icon: '🔒',
  },
  {
    label: '可用总数',
    value: fmt(summary.value.totalAvailable),
    unit: '次',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    icon: '✅',
  },
]);

function handleAdd(record: TenantLicenseVO) {
  addModalApi.setData({ tenantId: record.tenantId });
  addModalApi.open();
}
function handleAdjust(record: TenantLicenseVO) {
  adjustModalApi.setData({ tenantId: record.tenantId, current: record.availableQuota ?? 0 });
  adjustModalApi.open();
}
async function handleToggleStatus(record: TenantLicenseVO) {
  const target = record.status === '0' ? '1' : '0';
  window.modal.confirm({
    title: '操作确认',
    content: `确定要${target === '1' ? '停用' : '启用'}租户 ${record.tenantId} 的 License 吗？`,
    onOk: async () => {
      await toggleLicenseStatus({ tenantId: record.tenantId, status: target });
      await loadAllLicenses();
    },
  });
}

const columns = [
  { title: '#', key: 'index', width: 56, align: 'center' as const },
  { title: '租户 ID', dataIndex: 'tenantId', key: 'tenantId', width: 160 },
  { title: '累计添加', dataIndex: 'totalQuota', key: 'totalQuota', width: 110, align: 'center' as const },
  { title: '已扣减', dataIndex: 'usedQuota', key: 'usedQuota', width: 100, align: 'center' as const },
  { title: '冻结中', dataIndex: 'frozenQuota', key: 'frozenQuota', width: 100, align: 'center' as const },
  { title: '可用次数', dataIndex: 'availableQuota', key: 'availableQuota', width: 130, align: 'center' as const },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' as const },
  { title: '操作', key: 'actions', width: 230, fixed: 'right' as const },
];

onMounted(async () => {
  if (isAdmin.value) {
    if (tenantStore.tenantList.length === 0) await tenantStore.initTenant();
    await loadAllLicenses();
  } else {
    await loadMyLicense();
  }
});
</script>

<template>
  <Page :auto-content-height="false">
    <!-- ============================================================
         管理员视图
         ============================================================ -->
    <template v-if="isAdmin">
      <!-- ---- 渐变统计卡片 ---- -->
      <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div
          v-for="s in stats"
          :key="s.label"
          class="group relative cursor-default overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          :style="{ background: s.gradient }"
        >
          <!-- 装饰图案 -->
          <div class="absolute -bottom-4 -right-4 text-6xl opacity-20 transition-transform duration-500 group-hover:scale-125 group-hover:opacity-30">
            {{ s.icon }}
          </div>
          <div class="relative">
            <p class="text-xs font-medium tracking-wider opacity-80">{{ s.label }}</p>
            <div class="mt-2 flex items-baseline gap-0.5">
              <span class="text-[28px] font-extrabold leading-none tracking-tight">{{ s.value }}</span>
              <span class="text-xs opacity-70">{{ s.unit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ---- 工具栏 ---- -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold tracking-tight text-gray-800 dark:text-gray-200">
          租户 License 余额明细
        </h2>
        <Button size="small" :loading="tableLoading" @click="loadAllLicenses">
          <template #icon><ReloadOutlined /></template>
          刷新数据
        </Button>
      </div>

      <!-- ---- 表格 ---- -->
      <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Table
          :columns="columns"
          :data-source="rows"
          :loading="tableLoading"
          :pagination="false"
          :show-header="true"
          row-key="tenantId"
          size="middle"
        >
          <template #bodyCell="{ column, record, index }">
            <!-- 序号 -->
            <template v-if="column.key === 'index'">
              <span class="text-xs text-gray-400">{{ index + 1 }}</span>
            </template>

            <!-- 租户 ID -->
            <template v-else-if="column.key === 'tenantId'">
              <code class="rounded-md bg-gray-50 px-2 py-0.5 text-xs font-semibold tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {{ record.tenantId }}
              </code>
            </template>

            <!-- 可用次数 -->
            <template v-else-if="column.key === 'availableQuota'">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                :class="
                  record.availableQuota > 0
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                "
              >
                {{ fmt(record.availableQuota) }}
              </span>
            </template>

            <!-- 状态 -->
            <template v-else-if="column.key === 'status'">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="
                  record.status === '0'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                "
              >
                <span class="size-1.5 rounded-full" :class="record.status === '0' ? 'bg-emerald-500' : 'bg-red-500'" />
                {{ record.status === '0' ? '正常' : '停用' }}
              </span>
            </template>

            <!-- 操作 -->
            <template v-else-if="column.key === 'actions'">
              <Space :size="4">
                <Tooltip title="为该租户添加 License 次数">
                  <Button
                    v-if="hasAccessByCodes(['eim:license:add'])"
                    size="small"
                    type="default"
                    class="!border-indigo-200 !text-indigo-600 hover:!border-indigo-400 hover:!bg-indigo-50 dark:!border-indigo-800 dark:!text-indigo-400 dark:hover:!bg-indigo-900/20"
                    @click="handleAdd(record)"
                  >
                    <template #icon><PlusOutlined /></template>
                    添加
                  </Button>
                </Tooltip>
                <Tooltip title="调整 License 次数（增加或扣减）">
                  <Button
                    v-if="hasAccessByCodes(['eim:license:adjust'])"
                    size="small"
                    type="default"
                    class="!border-amber-200 !text-amber-600 hover:!border-amber-400 hover:!bg-amber-50 dark:!border-amber-800 dark:!text-amber-400 dark:hover:!bg-amber-900/20"
                    @click="handleAdjust(record)"
                  >
                    <template #icon><SettingOutlined /></template>
                    调整
                  </Button>
                </Tooltip>
                <Tooltip :title="record.status === '0' ? '停用该租户 License' : '启用该租户 License'">
                  <Button
                    v-if="hasAccessByCodes(['eim:license:status'])"
                    size="small"
                    type="default"
                    :class="
                      record.status === '0'
                        ? '!border-red-200 !text-red-500 hover:!border-red-400 hover:!bg-red-50 dark:!border-red-800 dark:!text-red-400 dark:hover:!bg-red-900/20'
                        : '!border-emerald-200 !text-emerald-600 hover:!border-emerald-400 hover:!bg-emerald-50 dark:!border-emerald-800 dark:!text-emerald-400 dark:hover:!bg-emerald-900/20'
                    "
                    @click="handleToggleStatus(record)"
                  >
                    <template #icon><MinusOutlined v-if="record.status === '0'" /><CheckCircleFilled v-else /></template>
                    {{ record.status === '0' ? '停用' : '启用' }}
                  </Button>
                </Tooltip>
              </Space>
            </template>
          </template>
        </Table>
      </div>
    </template>

    <!-- ============================================================
         普通租户视图
         ============================================================ -->
    <template v-else>
      <!-- ── Hero 区：可用次数大数字 ── -->
      <div class="relative mb-6 overflow-hidden rounded-3xl bg-gray-950 p-10 shadow-2xl">
        <!-- 背景光晕 -->
        <div class="absolute -left-20 -top-20 size-80 rounded-full bg-indigo-600/20 blur-[80px]" />
        <div class="absolute -bottom-10 right-10 size-60 rounded-full bg-cyan-500/15 blur-[60px]" />
        <div class="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px]" />

        <div class="relative">
          <!-- 状态 + 租户 -->
          <div class="mb-4 flex items-center gap-3">
            <span
              class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur"
              :class="
                isActive
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/30 bg-red-500/10 text-red-300'
              "
            >
              <span class="size-1.5 rounded-full" :class="isActive ? 'bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400' : 'bg-red-400 shadow-[0_0_6px] shadow-red-400'" />
              {{ isActive ? 'License 正常' : 'License 已停用' }}
            </span>
            <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50 backdrop-blur">
              租户 {{ ownTenantId }}
            </span>
          </div>

          <!-- 大数字 -->
          <p class="text-6xl font-black tracking-tighter text-white">
            {{ fmt(license?.availableQuota ?? 0) }}
          </p>
          <p class="mt-1 text-sm font-medium tracking-widest text-indigo-300 uppercase">
            可用 License 次数
          </p>
        </div>
      </div>

      <!-- ── 三列数据卡 ── -->
      <div class="mb-6 grid gap-4 sm:grid-cols-3">
        <!-- 累计添加 -->
        <div class="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-4 flex items-center gap-2">
            <div class="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <PlusOutlined />
            </div>
            <span class="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">累计添加次数</span>
          </div>
          <p class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {{ fmt(license?.totalQuota ?? 0) }}
          </p>
          <!-- 进度条：已用 / 总计 -->
          <div class="mt-4">
            <div class="flex justify-between text-[11px] text-gray-400">
              <span>已用 {{ fmt(license?.usedQuota ?? 0) }}</span>
              <span>{{ usagePercent }}%</span>
            </div>
            <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-700"
                :style="{ width: `${usagePercent}%` }"
              />
            </div>
          </div>
        </div>

        <!-- 冻结中 -->
        <div class="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-4 flex items-center gap-2">
            <div class="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <MinusOutlined />
            </div>
            <span class="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">冻结中次数</span>
          </div>
          <p class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {{ fmt(license?.frozenQuota ?? 0) }}
          </p>
          <p class="mt-4 text-[11px] leading-relaxed text-gray-400">
            冻结中的次数暂不可用，待业务确认后释放
          </p>
        </div>

        <!-- 备注 -->
        <div class="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-4 flex items-center gap-2">
            <div class="flex size-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <SettingOutlined />
            </div>
            <span class="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">备注信息</span>
          </div>
          <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {{ license?.remark || '暂无备注' }}
          </p>
        </div>
      </div>
    </template>

    <!-- 弹窗 -->
    <AddModal @reload="loadAllLicenses" />
    <AdjustModal @reload="loadAllLicenses" />
  </Page>
</template>
