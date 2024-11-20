<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const previewContainer = document.getElementById('preview');
  if (!previewContainer) {
    throw new Error('preview container not found')
  }
  // const { width, height, x, y } = previewContainer.getBoundingClientRect();
  // window.electron.ipcRenderer.send('initPreview', { width, height, x, y })
  // initOBS()
})
</script>

<template>
  <!-- <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
  </div>
  <Versions /> -->
  <h1>Main App</h1>
  <div id="preview" />
</template>

<style lang="css" scoped>
#preview {
  width: 500px;
  height: 300px;
  border: 1px darkgreen dashed;
  background-color: bisque;
}
</style>
