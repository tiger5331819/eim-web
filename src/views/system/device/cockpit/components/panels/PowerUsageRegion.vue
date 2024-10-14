<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'
import { ElButton } from 'element-plus'
import { computed, onBeforeMount, ref, shallowRef } from 'vue'
import VChart from 'vue-echarts'
import { formatNumber } from '../../utils'
import VPanel from '../VPanel.vue'

const dataCache = Object.create(null)

const option = shallowRef<EChartsOption>({})

const ROOT_MAP = 'china'

const mapPath = ref([ROOT_MAP])

const currentMap = computed(() => mapPath.value[mapPath.value.length - 1])

function genData(name: string) {
  const MAX = Math.pow(10, 8 - mapPath.value.length)
  if (!dataCache[name]) {
    const geo = echarts.getMap(name).geoJSON
    const heatmap = geo.features.map((item: any) => {
      return {
        name: item.properties.name,
        value: Math.random() * MAX
      }
    })
    const top = heatmap.sort((a, b) => a.value - b.value).slice(0, 5)
    if (name === ROOT_MAP) {
      ['华东', '华南', '华北', '西南'].forEach((name, i) => {
        top[i].name = name
      })
      top.length = 4
    }
    dataCache[name] = {
      MAX,
      heatmap,
      top
    }
  }
  return dataCache[name]
}

async function registerChinaData() {
  const res = await fetch('https://geo.datav.aliyun.com/areas_v2/bound/100000_full.json', {})
  if (!res.ok) {
    throw new Error('地图数据获取失败')
  }
  const geo = await res.json()
  geo.features.find((item: any) => item.properties.name === '海南省').geometry.coordinates.length = 1
  const index = geo.features.findIndex((item: any) => item.properties.adcode == '100000')
  geo.features.splice(index, 1)
  echarts.registerMap(ROOT_MAP, geo)
}
function getAdcodeByName(name: string) {
  const currentMapData: any[] = echarts.getMap(currentMap.value).geoJSON.features
  const { properties: { adcode } } = currentMapData.find(item => item.properties.name === name)
  return adcode
}
async function getDataByName(name: string) {
  const adcode = getAdcodeByName(name)
  const res = await fetch(`https://geo.datav.aliyun.com/areas_v2/bound/${adcode}_full.json`, {})
  if (!res.ok) {
    throw new Error('地图数据获取失败')
  }
  return await res.json()
}

async function registerMap(name: string) {
  if (echarts.getMap(name)) {
    return
  }
  echarts.registerMap(name, await getDataByName(name))
}

const topData = ref([] as any[])

onBeforeMount(async () => {
  await registerChinaData()
  const {
    heatmap,
    top,
    MAX
  } = genData(ROOT_MAP)
  option.value = {
    backgroundColor: 'transparent',
    visualMap: {
      show: false,
      min: MAX / 10,
      max: MAX,
      text: ['High', 'Low'],
      realtime: false,
      calculable: true,
      inRange: {
        color: ['lightskyblue', 'blueviolet', 'darkmagenta']
      }
    },
    series: [
      {
        type: 'map',
        map: ROOT_MAP,
        label: {
          show: true,
          color: '#fff'
        },
        layoutCenter: ['50%', '50%'],
        layoutSize: '100%',
        selectedMode: false,
        itemStyle: {
          areaColor: 'lightskyblue',
        },
        data: heatmap
      },
    ]
  }
  topData.value = top
})

const chart = ref<any>(null)
const isParkShown = ref(false)
const handleMapClick = async (params: any) => {
  const { name } = params
  if (name !== currentMap.value) {
    try {
      await registerMap(name)
      mapPath.value.push(name)
      return
    } catch {
      //
    }
  }
  isParkShown.value = true
  mapPath.value.push(`${name}科技园区`)
}
const handleBack = async () => {
  if (isParkShown.value) {
    isParkShown.value = false
  }
  mapPath.value.pop()
}
watch(() => currentMap.value, async (mapName) => {
  if (isParkShown.value) {
    topData.value = [
      {
        name: 'A栋',
        value: 7350
      },
      {
        name: 'B栋',
        value: 8575
      },
      {
        name: 'C栋',
        value: 4900
      },
      {
        name: 'D栋',
        value: 3675
      },
      {
        name: 'E栋',
        value: 5516
      }
    ]
    return
  }
  const {
    heatmap,
    top,
    MAX,
  } = genData(mapName)
  chart.value.setOption({
    visualMap: {
      min: MAX / 10,
      max: MAX,
    },
    series: [
      {
        map: mapName,
        data: heatmap
      },
    ]
  })
  topData.value = top
})
</script>

<template>
  <VPanel :title="currentMap === 'china' ? '全国' : currentMap">
    <template v-if="mapPath.length > 1" #extra>
      <ElButton icon="Back" size="small" @click="handleBack">后退</ElButton>
    </template>
    <div class="container">
      <VChart ref="chart" :option="option" class="chart" theme="dark" @click="handleMapClick" autoresize />
      <img v-show="isParkShown" src="../../images/park.jpg" class="park" alt="" />
      <div class="legend">
        <div v-for="item in topData" :key="item.name">
          {{ item.name }}：<strong class="value">{{ formatNumber(item.value) }}</strong> kW·h
        </div>
      </div>
    </div>
  </VPanel>
</template>

<style scoped lang="scss">
.chart {
  height: 100%;
}

.back {
  position: absolute;
  top: 0;
  left: 0;
}

.container {
  position: relative;
  height: 100%;
}

.legend {
  position: absolute;
  left: 10px;
  bottom: 10px;
}

.value {
  color: #5050E1;
}

.park {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-height: 100%;
  object-fit: cover;
}
</style>
