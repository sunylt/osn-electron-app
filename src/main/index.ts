import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import remote from '@electron/remote/main'
import icon from '../../resources/icon.png?asset'
import { initialize, setupPreview } from './obs-app'

console.log(remote)

remote.initialize()

function createWindow(): void {


  // const workerWindow = new BrowserWindow({
  //   show: false,
  //   frame: false,
  //   webPreferences: {
  //     nodeIntegration: true,
  //     contextIsolation: false,
  //   }
  // })

  // if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  //   workerWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#worker')
  // }

  // workerWindow.webContents.openDevTools()

  // remote.enable(workerWindow.webContents)

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    // mainWindow.show()
    // workerWindow.webContents.send('MainWindowId', mainWindow.id)
  })

  // mainWindow.webContents.setWindowOpenHandler((details) => {
  //   shell.openExternal(details.url)
  //   return { action: 'deny' }
  // })


  ipcMain.handle('initPreview', (_, bounds) => {
    // initialize(mainWindow)
    // console.log('ready to create display')
    // setupPreview(mainWindow, bounds)
  })

  ipcMain.handle('addImage', (_, bounds) => {
    // setupPreview(mainWindow, bounds)
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  remote.enable(mainWindow.webContents)

  mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('getAppPath', (event, arg) => {
  return app.getAppPath()
})

ipcMain.handle('primaryDisplay', (event, arg) => {
  return screen.getPrimaryDisplay()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
