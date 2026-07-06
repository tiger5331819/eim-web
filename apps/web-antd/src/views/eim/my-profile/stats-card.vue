<script setup lang="ts">
import { VbenIcon } from '@vben/icons';

import { Card, Skeleton } from 'antdv-next';

interface StatItem {
  value: number | string;
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

defineProps<{
  loading?: boolean;
  items: StatItem[];
}>();
</script>

<template>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <Card
      v-for="(it, idx) in items"
      :key="idx"
      :styles="{ body: { padding: '16px 20px' } }"
      class="border-border/60 shadow-none transition-shadow hover:shadow-sm"
    >
      <div v-if="loading" class="flex items-center gap-4">
        <Skeleton.Avatar :active="true" shape="square" size="large" />
        <div class="flex-1">
          <Skeleton :active="true" :paragraph="false" :title="{ width: '40%' }" />
          <Skeleton
            :active="true"
            :paragraph="false"
            :title="{ width: '30%' }"
            class="mt-2"
          />
        </div>
      </div>
      <div v-else class="flex items-center gap-4">
        <div
          class="flex size-11 shrink-0 items-center justify-center rounded-lg"
          :class="it.iconBg"
        >
          <VbenIcon :icon="it.icon" :class="['size-5', it.iconColor]" />
        </div>
        <div class="min-w-0">
          <div class="text-foreground/65 text-sm">{{ it.title }}</div>
          <div class="text-2xl leading-tight font-semibold tracking-tight">
            {{ it.value }}
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
