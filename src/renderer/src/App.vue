<script setup lang="ts">
import Display from './Display.vue'
</script>

<template>
  <h1>Electron OBS APP</h1>
  <Display />
  <div id="apis">
    <button>添加图片</button>
    <button>添加桌面捕捉</button>
    <button>添加摄像头</button>
    <button>添加文字</button>
  </div>
</template>

<style>
#apis{
  padding-top: 100px;
  button{
    margin-right: 10px;
  }
}
</style>
