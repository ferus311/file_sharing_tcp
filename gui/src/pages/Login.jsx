import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


function Login() {

    const navigate = useNavigate();
    const { setToken } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');

    const handleLoginClick = async () => {
        try {
            const response = await window.electronAPI.login(username, password);
            setResponseMessage(response);
            console.log(response);


            if (response.startsWith('2000')) {
                const tokenValue = response.split(' ')[1];
                setToken(tokenValue);
                navigate('/log-activity'); // Điều hướng tới trang 'log-activity'
            }
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage('An error occurred during login.');
        }
    };

    const handleSignupClick = () => {
        navigate('/signup'); // Điều hướng tới trang 'signup'
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Login</h2>
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleLoginClick}
                                    >
                                        Login
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleSignupClick}
                                    >
                                        Signup
                                    </button>
                                </div>
                            </form>
                            <div className="mt-3">
                                {responseMessage && (
                                    <div className="alert alert-info">
                                        {responseMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
