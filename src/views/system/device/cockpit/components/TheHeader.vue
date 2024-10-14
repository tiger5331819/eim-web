<script setup lang="ts">
import { ElButton } from 'element-plus'
import dayjs from 'dayjs'
import screenfull from 'screenfull'
import { ref } from 'vue'

const now = ref(new Date())
setInterval(() => {
  now.value = new Date()
}, 1000)
const isFullscreen = ref(screenfull.isFullscreen)
screenfull.on('change', () => {
  isFullscreen.value = screenfull.isFullscreen
})
const handleClickFullscreen = () => {
  if (screenfull.isEnabled) {
    if (screenfull.isFullscreen) {
      screenfull.exit()
    } else {
      screenfull.request()
    }
  }
}
</script>

<template>
  <header class="header">
    <div class="header__start">
      <time datetime="now">{{ dayjs(now).format('YYYY年M月D日 hh:mm:ss') }}</time>
    </div>

    <h1 class="header__center">裕同集团能耗管理平台</h1>

    <div class="header__end">
      <ElButton v-if="isFullscreen" icon="FullScreen" @click="handleClickFullscreen">退出</ElButton>
      <ElButton v-else icon="FullScreen" @click="handleClickFullscreen">全屏</ElButton>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  gap: 10px;
  padding: 0 10px 14px;
  height: 94px;
  background-image: url('../images/header-bg.png');
  background-position: center;
}

.header__start,
.header__end,
.header__center {
  display: flex;
  align-items: center;
}

.header__start,
.header__end {
  flex: 1;
}

.header__start {
  font-size: 18px;

  &::before {
    content: '';
    display: inline-block;
    margin-right: .5rem;
    width: 1em;
    height: 1em;
    background-image: url('../images/time.png');
    background-size: 100%;
  }
}

.header__end {
  justify-content: end;
}

.header__center {
  font-size: 36px;
  font-weight: bold;
}
</style>
