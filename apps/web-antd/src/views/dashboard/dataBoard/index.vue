<script setup lang="ts">
import { Page } from '@vben/common-ui';

import homeBg from '#/assets/images/home.png';

defineOptions({ name: 'EimDashboard' });
</script>

<template>
  <Page :auto-content-height="true" content-class="!p-0">
    <div
      class="data-board-welcome h-full w-full rounded-xl bg-contain bg-center bg-no-repeat"
      :style="{ backgroundImage: `url(${homeBg})` }"
    >
      <div class="flex h-full flex-col justify-start px-8 pt-16 md:px-16 md:pt-24">
        <h1 class="mb-3 text-3xl font-semibold text-[#333333] md:text-4xl">
          您好
        </h1>
        <p class="max-w-xl text-lg text-[#666666] md:text-xl">
          欢迎您进入eSIM IOT平台，请开启您的使用之旅吧！
        </p>
      </div>
    </div>
  </Page>
</template>
