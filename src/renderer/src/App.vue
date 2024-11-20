<script setup lang="ts">
import { onMounted } from 'vue'

// const remote = require('@electron/remote');
// const path = require('path');

// const osn = window.obs.NodeObs;
// let scene = null

// let obsInitialized = false;

// const OS = {
//   Windows: 'win32',
//   Mac: 'darwin',
// }

// function byOS(handlers) {
//   const handler = handlers[process.platform];

//   if (typeof handler === 'function') return handler();

//   return handler;
// }

// function getOS() {
//   return process.platform
// }


// const appDir = path.join(
//     api.appPath.replace('app.asar', 'app.asar.unpacked'),
//     'node_modules',
//     'obs-studio-node',
//   )

//   console.log(appDir)
// window.obs.NodeObs.IPC.host(`obs-studio-node-example-12323223232`);
// window.obs.NodeObs.SetWorkingDirectory(appDir);

// const apiResult = window.obs.NodeObs.OBS_API_initAPI(
//   'en-US',
//   process.env.APPDATA,
//   process.env.SLOBS_VERSION,
//   true
// )

// const displayId = 'display1';
// let existingWindow = false
// let initY = 0

// function setupPreview(window, bounds) {
//   osn.NodeObs.OBS_content_createSourcePreviewDisplay(
//     window.getNativeWindowHandle(),
//     scene.name, // or use camera source Id here
//     displayId,
//   );
//   osn.NodeObs.OBS_content_setShouldDrawUI(displayId, false);
//   osn.NodeObs.OBS_content_setPaddingSize(displayId, 0);
//   // Match padding color with main window background color
//   osn.NodeObs.OBS_content_setPaddingColor(displayId, 255, 255, 255);

//   return resizePreview(window, bounds);
// }

// async function resizePreview(window, bounds) {
//   let { aspectRatio, scaleFactor } = await displayInfo();
//   if (getOS() === OS.Mac) {
//     scaleFactor = 1
//   }
//   const displayWidth = Math.floor(bounds.width);
//   const displayHeight = Math.round(displayWidth / aspectRatio);
//   const displayX = Math.floor(bounds.x);
//   const displayY = Math.floor(bounds.y);
//   if (initY === 0) {
//     initY = displayY
//   }
//   osn.NodeObs.OBS_content_resizeDisplay(displayId, displayWidth * scaleFactor, displayHeight * scaleFactor);

//   if (getOS() === OS.Mac) {
//     // if (existingWindow) {
//     //   nwr.destroyWindow(displayId);
//     //   nwr.destroyIOSurface(displayId);
//     // }
//     // const surface = osn.NodeObs.OBS_content_createIOSurface(displayId)
//     // nwr.createWindow(
//     //   displayId,
//     //   window.getNativeWindowHandle(),
//     // );
//     // nwr.connectIOSurface(displayId, surface);
//     // nwr.moveWindow(displayId, displayX * scaleFactor, (initY - displayY + initY) * scaleFactor)
//     // existingWindow = true
//   } else {
//     osn.NodeObs.OBS_content_moveDisplay(displayId, displayX * scaleFactor, displayY * scaleFactor);
//   }

//   return { height: displayHeight }
// }

// async function displayInfo() {
//   const primaryDisplay = await window.electron.ipcRenderer.invoke('primaryDisplay');
//   const { width, height } = primaryDisplay.size;
//   const { scaleFactor } = primaryDisplay;
//   return {
//     width,
//     height,
//     scaleFactor:    scaleFactor,
//     aspectRatio:    width / height,
//     physicalWidth:  width * scaleFactor,
//     physicalHeight: height * scaleFactor,
//   }
// }

// async function setupScene() {
//   const videoSource = osn.InputFactory.create(byOS({ [OS.Windows]: 'monitor_capture', [OS.Mac]: 'display_capture' }), 'desktop-video');

//   const { physicalWidth, physicalHeight, aspectRatio } = await displayInfo();

//   // Update source settings:
//   let settings = videoSource.settings;
//   settings['width'] = physicalWidth;
//   settings['height'] = physicalHeight;
//   videoSource.update(settings);
//   videoSource.save();

//   // Set output video size to 1920x1080
//   const outputWidth = 1920;
//   const outputHeight = Math.round(outputWidth / aspectRatio);
//   setSetting('Video', 'Base', `${outputWidth}x${outputHeight}`);
//   setSetting('Video', 'Output', `${outputWidth}x${outputHeight}`);
//   const videoScaleFactor = physicalWidth / outputWidth;

//   // A scene is necessary here to properly scale captured screen size to output video size
//   const scene = osn.SceneFactory.create('test-scene');
//   const sceneItem = scene.add(videoSource);
//   sceneItem.scale = { x: 1.0/ videoScaleFactor, y: 1.0 / videoScaleFactor };

