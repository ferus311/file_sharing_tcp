const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const connectionManager = require('./connectionManager');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Đảm bảo bật cách ly context
            enableRemoteModule: false, // Tắt module remote (nếu không cần thiết)
            nodeIntegration: false, // Đảm bảo không bật nodeIntegration
        },
    });

    mainWindow.loadURL(
        process.env.ELECTRON_START_URL ||
            `file://${path.join(__dirname, '../build/index.html')}`
    );

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle(
    'send-log-activity',
    async (event, token, groupId, timestamp) => {
        await connectionManager.connect();
        const message = `LOG_ACTIVITY ${token} ${groupId}||${timestamp}\r\n`;
        return connectionManager.sendMessage(message);
    }
);

ipcMain.handle('login', async (event, username, password) => {
    await connectionManager.connect();
    const message = `LOGIN ${username}||${password}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('signup', async (event, username, password) => {
    await connectionManager.connect();
    const message = `REGISTER ${username}||${password}\r\n`;
    return connectionManager.sendMessage(message);
});
