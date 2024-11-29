# StreamLabs obs-studio-node 开发集成文档

## 一、基本概念

### OBS
OBS（Open Broadcaster Software）是一款免费且开源的音视频录制及直播软件。它最初是为了游戏直播而设计，但现在已被广泛应用于各种类型的视频流媒体和屏幕录制中。OBS支持Windows、MacOS和Linux操作系统。

以下是OBS的一些主要特点和功能：

1. 多平台支持：如前所述，OBS可以在多个主流操作系统上运行，这使得它成为跨平台使用的理想选择。
2. 高度可定制性：用户可以通过添加插件来扩展OBS的功能，这些插件可以用来改善视频质量、增加特效等。
3. 场景和源管理：OBS允许用户创建多个“场景”，每个场景可以包含不同的视频元素（称为“源”），比如摄像头画面、游戏画面、图片、文本、浏览器窗口等。这种灵活性让用户能够轻松地切换不同内容或布局。
4. 高质量输出：OBS支持多种编码器，包括硬件加速编码，以确保在低延迟下提供高质量的视频流。
5. 直播到多个平台：通过简单的设置，用户可以将内容同时直播到多个平台，如Twitch、YouTube Live、Facebook Live等。
6. 音频混合：OBS具有强大的音频处理能力，可以同时管理多个音频输入和输出，调整音量，应用滤镜等。
7. 虚拟摄像头：OBS还可以作为虚拟摄像头使用，将任何场景输出为视频信号给其他应用程序使用。
8. 脚本支持：高级用户可以利用OBS的API编写脚本来自动化任务或创建互动功能。
9. 社区支持：OBS拥有一个活跃的开发者和用户社区，提供了大量的教程、文档和支持资源。


对于希望进行专业级直播或视频制作的人来说，OBS是一个非常有价值的工具。无论是个人还是小型团队，都能从中受益匪浅。如果你对音视频编辑或直播感兴趣，尝试使用OBS会是一个不错的选择。

### Streamlabs 跟 desktop

* [关于streamlabs]()
* [streamlabs-desktop]()

Streamlabs 是一个专门为直播者设计的平台，它提供了一系列工具和服务来帮助直播者更高效地管理和提升他们的直播体验。Streamlabs 最初是 OBS Studio 的一个插件，后来发展成为一个独立的品牌，但仍与 OBS 保持着紧密的联系。以下是 Streamlabs 提供的一些主要功能和服务：

OBS 控制面板：Streamlabs OBS 是 OBS Studio 的一个版本，它内置了更多的用户友好功能和界面优化，旨在简化直播设置过程。它提供了直观的用户界面，使新用户更容易上手。

捐赠和订阅管理：Streamlabs 允许观众通过多种方式支持直播者，包括一次性捐赠、订阅服务等。平台还提供了实时通知和自动感谢消息等功能，帮助直播者更好地与观众互动。

警报和通知：当有新的关注者、捐赠、订阅或评论时，Streamlabs 可以通过自定义的动画和声音效果来提醒直播者和观众，增强直播间的互动氛围。

自动化工具：Streamlabs 提供了一系列自动化工具，如自动回复、计时器、抽奖活动等，这些工具可以帮助直播者更有效地管理直播间，提高观众参与度。

分析和报告：直播者可以访问详细的统计信息和分析报告，了解观众行为、收入情况等关键指标，从而做出更好的决策。
市场和插件：Streamlabs 拥有一个市场，用户可以在这里找到各种插件和附加组件，用于进一步个性化和增强直播体验。

移动应用：除了桌面应用外，Streamlabs 还提供了一款移动应用，让直播者即使不在电脑前也能管理自己的直播间。
社区和支持：Streamlabs 拥有一个活跃的社区，用户可以在这里分享经验、寻求帮助或提出建议。官方也提供了丰富的文档和教程，帮助用户充分利用平台的各项功能。

总的来说，Streamlabs 是一个全面的直播解决方案，特别适合那些希望通过直播建立个人品牌或实现商业目标的创作者。无论是初学者还是有经验的直播者，都可以从 Streamlabs 的工具和服务中获益。

### obs-studio-node

Node 版本的 obs，在 electron 中可以集成

##  二、obs-studio-node 集成

```
obs-studio-node 是 streamlabs 开源的一个 封装了 OBS C++ 版本的 npm 包，以方便开发者在基于 Electron 开发桌面软件的场景中集成 OBS 的功能。
```
### 2.1 安装和使用

#### 环境准备

在 packge.json 手动添加上对应版本的下载地址

```
 "dependencies": {
    "obs-studio-node": "https://s3-us-west-2.amazonaws.com/obsstudionodes3.streamlabs.com/osn-0.24.43-release-win64.tar.gz",
  },
  ...
```
因为需要为OSN所在渲染进程开启remote，所以需要安装 @electron/remote

```shell
yarn add @elecrtron/remote

```

安装uuid，方便为OSN创建所需的唯一标识
```shell
yarn add uuid
```


#### 集成 OSN

```js
// 在主进程引入remote
const remote = require('@electron/remote')

//  为运行OBS单独创建渲染进程，或者直接在你的主渲染进程使用OBS，注意并关闭上下文隔离，开启 node 注入
const mainWindow = new BrowserWindow({
  ...
  nodeIntegration: true,
    webviewTag: true,
    contextIsolation: false,
  }
})

// 为渲染进程开启remote
remote.enable(mainWindow.webContents)
```

