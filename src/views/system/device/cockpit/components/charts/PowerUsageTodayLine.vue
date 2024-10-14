<script setup lang="ts">
import dayjs from 'dayjs'
import 'echarts'
import { type EChartsOption } from 'echarts'
import VChart from 'vue-echarts'

const genData = () => {
  const now = dayjs()
  const items = new Array(24 * 6).fill(0)
  let lastValue: number = Math.ceil((Math.random() * 200)) + 100
  return items.map((_, i) => {
    const time = dayjs().startOf('date').hour(Math.floor(i * 10 / 60)).minute(i * 10 % 60 + 1)
    let value: number | null = null
    if (time.isBefore(now)) {
      value = lastValue
      lastValue = Math.max(50, Math.round(lastValue + Math.random() * 21 - 10))
    }
    return [
      time.format('YYYY-MM-DD HH:mm'),
      value
    ] as [string, number]
  })
}

const option: EChartsOption = {
  backgroundColor: 'transparent',
  xAxis: {
    type: 'time',
  },
  yAxis: {
    type: 'value',
    name: '用电量（kW·h）',

  },
  // grid: {
  //   top: 0,
  //   bottom: 20,
  //   left: 0,
  //   right: 0,
  // },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const value = params[0]?.data?.[1]
      if (typeof value === 'number') {
        return `用电量：${value} kW·h`
      }
      return ''
    }
  },
  series: [
    {
      data: genData(),
      type: 'line',
      showSymbol: false,
      smooth: true
    }
  ]
}
</script>

<template>
  <VChart :option="option" class="chart" theme="dark" autoresize />
</template>

<style scoped>
.chart {
  height: 100%;
}
</style>
