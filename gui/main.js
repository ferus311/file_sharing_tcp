const { app, BrowserWindow, ipcMain, Notification, dialog } = require('electron');
const path = require('path');
const net = require('net');
const fs = require('fs');
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

ipcMain.handle('check-admin', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `CHECK_ADMIN ${token} ${groupId}\r\n`;
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

ipcMain.handle('list-groups-not-joined', async (event, token) => {
    await connectionManager.connect();
    const message = `LIST_GROUPS_NOT_JOINED ${token}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('list-group-members', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `LIST_GROUP_MEMBERS ${token} ${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('list-requests', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `LIST_REQUESTS ${token} ${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('request-join-group', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `REQUEST_JOIN_GROUP ${token} ${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle(
    'invite-user-to-group',
    async (event, token, groupId, inviteeId) => {
        await connectionManager.connect();
        const message = `INVITE_USER_TO_GROUP ${token} ${groupId}||${inviteeId}\r\n`;
        return connectionManager.sendMessage(message);
    }
);

ipcMain.handle(
    'list-available-invite-users',
    async (event, token, groupId) => {
        await connectionManager.connect();
        const message = `LIST_AVAILABLE_INVITE_USERS ${token} ${groupId}\r\n`;
        return connectionManager.sendMessage(message);
    }
);


ipcMain.handle('leave-group', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `LEAVE_GROUP ${token} ${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('delete-group', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `DELETE_GROUP ${token} ${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('list-invitations', async (event, token) => {
    await connectionManager.connect();
    const message = `LIST_INVITATIONS ${token}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('respond-invitation', async (event, token, requestId, approvalStatus) => {
    await connectionManager.connect();
    const message = `RESPOND_INVITATION ${token} ${requestId}||${approvalStatus}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('approve-join-request', async (event, token, requestId, status) => {
    await connectionManager.connect();
    const message = `APPROVE_JOIN_REQUEST ${token} ${requestId}||${status}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('remove-member', async (event, token, groupId, userId) => {
    await connectionManager.connect();
    const message = `REMOVE_MEMBER ${token} ${groupId}||${userId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle(
    'list-directory-content',
    async (event, token, groupId, directoryId) => {
        await connectionManager.connect();
        const message = `LIST_DIRECTORY_CONTENT ${token} ${groupId}||${directoryId}\r\n`;
        return connectionManager.sendMessage(message);
    }
);

ipcMain.handle('list-group-content', async (event, token, groupId) => {
    await connectionManager.connect();
    const message = `LIST_GROUP_CONTENT ${token} ${groupId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('delete-file', async (event, token, fileId) => {
    await connectionManager.connect();
    const message = `DELETE_FILE ${token} ${fileId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('delete-folder', async (event, token, dirId) => {
    await connectionManager.connect();
    const message = `DELETE_FOLDER ${token} ${dirId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('upload-file', async (event, token, groupId, dirId, dataString) => {
    await connectionManager.connect();
    const message = `UPLOAD_FILE ${token} ${groupId}||${dirId}||${dataString}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('file-detail', async (event, token, groupId, fileId) => {
    await connectionManager.connect();
    const message = `FILE_DETAIL ${token} ${groupId}||${fileId}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('download-file', async (event, token, fileId, fileName) => {
    const client = new net.Socket();
    const filePath = path.join(app.getPath('downloads'), `${fileName}`); // Lưu file trong thư mục Downloads

    if (fs.existsSync(filePath)) {
        const { response } = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Overwrite', 'Cancel'],
            title: 'File Exists',
            message: `The file ${fileName} already exists. Do you want to overwrite it?`,
        });

        if (response === 1) {
            return { success: false, message: 'Download cancelled by user' };
        }
    }

    return new Promise((resolve, reject) => {
        let fileStream;

        try {
            fileStream = fs.createWriteStream(filePath);

            client.connect(1234, '127.0.0.1', () => {
                console.log('Connected to server');
                const message = `DOWNLOAD_FILE ${token} ${fileId}\r\n`;
                client.write(message);
            });

            client.on('data', (data) => {
                console.log(`Received ${data.length} bytes`);
                fileStream.write(data); // Ghi dữ liệu vào file
            });

            client.on('end', () => {
                console.log('Download complete');
                fileStream.close();
                event.sender.send('download-complete', { success: true, filePath });

                new Notification({
                    title: 'Download Complete',
                    body: `File ${fileName} has been downloaded successfully in Downloads.`,
                }).show();

                resolve({ success: true, filePath });
            });

            client.on('error', (err) => {
                console.error('Socket error:', err);
                fileStream.close();
                reject(err);
            });
        } catch (err) {
            if (fileStream) fileStream.close();
            reject(err);
        }
    });
});

ipcMain.handle('logout', async () => {
    // Handle logout logic here, e.g., clear session, redirect to login page, etc.
    console.log('Session expired. Logging out...');
    mainWindow.webContents.send('logout');
});

ipcMain.handle('list-admin-groups', async (event, token) => {
    await connectionManager.connect();
    const message = `LIST_ADMIN_GROUPS ${token}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('create-folder', async (event, token, groupId, parentDirId, folderName) => {
    await connectionManager.connect();
    const message = `CREATE_FOLDER ${token} ${groupId}||${parentDirId}||${folderName}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('copy-item', async (event, token, itemID, targetDirId, isFile) => {
    await connectionManager.connect();
    const message = `COPY_ITEM ${token} ${itemID}||${targetDirId}||${isFile}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('rename-item', async (event, token, itemId, newName, isFile) => {
    await connectionManager.connect();
    const message = `RENAME_ITEM ${token} ${itemId}||${newName}||${isFile}\r\n`;
    return connectionManager.sendMessage(message);
});

ipcMain.handle('move-item', async (event, token, itemId, targetDirId, isFile) => {
    await connectionManager.connect();
    const message = `MOVE_ITEM ${token} ${itemId}||${targetDirId}||${isFile}\r\n`;
    return connectionManager.sendMessage(message);
});
