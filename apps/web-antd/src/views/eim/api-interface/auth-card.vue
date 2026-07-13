<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useClipboard } from '@vueuse/core';
import { EnableStatus } from '@vben/constants';

import {
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from '@antdv-next/icons';
import { Card, Input, SpaceCompact, Tag } from 'antdv-next';

import {
  apiCredentialList,
  apiCredentialSecret,
} from '#/api/system/api-credential';
import type { ApiCredentialVO } from '#/api/system/api-credential/model';

const loading = ref(false);
const credential = ref<ApiCredentialVO | null>(null);
const secretVisible = ref(false);
const plainSecret = ref('');

const { copy } = useClipboard({ legacy: true });

function maskSecret(secret?: string) {
  if (!secret) return '••••••••••••••••';
  if (secret.length <= 10) return `${secret.slice(0, 2)}****`;
  return `${secret.slice(0, 6)}****${secret.slice(-4)}`;
}

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
      plainSecret.value = await apiCredentialSecret(credential.value.id, true);
    } catch {
      window.message.error('获取密钥失败');
      return;
    }
  }
  secretVisible.value = true;
}

async function loadCredential() {
  loading.value = true;
  try {
    const res = await apiCredentialList({ pageNum: 1, pageSize: 1 });
    credential.value = res.rows?.[0] || null;
    if (credential.value?.id) {
      try {
        plainSecret.value = await apiCredentialSecret(
          credential.value.id,
          true,
        );
      } catch {
        plainSecret.value = '';
      }
    }
  } finally {
    loading.value = false;
  }
}

onMounted(loadCredential);

defineExpose({ reload: loadCredential });
</script>

<template>
  <Card title="API鉴权参数" :loading="loading" class="mb-4">
    <div v-if="!credential" class="text-gray-400">暂无鉴权参数</div>
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <div class="mb-1 text-sm text-gray-500">AppKey</div>
        <SpaceCompact class="w-full">
          <Input :value="credential.appKey" readonly />
          <a-button @click="handleCopy(credential.appKey)">
            <CopyOutlined />
          </a-button>
        </SpaceCompact>
      </div>
      <div>
        <div class="mb-1 text-sm text-gray-500">AppSecret</div>
        <SpaceCompact class="w-full">
          <Input
            :value="secretVisible ? plainSecret : maskSecret(plainSecret)"
            readonly
          />
          <a-button @click="toggleSecret">
            <EyeOutlined v-if="!secretVisible" />
            <EyeInvisibleOutlined v-else />
          </a-button>
          <a-button @click="handleCopy(plainSecret)" :disabled="!plainSecret">
            <CopyOutlined />
          </a-button>
        </SpaceCompact>
      </div>
      <div>
        <div class="mb-1 text-sm text-gray-500">状态</div>
        <Tag
          :color="
            credential.status === EnableStatus.Enable ? 'success' : 'default'
          "
        >
          {{
            credential.status === EnableStatus.Enable ? '启用' : '禁用'
          }}
        </Tag>
      </div>
    </div>
  </Card>
</template>
