<template>
  <div class="p-5">
    <el-tabs v-model="activeLabel" type="border-card" style="width: 100%; height: 85vh; position: relative;">
      <el-tab-pane label="基本信息" name="first">
        <Basic />
      </el-tab-pane>
      <el-tab-pane label="运营信息" name="second">
        <Operation />
      </el-tab-pane>
      <el-tab-pane label="EIM LIST" name="third">
        <Eim />
      </el-tab-pane>
    </el-tabs>
    <el-button link type="primary" icon="Back" style="width: 100px; height: 40px; position: absolute; right: 20px; top: 20px;" @click="backTo">返回</el-button>
  </div>
</template>
<script setup name="In" lang="ts">
import { ref } from "vue"
import Basic from "./module/basic.vue"
import Operation from "./module/operation.vue"
import Eim from "./module/eim.vue"

const activeLabel = ref('first')
const router = useRouter();

const backTo = () => {
  // router.push({
  //   path: "/device",
  // });
  router.go(-1)
}

</script>
