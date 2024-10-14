<script setup lang="ts">
defineProps<{
  title: string
  extra?: string
}>()
</script>

<template>
  <section class="panel">
    <h2 class="panel__header">
      {{ title }}
      <span class="panel__header__extra">
        <slot name="extra">{{ extra }}</slot>
      </span>
    </h2>
    <div class="panel__body">
      <slot></slot>
    </div>
  </section>
</template>

<style scoped lang="scss">
.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  margin: 0;
  padding: 16px;
  background: rgba(125, 155, 243, 0.1);
  border: 1px solid;
  border-image: linear-gradient(180deg, rgba(100, 218, 255, .7), rgba(48, 205, 255, 0.15) 100%) 1 1;
}

.panel__header {
  display: flex;
  margin: 0 0 16px;
  font-size: 18px;
  line-height: 24px;

  &::before {
    display: inline-block;
    content: '';
    margin-right: .5rem;
    width: 18px;
    height: 18px;
    background-image: url('../images/title.png');
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
  }
}

.panel__header__extra {
  flex: 1;
  text-align: right;
  font-size: 14px;
  font-weight: 400;
}

.panel__body {
  flex: 1;
  overflow: hidden;
}
</style>
