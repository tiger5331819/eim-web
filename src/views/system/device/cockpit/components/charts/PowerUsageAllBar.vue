<script setup lang="ts">
import dayjs from 'dayjs'
import 'echarts'
import type { EChartsOption } from 'echarts'
import VChart from 'vue-echarts'

const genData = () => {
  const data: [string, number][] = []
  const now = dayjs()
  let currentDate = dayjs().year(2020).startOf('year')
  let lastValue: number = Math.ceil((Math.random() * 200)) + 100
  while (currentDate.isBefore(now)) {
    data.push([
      currentDate.format('YYYY-MM'),
      lastValue
    ])
    lastValue = Math.max(50, Math.round(lastValue + Math.random() * 21 - 10))
    currentDate = currentDate.add(1, 'month')
  }
  return data
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
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      const [time, value] = params.data
      return `${dayjs(time).format('YYYY年M月')}<br />用电量：${value} kW·h`
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 80,
      end: 100
    },
    {
      start: 80,
      end: 100
    }
  ],
  // grid: {
  //   top: 0,
  //   bottom: 20,
  //   left: 0,
  //   right: 0,
  // },
  series: [
    {
      data: genData(),
      type: 'bar',
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
