const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const net = require('net');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle(
    'send-log-activity',
    async (event, token, groupId, timestamp) => {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            client.connect(1234, '127.0.0.1', () => {
                const message = `LOG_ACTIVITY ${token} ${groupId}||${timestamp}\r\n`;
                client.write(message);
            });

            client.on('data', (data) => {
                resolve(data.toString());
                client.destroy();
            });

            client.on('error', (err) => {
                reject(err);
            });
        });
    }
);

ipcMain.handle('login', async (event, username, password) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.connect(1234, '127.0.0.1', () => {
            const message = `LOGIN ${username}||${password}\r\n`;
            client.write(message);
        });

        client.on('data', (data) => {
            resolve(data.toString());
            client.destroy();
        });

        client.on('error', (err) => {
            reject(err);
        });
    });
});
