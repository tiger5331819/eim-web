<script setup lang="ts">
defineProps<{ digit: string }>()
</script>

<template>
  <Transition name="fade">
    <div class="digit" :key="digit">{{ digit }}</div>
  </Transition>
</template>

<style scoped lang="scss">
.digit {
  position: absolute;
  z-index: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: all .3s linear;
}

.fade-enter-from {
  transform: translate(0, 100%);
}

.fade-leave-to {
  transform: translate(0, -100%);
}
</style>
