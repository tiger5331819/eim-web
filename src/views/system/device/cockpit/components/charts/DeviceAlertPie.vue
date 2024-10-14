<script setup lang="ts">
import 'echarts'
import type { EChartsOption } from 'echarts'
import VChart from 'vue-echarts'
const option: EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    top: 'center',
    right: 10,
    width: 50,
    formatter: function (name) {
      const data: any[] = (option as any).series[0].data
      const total = data.reduce((sum, item) => sum + item.value, 0)
      const item = data.find((item) => item.name === name)
      const percentage = ((item.value / total) * 100).toFixed(2)
      return [`${name}  {c|占比}`, `{a|${item.value}}  {b| ${percentage}%}`].join('\n')
    },
    textStyle: {
      padding: [20, 0, 0, 0],
      fontSize: 12,
      fontWeight: 'bold',
      rich: {
        a: {
          fontWeight: 'bold',
          color: '#5fd2da',
          height: 20,
        },
        b: {
          fontWeight: 'bold',
          color: '#5fd2da',
          align: 'right',
          height: 20
        },
        c: {
          align: 'right',
        }
      },
    },
  },
  series: [
    {
      name: '告警数量',
      type: 'pie',
      radius: [30, 70],
      center: ['35%', '50%'],
      roseType: 'radius',
      label: {
        show: false
      },
      itemStyle: {
        borderRadius: 5
      },
      emphasis: {
        label: {
          show: true
        }
      },
      data: [
        { value: 40, name: '高' },
        { value: 33, name: '中' },
        { value: 28, name: '低' },
      ]
    },
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
