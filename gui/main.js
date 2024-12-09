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

ipcMain.handle('create-group', async (event, token, groupName) => {
    await connectionManager.connect();
    const message = `CREATE_GROUP ${token} ${groupName}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('list-groups', async (event, token) => {
    await connectionManager.connect();
    const message = `LIST_GROUPS ${token}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('list-group-members', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `LIST_GROUP_MEMBERS ${token} ${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('request-join-group', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `REQUEST_JOIN_GROUP ${token}||${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('invite-user-to-group', async (event, token, groupId, inviteeId) => {
    await connectionManager.connect();
    const message = `INVITE_USER_TO_GROUP ${token} ${groupId}||${inviteeId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('leave-group', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `LEAVE_GROUP ${token} ${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('delete-group', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `DELETE_GROUP ${token}||${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('respond-invitation', async (event, token, groupId, approvalStatus) => {
    await connectionManager.connect();
    const message = `RESPOND_INVITATION ${token}||${groupId}||${approvalStatus}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('approve-join-request', async (event, token, groupId, userId) => {
    await connectionManager.connect();
    const message = `APPROVE_JOIN_REQUEST ${token}||${groupId}||${userId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('remove-member', async (event, token, groupId, userId) => {
    await connectionManager.connect();
    const message = `REMOVE_MEMBER ${token} ${groupId}||${userId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('list-directory-content', async (event, token, groupId, directoryId) => {
    await connectionManager.connect();
    const message = `LIST_DIRECTORY_CONTENT ${token}||${groupId}||${directoryId}\r\n`;
    return connectionManager.sendMessage(message);
});
