import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message, Input, Button, Card, Spin } from 'antd';

const { TextArea } = Input;

const LogActivity = ({ groupId }) => {
    const { token } = useAuth();
    const [timestamp, setTimestamp] = useState('');
    const [logEntries, setLogEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 200);
        const formattedDate = daysAgo.toISOString().split('T')[0];
        setTimestamp(formattedDate);
    }, []);

    const fetchLogActivity = async () => {
        setLoading(true);
        try {
            const response = await window.electronAPI.sendLogActivity(token, groupId, timestamp);
            const cleanResponse = response.startsWith('2000') ? response.slice(5) : response;
            const parsedLogs = parseLogEntries(cleanResponse);
            setLogEntries(parsedLogs);
            // message.success('Log activity fetched successfully.');
        } catch (error) {
            console.error('Error:', error);
            // message.error('An error occurred while fetching log activity.');
        } finally {
            setLoading(false);
        }
    };

    const parseLogEntries = (logString) => {
        const logLines = logString.split('\n').filter(line => line.trim() !== '');
        return logLines.map(line => {
            const [userId, action, timestamp, details] = line.split(', ').map(part => part.split(': ')[1]);
            return { userId, action, timestamp, details };
        });
    };

    useEffect(() => {
        if (token && groupId) {
            fetchLogActivity();
        }
    }, [token, groupId, timestamp]);

    return (
        <div className="container mt-5">
            <Card className="p-4">
                <div className="form-group mb-3">
                    <label htmlFor="timestamp">Timestamp</label>
                    <Input
                        type="text"
                        id="timestamp"
                        placeholder="Enter Timestamp"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                    />
                </div>
                <Button type="primary" className="w-100 mb-3" onClick={fetchLogActivity} disabled={loading}>
                    {loading ? <Spin /> : 'Fetch Log Activity'}
                </Button>
                <Card className="p-4 mt-4">
                    <h2 className="mb-4 text-center">Activity Log</h2>
                    <div className="log-activity" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {logEntries.map((entry, index) => (
                            <Card key={index} className="log-entry mb-3 p-3">
                                <p><strong>User ID:</strong> {entry.userId}</p>
                                <p><strong>Action:</strong> {entry.action}</p>
                                <p><strong>Timestamp:</strong> {entry.timestamp}</p>
                                <p><strong>Details:</strong> {entry.details}</p>
                            </Card>
                        ))}
                    </div>
                </Card>
            </Card>
        </div>
    );
};

export default LogActivity;
