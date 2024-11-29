<script setup lang="ts">

import { v4 } from 'uuid';
import { onMounted, ref } from 'vue'

const { ipcRenderer } = require('electron');
const remote = require("@electron/remote")
const path = require('path');
const osn = require('obs-studio-node')

const displayId = v4();
const sceneItems = ref<string[]>([])

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

function initOBSClient () {
  osn.IPC.host(`${v4()}`);
  const obsPakagePath = path.join(remote.app.getAppPath(), 'node_modules', 'obs-studio-node');
  console.log(obsPakagePath)
  osn.NodeObs.SetWorkingDirectory(obsPakagePath);
  const obsDataPath = path.join(remote.app.getAppPath(), 'osn-data');
  console.log(obsDataPath)
  const initResult = osn.NodeObs.OBS_API_initAPI('en-US', obsDataPath, '1.0.0', '');
  console.log('initbosx...', initResult === 0 ? 'success' : 'error')
  configureOBS()
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

  const appPath = remote.app.getAppPath();
  const imageSource = osn.InputFactory.create('image_source', '112312-1231', {
    file: path.resolve(appPath, 'resources/icon.png'),
  }); 
  const imageSettings = imageSource.settings;
  imageSettings['width'] = 1000;
  imageSettings['height'] = 1000;
  imageSource.update(imageSettings);
  imageSource.save()

  // console.log(item)

  const imageItem = scene.add(imageSource)
  imageItem.scale = {x: 0.3, y: 0.3};
  imageItem.position = { x: 1100, y: 20 };
// console.log(imageItem, 'xxx')

  return scene
}

function createDisplay(window, bounds) {
  try{
  const scene = createSceneAndSource();

console.log(scene.getItems())
  scene.getItems().forEach(item => sceneItems.value.push(item.id))

  // console.log(scene, 'scene')
  const context = osn.VideoFactory.create()
  // console.log(context, context.video, remote.getCurrentWindow().getNativeWindowHandle())


  console.log(context)
  context.video = {
    fpsNum: 30,
    fpsDen: 1,
    baseWidth: 1280,
    baseHeight: 720,
    outputWidth: 1280,
    outputHeight: 720,
    outputFormat: 11,
  };

  // 采用createDisplay必备
  const defaultTransition = osn.TransitionFactory.create('cut_transition', "test_transition_a");

  defaultTransition.set(scene);
  osn.Global.setOutputSource(0, defaultTransition);

  // osn.NodeObs.OBS_content_createSourcePreviewDisplay(
  //   window.getNativeWindowHandle(),
  //   scene.name,
  //   displayId,
  //   false,
  //   context,
  // );

  osn.NodeObs.OBS_content_createDisplay(
    window.getNativeWindowHandle(),
    displayId,
    0,
    false,
    context,
  );

  osn.NodeObs.OBS_content_setShouldDrawUI(displayId, true);
  osn.NodeObs.OBS_content_setPaddingSize(displayId, 0);
  osn.NodeObs.OBS_content_setPaddingColor(displayId, 255, 255, 255);
  const {aspectRatio, scaleFactor} = displayInfo();

  const displayWidth = Math.floor(bounds.width);
  const displayHeight = Math.round(displayWidth / aspectRatio);
  const displayX = Math.floor(bounds.x);
  const displayY = Math.floor(bounds.y);

  osn.NodeObs.OBS_content_resizeDisplay(displayId, displayWidth * scaleFactor, displayHeight * scaleFactor);
  osn.NodeObs.OBS_content_moveDisplay(displayId, displayX * scaleFactor, displayY * scaleFactor);
} catch(e) {
  console.log('display render over here')
}

}

onMounted(() => {
  const previewContainer = document.getElementById('preview');
  if (!previewContainer) {
    throw new Error('preview container not found')
  }

  const {width, height, x, y} = previewContainer.getBoundingClientRect();
    console.log({width, height, x, y});


  initOBSClient();
  createDisplay(remote.getCurrentWindow(), {
    width, height, x, y
  });

})
</script>

<template>
  <div id="container">
    <div id="scene">
      <ul>
        <li
          v-for="(item, index) in sceneItems" 
          :key="index"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <div id="preview" />
  </div>
</template>

<style>
#preview {
  width: 500px;
  height: 300px;
  border: 2px darkgreen dashed;
}
</style>
