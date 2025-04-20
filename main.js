const { app, BrowserWindow, ipcMain, Tray, Menu, dialog, Notification} = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const os = require('os');

let win;
let tray;
let captureInterval;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  win.loadFile('index.html');

  win.on('minimize', (event) => {
    event.preventDefault();
    // win.hide();
  });

  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => win.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Screenshot App');
  tray.setContextMenu(contextMenu);
}

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

ipcMain.handle('get-home-dir', () => {
  return require('os').homedir();
});



ipcMain.on('start-capturing', (event, { interval, folder, format }) => {
  if (captureInterval) clearInterval(captureInterval);

  captureInterval = setInterval(() => {
    screenshot({ format }).then((img) => {
      // Generate timestamped file name
      const now = new Date();
      const timestamp = now.toISOString().replace(/:/g, '-').replace('T', '_').split('.')[0];
      const fileName = `screenshot_${timestamp}.${format}`;
      const filePath = path.join(folder, fileName);

      // Save image to disk
      require('fs').writeFileSync(filePath, img);

      // Send path to renderer for preview
      win.webContents.send('screenshot-preview', 'file://' + filePath);

      // Show system notification
      new Notification({
        title: 'Screenshot Taken',
        body: `Saved as ${fileName}`,
        // silent: false
      }).show();

    }).catch((err) => console.error(err));
  }, interval);
});


ipcMain.on('stop-capturing', () => {
  if (captureInterval) clearInterval(captureInterval);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
