<script setup lang="ts">

import { v4 } from 'uuid';
import { onMounted } from 'vue'

const { ipcRenderer } = require('electron');
const remote = require("@electron/remote")
const path = require('path');
const osn = require('obs-studio-node')

const displayId = v4();

function setSetting(category, parameter, value) {
  let oldValue;

  // Getting settings container
  const settings = osn.NodeObs.OBS_settings_getSettings(category).data;

  settings.forEach(subCategory => {
    subCategory.parameters.forEach(param => {
      if (param.name === parameter) {
        oldValue = param.currentValue;
        param.currentValue = value;
      }
    });
  });

  // Saving updated settings container
  if (value != oldValue) {
    osn.NodeObs.OBS_settings_saveSettings(category, settings);
  }
}

function getAvailableValues(category, subcategory, parameter) {
  const categorySettings = osn.NodeObs.OBS_settings_getSettings(category).data;
  if (!categorySettings) {
    console.warn(`There is no category ${category} in OBS settings`);
    return [];
  }

  const subcategorySettings = categorySettings.find(sub => sub.nameSubCategory === subcategory);
  if (!subcategorySettings) {
    console.warn(`There is no subcategory ${subcategory} for OBS settings category ${category}`);
    return [];
  }

  const parameterSettings = subcategorySettings.parameters.find(param => param.name === parameter);
  if (!parameterSettings) {
    console.warn(`There is no parameter ${parameter} for OBS settings category ${category}.${subcategory}`);
    return [];
  }

  return parameterSettings.values.map( value => Object.values(value)[0]);
}

function displayInfo() {
  const primaryDisplay = remote.screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const { scaleFactor } = primaryDisplay;
  return {
    width,
    height,
    scaleFactor:    scaleFactor,
    aspectRatio:    width / height,
    physicalWidth:  width * scaleFactor,
    physicalHeight: height * scaleFactor,
  }
}

function initOBS (win) {
  osn.IPC.host(`${v4()}`);
  const obsPakagePath = path.join(remote.app.getAppPath(), 'node_modules', 'obs-studio-node');
  console.log(obsPakagePath)
  osn.NodeObs.SetWorkingDirectory(obsPakagePath);
  const obsDataPath = path.join(remote.app.getAppPath(), 'osn-data');
  console.log(obsDataPath)
  const initResult = osn.NodeObs.OBS_API_initAPI('en-US', obsDataPath, '1.0.0', '');
  console.log('initbosx...', initResult === 0 ? 'success' : 'error')
  configureOBS()
  createDisplay(win)
}

function configureOBS() {
  console.debug('Configuring OBS');
  setSetting('Output', 'Mode', 'Advanced');
  setSetting('Output', 'VBitrate', 10000); // 10 Mbps
  setSetting('Video', 'FPSCommon', 60);
  console.log('OBS Configured');
}



function createSceneAndSource() {
  const videoSource = osn.InputFactory.create('monitor_capture', 'desktop-video');

  const { physicalWidth, physicalHeight, aspectRatio } = displayInfo();

  console.log(displayInfo())

  // Update source settings:
  const settings = videoSource.settings;
  settings['width'] = physicalWidth;
  settings['height'] = physicalHeight;
  videoSource.update(settings);
  videoSource.save();

  // Set output video size to 1920x1080
  const outputWidth = 1920;
  const outputHeight = Math.round(outputWidth / aspectRatio);
  setSetting('Video', 'Base', `${outputWidth}x${outputHeight}`);
  setSetting('Video', 'Output', `${outputWidth}x${outputHeight}`);
  const videoScaleFactor = physicalWidth / outputWidth;

  // A scene is necessary here to properly scale captured screen size to output video size
  const scene = osn.SceneFactory.create('test-scene');
  const sceneItem = scene.add(videoSource);
  sceneItem.scale = { x: 1.0/ videoScaleFactor, y: 1.0 / videoScaleFactor };
  return scene
}

function createDisplay(window) {
  // const scene = createSceneAndSource();

  // console.log(scene, 'scene')
  const context = osn.VideoFactory.create()
  // console.log(context, context.video, remote.getCurrentWindow().getNativeWindowHandle())

  console.log(JSON.stringify(context.video))
  // const res = osn.NodeObs.OBS_content_createSourcePreviewDisplay(
  //   window.getNativeWindowHandle(),
  //   scene.name, // or use camera source Id here
  //   displayId,
  //   // false,
  //   // context,
  // );


  osn.NodeObs.OBS_content_createDisplay(
  window.getNativeWindowHandle(),
      displayId,
      0,
      false,
      context,
  );

  osn.NodeObs.OBS_content_setShouldDrawUI(displayId, true);
  osn.NodeObs.OBS_content_setPaddingSize(displayId, 100);
  // Match padding color with main window background color
  osn.NodeObs.OBS_content_setPaddingColor(displayId, 255, 255, 255);
  osn.NodeObs.OBS_content_resizeDisplay(displayId, 1000, 800);


  osn.NodeObs.OBS_content_moveDisplay(displayId, 100, 300);
  console.log('display render over here')
}

onMounted(() => {
  const previewContainer = document.getElementById('preview');
  if (!previewContainer) {
    throw new Error('preview container not found')
  }
  // const { width, height, x, y } = previewContainer.getBoundingClientRect();
  // window.electron.ipcRenderer.send('initPreview', { width, height, x, y })
  ipcRenderer.on('winId', (_, id) => {
    initOBS(remote.BrowserWindow.fromId(id));
  })

})
</script>

<template>
  <h1>Worker</h1>
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
  <div id="preview" />
</template>
