<script setup lang="tsx">
import type { DescriptionsProps } from 'antdv-next';

import type { UserProfile } from '#/api/system/profile/model';

import { computed } from 'vue';

import { preferences } from '@vben/preferences';

import { Card, Descriptions, Tag } from 'antdv-next';

import { userUpdateAvatar } from '#/api/system/profile';
import { CropperAvatar } from '#/components/cropper';

const props = defineProps<{ profile?: UserProfile }>();

defineEmits<{
  uploadFinish: [];
}>();

const avatar = computed(
  () => props.profile?.user.avatar || preferences.app.defaultAvatar,
);

const items = computed<DescriptionsProps['items']>(() => {
  if (!props.profile) return [];
  const { profile } = props;
  return [
    {
      content: profile.user.userName,
      label: '账号',
    },
    {
      content: profile.user.phonenumber || '未绑定',
      label: '手机',
    },
    {
      content: profile.user.email || '未绑定',
      label: '邮箱',
    },
    {
      content: (
        <div class="flex flex-wrap gap-1">
          <Tag color="blue">{profile.user.deptName ?? '未分配'}</Tag>
          {profile.postGroup && <Tag color="purple">{profile.postGroup}</Tag>}
          {profile.roleGroup && <Tag color="green">{profile.roleGroup}</Tag>}
        </div>
      ),
      label: '部门/角色',
    },
    {
      content: profile.user.createTime,
      label: '注册时间',
    },
    {
      content: profile.user.loginDate,
      label: '上次登录',
    },
  ];
});
</script>

<template>
  <Card :loading="!profile" class="h-full lg:w-[360px] lg:shrink-0">
    <div v-if="profile" class="flex flex-col items-center gap-5 pb-2">
      <!-- 头像区域 -->
      <div
        class="flex flex-col items-center gap-4 rounded-xl bg-gradient-to-b from-blue-50 to-white p-6 dark:from-blue-950/30 dark:to-background"
      >
        <div class="rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-[3px]">
          <div class="rounded-full bg-white p-[3px] dark:bg-gray-900">
            <CropperAvatar
              :show-btn="false"
              :upload-api="userUpdateAvatar"
              :value="avatar"
              width="96"
              @change="$emit('uploadFinish')"
            />
          </div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-foreground">
            {{ profile.user.nickName || profile.user.userName || '未知' }}
          </div>
          <div class="mt-0.5 text-xs text-gray-400">
            {{ profile.user.userName }}
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="w-full px-1">
        <Descriptions :column="1" size="small" :items="items" bordered />
      </div>
    </div>
  </Card>
</template>
