<script setup lang="ts">
import { VbenIcon } from '@vben/icons';

import { Card, Skeleton } from 'antdv-next';

interface OverviewItem {
  title: string;
  value: number | string;
  icon: string;
  iconBg: string;
  iconColor: string;
  valueClass?: string;
  small?: boolean;
}

defineProps<{
  loading?: boolean;
  items: OverviewItem[];
}>();
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
    <Card
      v-for="(it, idx) in items"
      :key="idx"
      :styles="{ body: { padding: '16px 20px' } }"
      class="border-border/60 shadow-none"
    >
      <div v-if="loading" class="flex items-center gap-3">
        <Skeleton.Avatar :active="true" shape="square" size="large" />
        <div class="flex-1">
          <Skeleton :active="true" :paragraph="false" :title="{ width: '50%' }" />
          <Skeleton
            :active="true"
            :paragraph="false"
            :title="{ width: '35%' }"
            class="mt-2"
          />
        </div>
      </div>
      <div v-else class="flex items-center gap-3">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-lg"
          :class="it.iconBg"
        >
          <VbenIcon :icon="it.icon" :class="['size-5', it.iconColor]" />
        </div>
        <div class="min-w-0">
          <div class="text-foreground/65 text-sm">{{ it.title }}</div>
          <div
            class="font-semibold tracking-tight"
            :class="[
              it.small ? 'text-sm leading-snug' : 'text-2xl leading-tight',
              it.valueClass,
            ]"
          >
            {{ it.value }}
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
