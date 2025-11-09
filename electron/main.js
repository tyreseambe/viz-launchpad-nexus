const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0A0A0A',
    frame: true,
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create strafe overlay window
ipcMain.on('open-strafe', () => {
  const strafeWindow = new BrowserWindow({
    width: 500,
    height: 700,
    frame: true,
    backgroundColor: '#0A0A0A',
    transparent: false,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    strafeWindow.loadURL('http://localhost:8080/strafe');
  } else {
    strafeWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'strafe'
    });
  }
});

// Toggle always on top
ipcMain.on('toggle-always-on-top', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const isAlwaysOnTop = win.isAlwaysOnTop();
  win.setAlwaysOnTop(!isAlwaysOnTop);
  event.reply('always-on-top-changed', !isAlwaysOnTop);
});

// Make window transparent for OBS
ipcMain.on('toggle-transparency', (event, transparent) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.setOpacity(transparent ? 0.95 : 1);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
