const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    login: (username, password) =>
        ipcRenderer.invoke('login', username, password),
    signup: (username, password) =>
        ipcRenderer.invoke('signup', username, password),
    checkAdmin: (token, groupId) =>
        ipcRenderer.invoke('check-admin', token, groupId),
    sendLogActivity: (token, groupId, timestamp) =>
        ipcRenderer.invoke('send-log-activity', token, groupId, timestamp),
    createGroup: (token, groupName) =>
        ipcRenderer.invoke('create-group', token, groupName),
    listGroups: (token) =>
        ipcRenderer.invoke('list-groups', token),
    listGroupMembers: (token, groupId) =>
        ipcRenderer.invoke('list-group-members', token, groupId),
    listRequests: (token, groupId) =>
        ipcRenderer.invoke('list-requests', token, groupId),
    requestJoinGroup: (token, groupId) =>
        ipcRenderer.invoke('request-join-group', token, groupId),
    inviteUserToGroup: (token, groupId, inviteeId) =>
        ipcRenderer.invoke('invite-user-to-group', token, groupId, inviteeId),
    listAvailableInviteUsers: (token, groupId) =>
        ipcRenderer.invoke('list-available-invite-users', token, groupId),
    leaveGroup: (token, groupId) =>
        ipcRenderer.invoke('leave-group', token, groupId),
    deleteGroup: (token, groupId) =>
        ipcRenderer.invoke('delete-group', token, groupId),
    respondInvitation: (token, groupId, approvalStatus) =>
        ipcRenderer.invoke('respond-invitation', token, groupId, approvalStatus),
    approveJoinRequest: (token, requestId, status) =>
        ipcRenderer.invoke('approve-join-request', token, requestId, status),
    removeMember: (token, groupId, userId) =>
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
    deleteDir: (token, dirId) =>
        ipcRenderer.invoke('delete-dir', token, dirId),
    deleteFile: (token, fileId) =>
        ipcRenderer.invoke('delete-file', token, fileId),

});
