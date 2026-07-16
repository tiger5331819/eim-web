<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { useClipboard } from '@vueuse/core';

import { CopyOutlined, EyeInvisibleOutlined, EyeOutlined } from '@antdv-next/icons';
import { Input, Skeleton, SpaceCompact } from 'antdv-next';

import {
  apiCredentialSecret,
  apiCredentialViewSecret,
} from '#/api/system/api-credential';
import type { ApiCredentialVO } from '#/api/system/api-credential/model';

const loading = ref(false);
const credential = ref<ApiCredentialVO | null>(null);
const secretVisible = ref(false);
const plainSecret = ref('');

const { copy } = useClipboard({ legacy: true });

const [BasicModal, modalApi] = useVbenModal({
  title: '查看密钥',
  footer: false,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      credential.value = null;
      plainSecret.value = '';
      secretVisible.value = false;
      return;
    }
    const data = modalApi.getData() as { id?: number | string };
    if (!data?.id) return;
    loading.value = true;
    try {
      credential.value = await apiCredentialViewSecret(String(data.id));
    } finally {
      loading.value = false;
    }
  },
});

async function handleCopy(text?: string) {
  if (!text) {
    window.message.warning('暂无内容可复制');
    return;
  }
  try {
    await copy(text);
    window.message.success('已复制到剪贴板');
  } catch {
    window.message.error('复制失败，请手动复制');
  }
}

async function toggleSecret() {
  if (!credential.value?.id) return;
  if (secretVisible.value) {
    secretVisible.value = false;
    return;
  }
  if (!plainSecret.value) {
    try {
      plainSecret.value = await apiCredentialSecret(
        String(credential.value.id),
        true,
      );
    } catch {
      window.message.error('获取密钥失败');
      return;
    }
  }
  secretVisible.value = true;
}

function maskedSecret(secret?: string) {
  const value = secret || plainSecret.value;
  if (!value) return '••••••••••••••••••••••••';
  if (value.length <= 10) return '••••••••';
  return `${value.slice(0, 6)}****${value.slice(-4)}`;
}
</script>

<template>
  <BasicModal class="w-[520px]">
    <Skeleton v-if="loading" active :paragraph="{ rows: 3 }" />
    <div v-else class="space-y-4">
      <div>
        <div class="mb-1 text-sm text-gray-500">AppKey</div>
        <SpaceCompact class="w-full">
          <Input :value="credential?.appKey" readonly />
          <a-button @click="handleCopy(credential?.appKey)">
            <CopyOutlined />
          </a-button>
        </SpaceCompact>
      </div>
      <div>
        <div class="mb-1 text-sm text-gray-500">AppSecret</div>
        <SpaceCompact class="w-full">
          <Input
            :value="
              secretVisible
                ? plainSecret || credential?.appSecret
                : maskedSecret(credential?.appSecret)
            "
            readonly
          />
          <a-button @click="toggleSecret">
            <EyeOutlined v-if="!secretVisible" />
            <EyeInvisibleOutlined v-else />
          </a-button>
          <a-button
            @click="
              handleCopy(
                secretVisible
                  ? plainSecret || credential?.appSecret
                  : credential?.appSecret || plainSecret,
              )
            "
          >
            <CopyOutlined />
          </a-button>
        </SpaceCompact>
      </div>
    </div>
  </BasicModal>
</template>
