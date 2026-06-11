<script setup lang="ts">
import { Card, Statistic } from 'antdv-next';

interface StatItem {
  value: number;
  title: string;
  gradient: string;
}

defineProps<{
  loading?: boolean;
  items: StatItem[];
}>();
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4"
    :class="`md:grid-cols-2 xl:grid-cols-${items.length}`"
  >
    <Card
      v-for="(it, idx) in items"
      :key="idx"
      :body-style="{ padding: '20px 24px' }"
      :loading="loading"
      class="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      :style="{ background: it.gradient, color: '#fff' }"
    >
      <Statistic
        :value="it.value"
        :value-style="{ color: '#fff', fontSize: '28px', fontWeight: 600 }"
      >
        <template #title>
          <span class="text-white/85">{{ it.title }}</span>
        </template>
      </Statistic>
    </Card>
  </div>
</template>
