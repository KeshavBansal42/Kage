const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const windowSize = 150; 
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: windowSize,
    height: windowSize,
    x: Math.floor((width - windowSize) / 2),
    y: height - windowSize - 50, 
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.loadFile('src/index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.blur(); 
  });

  ipcMain.on('show-context-menu', () => {
    const template = [
      {
        label: 'Reset Position',
        click: () => {
          const display = screen.getPrimaryDisplay();
          const bounds = display.workAreaSize;
          mainWindow.setPosition(
            Math.floor((bounds.width - windowSize) / 2),
            bounds.height - windowSize - 50
          );
          mainWindow.webContents.send('reset-ground');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit Kage',
        click: () => app.quit()
      }
    ];
    Menu.buildFromTemplate(template).popup(mainWindow);
  });
}

if (process.platform === 'darwin') {
  app.dock.hide();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-screen-bounds', () => screen.getPrimaryDisplay().workAreaSize);

ipcMain.handle('get-window-pos', () => {
  if (!mainWindow) return { x: 0, y: 0 };
  const [x, y] = mainWindow.getPosition();
  return { x, y };
});

ipcMain.on('move-window', (event, { deltaX, deltaY }) => {
  if (mainWindow) {
    const [currentX, currentY] = mainWindow.getPosition();
    mainWindow.setPosition(Math.round(currentX + deltaX), Math.round(currentY + deltaY));
  }
});

ipcMain.on('set-window-pos', (event, { x, y }) => {
  if (mainWindow) {
    mainWindow.setPosition(Math.round(x), Math.round(y));
  }
});

ipcMain.on('quit-app', () => {
  app.quit();
});
