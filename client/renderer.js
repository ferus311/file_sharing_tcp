document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await window.electronAPI.login(username, password);
        document.getElementById('response').innerText = response;

        if (response.startsWith('2000')) {
            const token = response.split(' ')[1];
            document.getElementById('token').value = token;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('log-section').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

document
    .getElementById('send-log-activity')
    .addEventListener('click', async () => {
        const token = document.getElementById('token').value;
        const groupId = document.getElementById('group-id').value;
        const timestamp = document.getElementById('timestamp').value;

        try {
            const response = await window.electronAPI.sendLogActivity(
                token,
                groupId,
                timestamp
            );
            document.getElementById('response').innerText = response;
        } catch (error) {
            console.error('Error:', error);
        }
    });
