const { contextBridge, ipcRenderer } = require('electron');

const handleResponse = async (promise) => {
    try {
        const response = await promise;
        // console.log('Response from server:', response);
        if (response.startsWith('4011')) {
            localStorage.removeItem('token');
            ipcRenderer.send('token-expired');
            return Promise.reject(
                new Error('Session expired. Please log in again.')
            );
        }
        return response;
    } catch (error) {
        return Promise.reject(error);
    }
};

contextBridge.exposeInMainWorld('electronAPI', {
    login: (username, password) =>
        ipcRenderer.invoke('login', username, password),
    signup: (username, password) =>
        ipcRenderer.invoke('signup', username, password),
    checkAdmin: (token, groupId) =>
        handleResponse(ipcRenderer.invoke('check-admin', token, groupId)),
    sendLogActivity: (token, groupId, timestamp) =>
        handleResponse(
            ipcRenderer.invoke('send-log-activity', token, groupId, timestamp)
        ),
    createGroup: (token, groupName) =>
        handleResponse(ipcRenderer.invoke('create-group', token, groupName)),
    listGroups: (token) =>
        handleResponse(ipcRenderer.invoke('list-groups', token)),
    listGroupsNotJoined: (token) =>
        handleResponse(ipcRenderer.invoke('list-groups-not-joined', token)),
    listGroupMembers: (token, groupId) =>
        handleResponse(
            ipcRenderer.invoke('list-group-members', token, groupId)
        ),
    listRequests: (token, groupId) =>
        handleResponse(ipcRenderer.invoke('list-requests', token, groupId)),
    listAdminGroups: (token) =>
        handleResponse(ipcRenderer.invoke('list-admin-groups', token)),
    requestJoinGroup: (token, groupId) =>
        handleResponse(
            ipcRenderer.invoke('request-join-group', token, groupId)
        ),
    inviteUserToGroup: (token, groupId, inviteeId) =>
        handleResponse(
            ipcRenderer.invoke(
                'invite-user-to-group',
                token,
                groupId,
                inviteeId
            )
        ),
    listAvailableInviteUsers: (token, groupId) =>
        handleResponse(
            ipcRenderer.invoke('list-available-invite-users', token, groupId)
        ),
    leaveGroup: (token, groupId) =>
        handleResponse(ipcRenderer.invoke('leave-group', token, groupId)),
    deleteGroup: (token, groupId) =>
        handleResponse(ipcRenderer.invoke('delete-group', token, groupId)),
    listInvitations: (token) =>
        handleResponse(ipcRenderer.invoke('list-invitations', token)),
    respondInvitation: (token, requestId, approvalStatus) =>
        handleResponse(
            ipcRenderer.invoke(
                'respond-invitation',
                token,
                requestId,
                approvalStatus
            )
        ),
    approveJoinRequest: (token, requestId, status) =>
        handleResponse(
            ipcRenderer.invoke('approve-join-request', token, requestId, status)
        ),
    removeMember: (token, groupId, userId) =>
        handleResponse(
            ipcRenderer.invoke('remove-member', token, groupId, userId)
        ),
    listDirectory: (token, groupId, directoryId) =>
        handleResponse(
            ipcRenderer.invoke(
                'list-directory-content',
                token,
                groupId,
                directoryId
            )
        ),
    listGroupContent: (token, groupId) =>
        handleResponse(
            ipcRenderer.invoke('list-group-content', token, groupId)
        ),
    uploadFile: (token, groupId, dirId, dataString) =>
        handleResponse(
            ipcRenderer.invoke('upload-file', token, groupId, dirId, dataString)
        ),
    createFolder: (token, groupId, parentDirId, dirName) =>
        handleResponse(
            ipcRenderer.invoke(
                'create-folder',
                token,
                groupId,
                parentDirId,
                dirName
            )
        ),
    fetchFileDetail: (token, groupId, fileId) =>
        handleResponse(
            ipcRenderer.invoke('file-detail', token, groupId, fileId)
        ),
    downloadFile: (token, fileId, fileName) =>
        handleResponse(
            ipcRenderer.invoke('download-file', token, fileId, fileName)
        ),
    deleteFolder: (token, dirId) =>
        handleResponse(ipcRenderer.invoke('delete-folder', token, dirId)),
    deleteFile: (token, fileId) =>
        handleResponse(ipcRenderer.invoke('delete-file', token, fileId)),
    copyItem: (token, itemId, targetDirId, isFile) =>
        handleResponse(
            ipcRenderer.invoke('copy-item', token, itemId, targetDirId, isFile)
        ),
    renameItem: (token, itemId, newName, isFile) =>
        handleResponse(
            ipcRenderer.invoke('rename-item', token, itemId, newName, isFile)
        ),
    moveItem: (token, itemId, targetDirId, isFile) =>
        handleResponse(
            ipcRenderer.invoke('move-item', token, itemId, targetDirId, isFile)
        ),
    on: (channel, func) => ipcRenderer.on(channel, func),
    off: (channel, func) => ipcRenderer.off(channel, func),
});
