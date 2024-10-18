<template>
  <div class="home">
    <div>
      <h2>您好，{{ nickname }}！</h2>
      <p style="font-size: 20px; color: #909399;">欢迎您进入eSIM IOT系统，请开启您的使用之旅吧！</p>
    </div>
    <img class="compute-img" src="@/assets/images/home.png" alt="" style="">

  </div>
</template>

<script setup name="Index" lang="ts">
import useUserStore from '@/store/modules/user';


const { nickname } = useUserStore()




</script>

<style scoped lang="scss">
.home {
  width: 100% !important;
  min-height: calc(100vh - 105px) !important;
  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background: url("@/assets/images/home-bg.png") no-repeat;
  background-size: 100% 100%;
  position: relative;
  padding: 20px;
  box-sizing: border-box;

  .compute-img {
    width: 600px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

}
</style>
