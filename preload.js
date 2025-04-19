const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  startCapturing: (data) => ipcRenderer.send('start-capturing', data),
  stopCapturing: () => ipcRenderer.send('stop-capturing'),
  getHomeDir: () => ipcRenderer.invoke('get-home-dir') // use invoke instead of directly calling os
});

