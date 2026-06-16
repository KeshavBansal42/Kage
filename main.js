const { app, BrowserWindow, ipcMain, Menu, screen, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let petWindow;
let ballWindow;
let tray;
const saveFilePath = path.join(app.getPath('userData'), 'kage_save_data.json');

let savedState = { pet: null, ball: null };
try {
  if (fs.existsSync(saveFilePath)) {
    savedState = JSON.parse(fs.readFileSync(saveFilePath, 'utf8'));
  }
} catch (e) {
  console.error("Failed to load save state", e);
}

function saveCurrentState() {
  const state = { pet: null, ball: null };
  if (petWindow && !petWindow.isDestroyed()) {
    const [x, y] = petWindow.getPosition();
    state.pet = { x, y };
  }
  if (ballWindow && !ballWindow.isDestroyed()) {
    const [x, y] = ballWindow.getPosition();
    state.ball = { x, y };
  }
  fs.writeFileSync(saveFilePath, JSON.stringify(state));
}

function createWindow(type) {
  const winWidth = 100; 
  const winHeight = 100;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  let x, y;
  if (savedState[type]) {
    x = savedState[type].x;
    y = savedState[type].y;
  } else {
    
    x = type === 'pet' ? Math.floor((width - winWidth) / 2) : Math.floor((width - winWidth) / 2) + 200;
    y = height - winHeight - 50;
  }

  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x, y,
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

  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile('src/index.html', { query: { entity: type } });

  win.webContents.on('did-finish-load', () => {
    win.blur(); 
    if (type === 'pet' && savedState.pet) {
      win.webContents.send('force-state', 'sleeping');
    }
  });

  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[${type}] ${message} (line ${line})`);
  });

  return win;
}

function getMenuTemplate() {
  return [
    { label: 'Kage Desktop Pet', enabled: false },
    { type: 'separator' },
    { label: 'Wake Up Cat', click: () => { if (petWindow) petWindow.webContents.send('force-state', 'idle'); } },
    { label: 'Reset Positions', click: () => {
        const display = screen.getPrimaryDisplay();
        const bounds = display.workAreaSize;
        if (petWindow) {
          petWindow.setPosition(Math.floor((bounds.width - 150) / 2), bounds.height - 150 - 50);
          petWindow.webContents.send('reset-ground');
        }
        if (ballWindow) {
          ballWindow.setPosition(Math.floor((bounds.width - 150) / 2) + 200, bounds.height - 150 - 50);
          ballWindow.webContents.send('reset-ground');
        }
    }},
    { label: 'Toggle Ball', click: () => {
        if (ballWindow) {
           if (ballWindow.isVisible()) ballWindow.hide();
           else ballWindow.show();
        }
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); } }
  ];
}

function createTray() {
  let icon = nativeImage.createEmpty();
  const iconPath = path.join(__dirname, 'src/icon.png');
  if (fs.existsSync(iconPath) && fs.statSync(iconPath).size > 0) {
    icon = nativeImage.createFromPath(iconPath);
  }
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate(getMenuTemplate());
  
  tray.setToolTip('Kage Desktop Pet');
  tray.setContextMenu(contextMenu);
}

if (process.platform === 'darwin') {
  app.dock.hide();
}

app.whenReady().then(() => {
  createTray();
  petWindow = createWindow('pet');
  ballWindow = createWindow('ball');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      petWindow = createWindow('pet');
      ballWindow = createWindow('ball');
    }
  });
});

app.on('before-quit', saveCurrentState);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-screen-bounds', () => screen.getPrimaryDisplay().workAreaSize);
ipcMain.handle('get-all-displays', () => screen.getAllDisplays().map(d => d.workArea));

ipcMain.handle('get-window-pos', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { x: 0, y: 0 };
  const [x, y] = win.getPosition();
  return { x, y };
});

ipcMain.on('move-window', (event, { deltaX, deltaY }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const [currentX, currentY] = win.getPosition();
    win.setPosition(Math.round(currentX + deltaX), Math.round(currentY + deltaY));
  }
});

ipcMain.on('set-window-pos', (event, { x, y }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setPosition(Math.round(x), Math.round(y));
  }
});

ipcMain.on('ball-pos-update', (event, pos) => {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.webContents.send('ball-position', pos);
  }
});

ipcMain.on('show-context-menu', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const contextMenu = Menu.buildFromTemplate(getMenuTemplate());
  contextMenu.popup({ window: win });
});

ipcMain.on('push-ball', (event, { vx, vy }) => {
  if (ballWindow && !ballWindow.isDestroyed()) {
    ballWindow.webContents.send('apply-force', { vx, vy });
  }
});

ipcMain.on('quit-app', () => {
  app.quit();
});
