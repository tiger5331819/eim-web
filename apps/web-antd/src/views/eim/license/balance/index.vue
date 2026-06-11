<script setup lang="ts">
import type { TenantLicenseVO } from '#/api/system/license/model';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Card, Statistic, Tag } from 'antdv-next';

import { getLicense, toggleLicenseStatus } from '#/api/system/license';
import { useTenantStore } from '#/store/tenant';

import LicenseAddModal from './license-add-modal.vue';
import LicenseAdjustModal from './license-adjust-modal.vue';

const { hasAccessByCodes } = useAccess();

const tenantStore = useTenantStore();
const route = useRoute();
const selectedTenantId = ref<string>('');
const license = ref<null | TenantLicenseVO>(null);
const loading = ref(false);

const [AddModal, addModalApi] = useVbenModal({
  connectedComponent: LicenseAddModal,
});
const [AdjustModal, adjustModalApi] = useVbenModal({
  connectedComponent: LicenseAdjustModal,
});

async function loadLicense(tenantId: string) {
  if (!tenantId) return;
  loading.value = true;
  try {
    license.value = await getLicense(tenantId);
  } catch (error) {
    console.error(error);
    license.value = null;
  } finally {
    loading.value = false;
  }
}

async function handleToggleStatus() {
  if (!license.value) return;
  const target = license.value.status === '0' ? '1' : '0';
  window.modal.confirm({
    title: '提示',
    content: `确认${target === '1' ? '停用' : '启用'}该租户的 License？`,
    onOk: async () => {
      await toggleLicenseStatus({
        tenantId: license.value!.tenantId,
        status: target,
      });
      await loadLicense(license.value!.tenantId);
    },
  });
}

function handleAdd() {
  if (!selectedTenantId.value) {
    window.message.warning('请先选择租户');
    return;
  }
  addModalApi.setData({ tenantId: selectedTenantId.value });
  addModalApi.open();
}

function handleAdjust() {
  if (!selectedTenantId.value) {
    window.message.warning('请先选择租户');
    return;
  }
  adjustModalApi.setData({
    tenantId: selectedTenantId.value,
    current: license.value?.availableQuota ?? 0,
  });
  adjustModalApi.open();
}

const statusTag = computed(() => {
  if (!license.value) return null;
  return license.value.status === '0'
    ? { color: 'green', text: '正常' }
    : { color: 'red', text: '停用' };
});

const tenantOptions = computed(() =>
  tenantStore.tenantList.map((t) => ({
    label: t.companyName,
    value: t.tenantId,
  })),
);

watch(selectedTenantId, (v) => loadLicense(v));

onMounted(async () => {
  if (tenantStore.tenantList.length === 0) {
    await tenantStore.initTenant();
  }
  const queryTenantId = route.query.tenantId as string | undefined;
  if (
    queryTenantId &&
    tenantStore.tenantList.some((t) => t.tenantId === queryTenantId)
  ) {
    selectedTenantId.value = queryTenantId;
  } else {
    const first = tenantStore.tenantList[0];
    if (first) selectedTenantId.value = first.tenantId;
  }
});
</script>

<template>
  <Page :auto-content-height="false">
    <!-- 顶部租户选择 + 操作按钮 -->
    <Card
      :body-style="{ padding: '16px 20px' }"
      class="mb-4 shadow-sm transition hover:shadow-md"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="text-base font-semibold">租户：</span>
          <a-select
            v-model:value="selectedTenantId"
            :options="tenantOptions"
            show-search
            option-filter-prop="label"
            placeholder="请选择租户"
            style="width: 240px"
          />
          <Tag v-if="statusTag" :color="statusTag.color" class="!ml-2">
            {{ statusTag.text }}
          </Tag>
        </div>

        <a-space>
          <Button
            v-if="hasAccessByCodes(['eim:license:add'])"
            type="primary"
            @click="handleAdd"
          >
            添加次数
          </Button>
          <Button
            v-if="hasAccessByCodes(['eim:license:adjust'])"
            @click="handleAdjust"
          >
            调整次数
          </Button>
          <Button
            v-if="hasAccessByCodes(['eim:license:status'])"
            :danger="license?.status === '0'"
            @click="handleToggleStatus"
          >
            {{ license?.status === '0' ? '停用' : '启用' }}
          </Button>
        </a-space>
      </div>
    </Card>

    <!-- 4 张渐变统计卡片 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        :body-style="{ padding: '20px 24px' }"
        :loading="loading"
        class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        :style="{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        }"
      >
        <Statistic
          :value="license?.totalQuota ?? 0"
          :value-style="{ color: '#fff', fontSize: '28px', fontWeight: 600 }"
        >
          <template #title>
            <span class="text-white/80">累计添加次数</span>
          </template>
        </Statistic>
      </Card>

      <Card
        :body-style="{ padding: '20px 24px' }"
        :loading="loading"
        class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        :style="{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: '#fff',
        }"
      >
        <Statistic
          :value="license?.usedQuota ?? 0"
          :value-style="{ color: '#fff', fontSize: '28px', fontWeight: 600 }"
        >
          <template #title>
            <span class="text-white/80">已确认扣减</span>
          </template>
        </Statistic>
      </Card>

      <Card
        :body-style="{ padding: '20px 24px' }"
        :loading="loading"
        class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        :style="{
          background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
          color: '#fff',
        }"
      >
        <Statistic
          :value="license?.frozenQuota ?? 0"
          :value-style="{ color: '#fff', fontSize: '28px', fontWeight: 600 }"
        >
          <template #title>
            <span class="text-white/80">冻结中次数</span>
          </template>
        </Statistic>
      </Card>

      <Card
        :body-style="{ padding: '20px 24px' }"
        :loading="loading"
        class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        :style="{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: '#fff',
        }"
      >
        <Statistic
          :value="license?.availableQuota ?? 0"
          :value-style="{ color: '#fff', fontSize: '32px', fontWeight: 700 }"
        >
          <template #title>
            <span class="text-white/90 font-semibold">可用次数</span>
          </template>
        </Statistic>
      </Card>
    </div>

    <!-- 备注 -->
    <Card
      v-if="license?.remark"
      :body-style="{ padding: '12px 16px' }"
      class="mt-4 shadow-sm"
      title="备注"
      size="small"
    >
      <p class="m-0 text-sm text-gray-600">{{ license.remark }}</p>
    </Card>

    <AddModal @reload="loadLicense(selectedTenantId)" />
    <AdjustModal @reload="loadLicense(selectedTenantId)" />
  </Page>
</template>