//   // If camera is available, make it 1/3 width of video and place it to right down corner of display
//   const cameraSource = getCameraSource();
//   if (cameraSource) {
//     const cameraItem = scene.add(cameraSource);
//     const cameraScaleFactor = 1.0 / (3.0 * cameraSource.width / outputWidth);
//     cameraItem.scale = { x: cameraScaleFactor, y: cameraScaleFactor };
//     cameraItem.position = {
//       x: outputWidth - cameraSource.width * cameraScaleFactor - outputWidth / 10,
//       y: outputHeight - cameraSource.height * cameraScaleFactor - outputHeight / 10,
//     };
//   }

//   return scene;
// }

// function setSetting(category, parameter, value) {
//   let oldValue;

//   // Getting settings container
//   const settings = osn.NodeObs.OBS_settings_getSettings(category).data;

//   settings.forEach(subCategory => {
//     subCategory.parameters.forEach(param => {
//       if (param.name === parameter) {
//         oldValue = param.currentValue;
//         param.currentValue = value;
//       }
//     });
//   });

//   // Saving updated settings container
//   if (value != oldValue) {
//     osn.NodeObs.OBS_settings_saveSettings(category, settings);
//   }
// }

// function busySleep(sleepDuration) {
//   const now = new Date().getTime();
//   while(new Date().getTime() < now + sleepDuration) { /* do nothing */ };
// }

// function getCameraSource() {
//   console.debug('Trying to set up web camera...')

//   // Setup input without initializing any device just to get list of available ones
//   const dummyInput = byOS({
//     [OS.Windows]: () =>
//       osn.InputFactory.create('dshow_input', 'video', {
//         audio_device_id: 'does_not_exist',
//         video_device_id: 'does_not_exist',
//       }),
//     [OS.Mac]: () =>
//       osn.InputFactory.create('av_capture_input', 'video', {
//         device: 'does_not_exist',
//       })
//   });

//   const cameraItems = dummyInput.properties.get(byOS({ [OS.Windows]: 'video_device_id', [OS.Mac]: 'device' })).details.items;

//   dummyInput.release();

//   if (cameraItems.length === 0) {
//     console.debug('No camera found!!')
//     return null;
//   }

//   const deviceId = cameraItems[0].value;
//   cameraItems[0].selected = true;
//   console.debug('cameraItems[0].name: ' + cameraItems[0].name);

//   const obsCameraInput = byOS({
//     [OS.Windows]: () =>
//       osn.InputFactory.create('dshow_input', 'video', {
//         video_device_id: deviceId,
//       }),
//     [OS.Mac]: () =>
//       osn.InputFactory.create('av_capture_input', 'video', {
//         device: deviceId,
//       }),
//   })

//   // It's a hack to wait a bit until device become initialized (maximum for 1 second)
//   // If you know proper way how to determine whether camera is working and how to subscribe for any events from it, create a pull request
//   // See discussion at https://github.com/Envek/obs-studio-node-example/issues/10
//   for (let i = 1; i <= 4; i++) {
//     if (obsCameraInput.width === 0) {
//       const waitMs = 100 * i;
//       console.debug(`Waiting for ${waitMs}ms until camera get initialized.`);
//       busySleep(waitMs); // We can't use async/await here
//     }
//   }

//   if (obsCameraInput.width === 0) {
//     console.debug(`Found camera "${cameraItems[0].name}" doesn't seem to work as its reported width is still zero.`);
//     return null;
//   }

//   // Way to update settings if needed:
//   // let settings = obsCameraInput.settings;
//   // console.debug('Camera settings:', obsCameraInput.settings);
//   // settings['width'] = 320;
//   // settings['height'] = 240;
//   // obsCameraInput.update(settings);
//   // obsCameraInput.save();

//   return obsCameraInput;
// }

// function initialize(win) {
//   if (obsInitialized) {
//     console.warn("OBS is already initialized, skipping initialization.");
//     return;
//   }

//   initOBS();
//   configureOBS();
//   scene = setupScene();
//   setupSources(scene);
//   obsInitialized = true;

//   const perfStatTimer = setInterval(() => {
// 	  win.webContents.send("performanceStatistics", osn.NodeObs.OBS_API_getPerformanceStatistics());
//   }, 1000);

//   win.on('close', () => clearInterval(perfStatTimer));
// }

onMounted(() => {
  const previewContainer = document.getElementById('preview');
  if (!previewContainer) {
    throw new Error('preview container not found')
  }
  const { width, height, x, y } = previewContainer.getBoundingClientRect();
  window.electron.ipcRenderer.send('initPreview', { width, height, x, y })
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
