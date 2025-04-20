

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getHomeDir: () => ipcRenderer.invoke('get-home-dir'),
  startCapturing: (data) => ipcRenderer.send('start-capturing', data),
  stopCapturing: () => ipcRenderer.send('stop-capturing'),
  onScreenshotPreview: (callback) => ipcRenderer.on('screenshot-preview', (event, path) => callback(path))
});
