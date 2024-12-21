import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function LogActivity() {

    const { token } = useAuth(); // Lấy token từ Context
    const [groupId, setGroupId] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [responseMessage, setResponseMessage] = useState('');

    useEffect(() => {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 200);
        const formattedDate = daysAgo.toISOString().split('T')[0];
        setTimestamp(formattedDate);
    }, []);

    const handleLogActivity = async () => {
        try {
            const response = await window.electronAPI.sendLogActivity(token, groupId, timestamp);
            const cleanResponse = response.startsWith('2000') ? response.slice(5) : response;
            setResponseMessage(cleanResponse);
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage('An error occurred while sending log activity.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4">
                <h2 className="mb-4 text-center">Log Activity</h2>
                <div className="form-group mb-3">
                    <label htmlFor="token">Token</label>
                    <input
                        type="text"
                        id="token"
                        className="form-control"
                        placeholder="Enter Token"
                        value={token}
                    // onChange={(e) => setToken(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="groupId">Group ID</label>
                    <input
                        type="text"
                        id="groupId"
                        className="form-control"
                        placeholder="Enter Group ID"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="timestamp">Timestamp</label>
                    <input
                        type="text"
                        id="timestamp"
                        className="form-control"
                        placeholder="Enter Timestamp"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary w-100 mb-3" onClick={handleLogActivity}>
                    Send Log Activity
                </button>
                {responseMessage && (
                    <div className="alert alert-info mt-3" id="response">
                        {responseMessage}
                    </div>
                )}
            </div>
        </div>
    );
}


export default LogActivity;
