<script setup lang="ts">
import { type StyleValue } from 'vue'
import { Vue3Marquee } from 'vue3-marquee'

interface Column {
  title: string
  dataIndex: string
  style?: StyleValue
}

defineProps<{
  columns: Column[];
  data: any[];
}>()
</script>

<template>
  <div class="table-wrap">
    <table cellspacing="0" cellpadding="0">
      <thead>
        <th v-for="col in columns" :key="col.dataIndex">{{ col.title }}</th>
      </thead>
    </table>
    <Vue3Marquee :pauseOnHover="true" speed="50" vertical style="width: 100%;">
      <table cellspacing="0" cellpadding="0">
        <tbody>
          <tr v-for="(item, i) in data" :key="i">
            <td v-for="col in columns" :key="col.dataIndex" :style="col.style">{{ item[col.dataIndex] }}</td>
          </tr>
        </tbody>
      </table>
    </Vue3Marquee>
  </div>
</template>

<style scoped lang="scss">
.table-wrap {
  height: 100%;
  overflow: hidden;
}

table {
  width: 100%;
  max-height: 100%;
  text-align: center;
  table-layout: fixed;
}

thead {
  color: #fff;
  background: #1e408a;
}

tr:nth-child(2n+1) {
  background: #24365e7a;
}

th,
td {
  padding: 4px;
}
</style>
