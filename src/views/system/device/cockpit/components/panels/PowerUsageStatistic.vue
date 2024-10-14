<script setup lang="ts">
import { formatNumber } from '../../utils'
import { onUnmounted, ref } from 'vue'
import StatisticNumber from '../StatisticNumber.vue'
import VPanel from '../VPanel.vue'

const totalValue = ref(245000772)
const todayValue = ref(234)
const yesterdayValue = ref(22231)

let timer: any = null
function next() {
  totalValue.value += 1
  todayValue.value += 1
  timer = setTimeout(next, Math.random() * 1500 + 1000)
}
next()
onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<template>
  <VPanel title="全国用电量">
    <div class="container">
      <StatisticNumber :number="totalValue" />
      <div class="grid">
        <div>今日用电量：{{ formatNumber(todayValue) }}</div>
        <div>昨日用电量：{{ formatNumber(yesterdayValue) }}</div>
      </div>
    </div>
  </VPanel>
</template>

<style scoped lang="scss">
.container {
  position: relative;
  height: 100%;
}

.grid {
  display: grid;
  grid-template-columns: 30% 30%;
  margin-top: 8px;
  text-align: center;
}
</style>
