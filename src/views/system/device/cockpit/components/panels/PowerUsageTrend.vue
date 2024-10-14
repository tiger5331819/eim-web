<script setup lang="ts">
import { ElButton } from 'element-plus'
import { ref } from 'vue'
import PowerUsageAllBar from '../charts/PowerUsageAllBar.vue'
import PowerUsageTodayLine from '../charts/PowerUsageTodayLine.vue'
import VPanel from '../VPanel.vue'

const activeKey = ref('1')
</script>

<template>
  <VPanel title="用电量统计">
    <div class="flex">
      <div class="btn-group">
        <ElButton :type="activeKey === '1' ? 'primary' : 'default'" size="small" @click="activeKey = '1'">当日用电</ElButton>
        <ElButton :type="activeKey === '2' ? 'primary' : 'default'" size="small" @click="activeKey = '2'">历史用电</ElButton>
      </div>
      <div class="flex-1">
        <Transition name="slide">
          <div v-if="activeKey === '1'" key="1" class="flex">
            <h3 class="chart-title">当日用电量统计</h3>
            <div class="flex-1">
              <PowerUsageTodayLine />
            </div>
          </div>
          <div v-else-if="activeKey === '2'" key="2" class="flex flex-1">
            <h3 class="chart-title">历史用电量统计</h3>
            <div class="flex-1">
              <PowerUsageAllBar />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </VPanel>
</template>

<style scoped lang="scss">
.btn-group {
  display: flex;
  justify-content: center;
}

.chart-title {
  margin: 0;
  border-bottom: 1px solid #ffffff99;
  padding: .75em 2em;
  font-size: 1rem;
}

.flex {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex-1 {
  flex: 1;
}

/* 1. 声明过渡效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. 声明进入和离开的状态 */
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from {
  transform: translate(100%, 0);
}

.slide-leave-to {
  transform: translate(-100%, 0);
}

/* 3. 确保离开的项目被移除出了布局流
      以便正确地计算移动时的动画效果。 */
.slide-leave-active {
  position: absolute;
}
</style>
