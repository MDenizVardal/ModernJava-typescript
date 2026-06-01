const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'

let mainWindow = null
let serverInstance = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !isDev,
    },
    backgroundColor: '#1e3a5f',
    show: false,
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../assets/icon.png'),
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    // Production: load from the embedded Express server (avoids file:// CORS issues)
    mainWindow.loadURL('http://localhost:3001')
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

async function startEmbeddedServer() {
  try {
    const { createServer } = require('./server/index')
    serverInstance = await createServer()
    console.log('[Server] Gömülü sunucu başlatıldı - Port 3001')
  } catch (err) {
    console.error('[Server] Sunucu başlatma hatası:', err.message)
    dialog.showErrorBox(
      'Sunucu Hatası',
      `Uygulama sunucusu başlatılamadı:\n${err.message}\n\nUygulama kapatılıyor.`
    )
    app.quit()
  }
}

app.whenReady().then(async () => {
  await startEmbeddedServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('quit', () => {
  if (serverInstance) serverInstance.close()
})

// IPC: pencere kontrolleri
ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.handle('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)

// IPC: dosya açma diyaloğu
ipcMain.handle('dialog:openImages', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Fotoğraf Seç',
    filters: [{ name: 'Resimler', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
    properties: ['openFile', 'multiSelections'],
  })
  if (result.canceled) return []
  return result.filePaths.map(fp => ({
    path: fp,
    name: path.basename(fp),
    data: fs.readFileSync(fp).toString('base64'),
    mime: `image/${path.extname(fp).slice(1).toLowerCase().replace('jpg', 'jpeg')}`,
  }))
})

// IPC: uygulama bilgisi
ipcMain.handle('app:version', () => app.getVersion())
ipcMain.handle('app:userData', () => app.getPath('userData'))
