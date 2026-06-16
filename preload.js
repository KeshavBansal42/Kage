const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kageAPI', {
  getScreenBounds: () => ipcRenderer.invoke('get-screen-bounds'),
  getWindowPos: () => ipcRenderer.invoke('get-window-pos'),
  moveWindow: (deltaX, deltaY) => ipcRenderer.send('move-window', { deltaX, deltaY }),
  setWindowPos: (x, y) => ipcRenderer.send('set-window-pos', { x, y }),
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  onResetGround: (callback) => ipcRenderer.on('reset-ground', callback),
  quitApp: () => ipcRenderer.send('quit-app')
});
