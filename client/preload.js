const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendLogActivity: (token, groupId, timestamp) =>
        ipcRenderer.invoke('send-log-activity', token, groupId, timestamp),
    login: (username, password) =>
        ipcRenderer.invoke('login', username, password),
});
