const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('kageAPI', {
  getScreenBounds: () => ipcRenderer.invoke('get-screen-bounds'),
  getAllDisplays: () => ipcRenderer.invoke('get-all-displays'),
  getWindowPos: () => ipcRenderer.invoke('get-window-pos'),
  moveWindow: (deltaX, deltaY) => ipcRenderer.send('move-window', { deltaX, deltaY }),
  setWindowPos: (x, y) => ipcRenderer.send('set-window-pos', { x, y }),
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  onResetGround: (callback) => ipcRenderer.on('reset-ground', callback),
  onForceState: (callback) => ipcRenderer.on('force-state', (event, state) => callback(state)),
  onBallPosition: (callback) => ipcRenderer.on('ball-position', (event, pos) => callback(pos)),
  updateBallPosition: (x, y) => ipcRenderer.send('ball-pos-update', { x, y }),
  pushBall: (vx, vy) => ipcRenderer.send('push-ball', { vx, vy }),
  onApplyForce: (callback) => ipcRenderer.on('apply-force', (event, force) => callback(force)),
  quitApp: () => ipcRenderer.send('quit-app')
});
