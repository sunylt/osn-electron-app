import { v4 } from 'uuid';

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

export function displayInfo() {
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

export function initOBS () {
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

export function configureOBS() {
  // console.debug('Configuring OBS');
  // setSetting('Output', 'Mode', 'Advanced');
  // setSetting('Output', 'VBitrate', 10000); // 10 Mbps
  // setSetting('Video', 'FPSCommon', 60);
  // console.log('OBS Configured');
}

export function getScreenResource() {
  const resource = osn.InputFactory.create('monitor_capture', 'desktop-capture');
  const { physicalWidth, physicalHeight } = displayInfo();

  // Update source settings:
  const settings = resource.settings;
  settings['width'] = physicalWidth;
  settings['height'] = physicalHeight;
  resource.update(settings);
  resource.save();

  return resource
}


export function createDisplay(window, bounds) {
  
  const context = osn.VideoFactory.create()
  context.video = {
      fpsNum: 30,
      fpsDen: 1,
      baseWidth: 1280,
      baseHeight: 720,
      outputWidth: 1280,
      outputHeight: 720,
      outputFormat: 11,
  };

  const scene = osn.SceneFactory.create('scene1')
  const screenResource = getScreenResource()
  scene.add(screenResource)
  // const defaultTransition = osn.TransitionFactory.create('cut_transition', "test_transition_a");

  // defaultTransition.set(scene);
  // osn.Global.setOutputSource(0, defaultTransition);

  osn.NodeObs.OBS_content_createSourcePreviewDisplay(
    window.getNativeWindowHandle(),
    scene.name,
    displayId,
    false,
    context,
  );

  osn.NodeObs.OBS_content_setShouldDrawUI(displayId, true)
  osn.NodeObs.OBS_content_setPaddingSize(displayId, 0)
  osn.NodeObs.OBS_content_setPaddingColor(displayId, 255, 255, 255)
  const {aspectRatio, scaleFactor} = displayInfo()

  const displayWidth = Math.floor(bounds.width)
  const displayHeight = Math.round(displayWidth / aspectRatio)
  const displayX = Math.floor(bounds.x)
  const displayY = Math.floor(bounds.y)

  osn.NodeObs.OBS_content_resizeDisplay(displayId, displayWidth * scaleFactor, displayHeight * scaleFactor)
  osn.NodeObs.OBS_content_moveDisplay(displayId, displayX * scaleFactor, displayY * scaleFactor+20)
}