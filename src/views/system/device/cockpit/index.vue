<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import VPanel from './components/VPanel.vue'

import DeviceAlertPie from './components/charts/DeviceAlertPie.vue'
import PowerTypePie from './components/charts/PowerTypePie.vue'

import DeviceAlertTable from './components/tables/DeviceAlert.vue'
import SystemAlertTable from './components/tables/SystemAlert.vue'

import PowerUsageRegionPanel from './components/panels/PowerUsageRegion.vue'
import PowerUsageStatisticPanel from './components/panels/PowerUsageStatistic.vue'
import PowerUsageTrendPanel from './components/panels/PowerUsageTrend.vue'
</script>

<template>
  <div class="full-container">
    <TheHeader />
    <main class="flex-1 panel-layout">
      <div class="panel-layout__col" style="grid-template-rows: 55%;">
        <PowerUsageTrendPanel />
        <VPanel title="各类用电量占比">
          <PowerTypePie />
        </VPanel>
      </div>
      <div class="panel-layout__col" style="grid-template-rows: 195px;">
        <PowerUsageStatisticPanel />
        <PowerUsageRegionPanel />
      </div>
      <div class="panel-layout__col" style="grid-template-rows: 30% 30%;">
        <VPanel title="设备告警数据">
          <DeviceAlertPie />
        </VPanel>
        <VPanel title="设备告警信息" extra="24小时内">
          <DeviceAlertTable />
        </VPanel>
        <VPanel title="系统告警" extra="24小时内">
          <SystemAlertTable />
        </VPanel>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
$gap: 16px;

.full-container {
  display: flex;
  flex-direction: column;
  background-color: #000;
  color: #fff;
  width: 100vw;
  height: 100vh;
  min-width: 1280px;
  min-height: 720px;
}

.panel-layout {
  padding: $gap;
  display: grid;
  grid-template-columns: 5fr 8fr 4fr;
  gap: $gap;
  overflow: hidden;
}

.panel-layout__col {
  display: grid;
  gap: $gap;
  overflow: hidden;
}

.flex-1 {
  flex: 1;
  overflow: hidden;
}
</style>
