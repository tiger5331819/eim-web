<script setup lang="ts">
import AutoScrollTable from '../AutoScrollTable.vue'
import { ref } from 'vue'

const columns = ref([
  {
    title: '设备',
    dataIndex: 'name',
  },
  {
    title: '告警信息',
    dataIndex: 'message',
    style: {
      color: 'red'
    },
  },
])

function padZero(n: number, len: number) {
  const str = String(n)
  if (str.length < len) {
    return '0'.repeat(len - str.length) + str
  }
  return str
}

function genData() {
  const list = new Array(10).fill(0)
  let cur = 0
  return list.map(() => {
    cur += Math.ceil(Math.random() * 10)
    return {
      name: `A-07-${padZero(cur, 4)}电表`,
      message: Math.random() > 0.5 ? '通信异常' : '设备关闭',
    }
  })
}

const data = ref(genData())
</script>

<template>
  <AutoScrollTable :columns="columns" :data="data" />
</template>

<style scoped></style>
