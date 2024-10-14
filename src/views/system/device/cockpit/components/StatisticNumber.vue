<script setup lang="ts">
import { formatNumber } from '../utils'
import { computed } from 'vue'
import TransitionDigit from './TransitionDigit.vue'

const props = defineProps<{ number: number }>()

const chars = computed(() => formatNumber(props.number).split(''))
</script>

<template>
  <div class="statistic-number">
    <template v-for="(char, i) in chars" :key="i">
      <span v-if="char === ','">,</span>
      <div v-else class="card">
        <TransitionDigit :digit="char" />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.statistic-number {
  display: flex;
  justify-content: center;
  font-size: 70px;
  line-height: 90px;
  gap: 8px;
}

.card {
  display: flex;
  position: relative;
  width: 70px;
  height: 90px;
  font-size: 70px;
  line-height: 1;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  &::before,
  &::after {
    content: '';
    display: block;
    background: #082671;
    position: absolute;
    width: 100%;
    height: calc(50% - 2px);
    border-radius: 4px;
  }

  &::before {
    top: 0;
  }

  &::after {
    bottom: 0;
  }

  >span {
    position: relative;
    z-index: 1;
  }
}
</style>
