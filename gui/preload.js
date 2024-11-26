const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    login: (username, password) =>
        ipcRenderer.invoke('login', username, password),
    signup: (username, password) =>
        ipcRenderer.invoke('signup', username, password),
    sendLogActivity: (token, groupId, timestamp) =>
        ipcRenderer.invoke('send-log-activity', token, groupId, timestamp),
});