经过测试新版本的OSN需要在渲染进程导入才能使用（在main进程使用会导致应用卡死）
```js
import { v4 } from 'uuid'
const obs = require('obs-studio-noe') // 因为在渲染进程使用node模块，务必使用require导入
// 初始化 IPC，干嘛的不知道
osn.IPC.host(`${v4()}`)

// 设置obs包路径，实际设置的时候要区分开发跟生产路径，仅作开发示例
osn.NodeObs.SetWorkingDirectory(path.join(remote.app.getAppPath(), 'node_modules', 'obs-studio-node'))

// 初始化osn api
osn.NodeObs.OBS_API_initAPI('en-US', obsDataPath, '1.0.0', '')

// 初始设置
const settings = osn.NodeObs.OBS_settings_getSettings(category).data
osn.NodeObs.OBS_settings_saveSettings(category, settings)

```

#### 创建场景并添加资源
- osn.SceneFactory.create('test-scene')
- osn.InputFactory.create('monitor_capture', 'desktop-video')

```js
// 创建场景
const scene = osn.SceneFactory.create('test-scene')

// 创建资源并添加到场景中
const resource = osn.InputFactory.create('monitor_capture', 'desktop-video', settings)

// 对资源进行设置

// 将资源添加到场景中
const sceneItem = scene.add(resource)

// 对资源在场景中的尺寸或者位置进行更改
sceneItem.scale = { x: 1 / 3, y: 1 / 3 }
sceneItem.position = { x: 300, y: 300 }
```

#### 创建display来预览/编辑
- obs.NodeObs.OBS_content_createSourcePreviewDisplay()
- obs.NodeObs.OBS_content_createDisplay()

#### 调整display的样式/尺寸/位置
- osn.NodeObs.OBS_content_setShouldDrawUI(displayId, true);
- osn.NodeObs.OBS_content_setPaddingSize(displayId, 100);
- osn.NodeObs.OBS_content_setPaddingColor(displayId, 255, 255, 255);
-  osn.NodeObs.OBS_content_resizeDisplay(displayId, 1000, 800);
-  osn.NodeObs.OBS_content_moveDisplay(displayId, 100, 300);

#### OBS应用配置
- obs.NodeObs.OBS_settings_getSettings(category: string)

你可以通过此方法获取相应类别下的配置信息，例如

```typescript
const videoSettings = obs.NodeObs.OBS_settings_getSettings('Video')
console.log(videoSettings)
// videoSettings 结构如下：
{
  data: [
    {
      nameSubCategory: 'Untitled',
      parameters: [
        {
          name: 'Base',
          type: 'OBS_INPUT_RESOLUTION_LIST',
          description: 'Base (Canvas) Resolution',
          currentValue: '1280x720',
          subType: 'OBS_COMBO_FORMAT_STRING',
          values: [
            { '1920x1080': '1920x1080' },
            { '1280x720'： '1280x720'},
            { '3840x2160': '3840x2160' }
          ]
        }，
        { 
          name: 'Output',
          ...
        },
        { 
          name: 'Output',
          ...
        },
        {
          name: 'ScaleType',
          ...
        },
        {
          name: 'FPS Type',
          ...
        },
        {
          name: 'FPSCommon',
          ...
        }
      ]
    }
  ],
  type: 0
}
```

- obs.NodeObs.OBS_settings_setSettings(category: string, settings: Object)

你可以通过此方法修改obs应用的某个类别的设置，例如把输出分辨率修改成1024*768，那么就是要修改Video类别下的子类别Output的currentValue
```typescript

// 首先获取到Video类别的设置信息
const videoSettings = obs.NodeObs.OBS_settings_getSettings('Video')

// 查找到Output子类别，并设置currentValue，注意：这里的对象修改不会直接生效
videoSettings.forEach(subCategory => {
  subCategory.parameters.forEach(param => {
    if (param.name === 'Output') {
      param.currentValue = '1024x768'
    }
  })
})

// 应用配置
obs.NodeObs.OBS_settings_saveSettings('Video', videoSettings)

```

下面的函数可以方便你快速修改指定的配置信息
```typescript
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
```

#### 推流
- 

#### 创建虚拟摄像头

#### 销毁display

### 2.2 场景

### 2.3 设置

#### 视频

可设置项
```typescript

// video设置类型
export interface IVideoInfo {
  fpsNum: number;
  fpsDen: number;
  baseWidth: number;
  baseHeight: number;
  outputWidth: number;
  outputHeight: number;
  outputFormat: EVideoFormat;
  colorspace: EColorSpace;
  range: ERangeType;
  scaleType: EScaleType;
  fpsType: EFPSType;
}

// video 默认配置
export const verticalDisplayData = {
  fpsNum: 30,
  fpsDen: 1,
  baseWidth: 720,
  baseHeight: 1280,
  outputWidth: 720,
  outputHeight: 1280,
  outputFormat: EVideoFormat.I420,
  colorspace: EColorSpace.CS709,
  range: ERangeType.Full,
  scaleType: EScaleType.Bilinear,
  fpsType: EFPSType.Integer,
};
```

可以通过obs.NodeObs.VideoFactoty.create()创建配置上下文，对象配置会自动关联画面
```typescript
const context = VideoFactory.create()
context.video = videoSettings
context.legacySettings = legacySettings
```


#### 分辨率

```typescript
// baseHeight: 1080, baseWidth: 1920, horizontal
```
#### 音频
#### 输出

### 2.4 推流

### 2.5 录制

### 2.5 Websocket

## streamlabs desktop 项目主要模块
```
本部分内容主要针对desktop项目中涉及到NodeObs相关的模块进行介绍
```


