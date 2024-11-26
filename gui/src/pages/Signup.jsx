import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Sử dụng Context cho token

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { setToken } = useAuth(); // Lấy hàm setToken từ Context

    const handleSignup = async () => {
        try {
            const response = await window.electronAPI.signup(username, password);
            console.log(response);
            if (response.startsWith('2000')) {
                const token = response.split(' ')[1];
                setToken(token); // Lưu token
                navigate('/log-activity'); // Chuyển hướng đến Log Activity
            } else {
                setErrorMessage(response); // Hiển thị lỗi từ server
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('An error occurred during signup.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Signup</h2>
                            {errorMessage && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMessage}
                                </div>
                            )}
                            <div className="form-group mb-3">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="form-control"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSignup}
                                >
                                    Signup
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/login')}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
