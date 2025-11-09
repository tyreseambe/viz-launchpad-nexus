const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  openStrafe: () => ipcRenderer.send('open-strafe'),
  toggleAlwaysOnTop: () => ipcRenderer.send('toggle-always-on-top'),
  toggleTransparency: (transparent) => ipcRenderer.send('toggle-transparency', transparent),
  onAlwaysOnTopChanged: (callback) => ipcRenderer.on('always-on-top-changed', callback)
});
