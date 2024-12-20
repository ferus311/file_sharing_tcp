const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    login: (username, password) =>
        ipcRenderer.invoke('login', username, password),
    signup: (username, password) =>
        ipcRenderer.invoke('signup', username, password),
    sendLogActivity: (token, groupId, timestamp) =>
        ipcRenderer.invoke('send-log-activity', token, groupId, timestamp),
    createGroup: (token, groupName) =>
        ipcRenderer.invoke('create-group', token, groupName),
    listGroups: (token) =>
        ipcRenderer.invoke('list-groups', token),
    listGroupMembers: (token, groupId) =>
        ipcRenderer.invoke('list-group-members', token, groupId),
    requestJoinGroup: (token, groupId) =>
        ipcRenderer.invoke('request-join-group', token, groupId),
    inviteUserToGroup: (token, groupId, inviteeId) =>
        ipcRenderer.invoke('invite-user-to-group', token, groupId, inviteeId),
    leaveGroup: (token, groupId) =>
        ipcRenderer.invoke('leave-group', token, groupId),
    deleteGroup: (token, groupId) =>
        ipcRenderer.invoke('delete-group', token, groupId),
    respondInvitation: (token, groupId, approvalStatus) =>
        ipcRenderer.invoke('respond-invitation', token, groupId, approvalStatus),
    approveJoinRequest: (token, groupId, userId) =>
        ipcRenderer.invoke('approve-join-request', token, groupId, userId),
    removemember: (token, groupId, userId) =>
        ipcRenderer.invoke('remove-member', token, groupId, userId),
    listDirectory: (token, groupId, directoryId) =>
        ipcRenderer.invoke('list-directory-content', token, groupId, directoryId),
    listGroupContent: (token, groupId) =>
        ipcRenderer.invoke('list-group-content', token, groupId),
    uploadFile: (token, groupId, dataString) =>
        ipcRenderer.invoke('upload-file', token, groupId, dataString),
    createFolder: (token, groupId, folderName) =>
        ipcRenderer.invoke('create-folder', token, groupId, folderName),
    fetchFileDetail: (token, groupId, fileId) =>
        ipcRenderer.invoke('file-detail', token, groupId, fileId),
    downloadFile: (token, fileId) =>
        ipcRenderer.invoke('download-file', token, fileId),
});
