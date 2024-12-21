import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [username, setName] = useState('');
    const [password, setPassword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await window.electronAPI.login(username, password);
            setResponseMessage(response);
            if (response.startsWith('2000')) {
                const tokenValue = response.split(' ')[1].replace(/\n/g, '').replace(/\r/g, '');
                login(tokenValue, username);
                navigate('/');
            }
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage('An error occurred during login.');
        }
    };

    const handleSignupClick = () => {
        navigate('/signup');
    };

    return (
        <div className="login-container">
            <div className="login-header bg-primary text-white p-3 d-flex align-items-center">
                <button className="btn btn-link text-white" onClick={() => navigate('/')}>
                    <i className="fa fa-arrow-left"></i> Back to Homepage
                </button>
            </div>
            <div className="login-content container mt-5">
                <div className="row justify-content-center py-5">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <h2 className="text-center mb-4">Login</h2>
                                <form onSubmit={handleLogin}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setName(e.target.value)}
                                            required
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
                                            required
                                        />
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="rememberMe" />
                                            <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                                        </div>
                                        <a href="#" className="text-primary">Forgot Your password?</a>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Log in</button>
                                </form>
                                <div className="text-center mt-3">
                                    <span>Or</span>
                                </div>
                                <div className="d-grid gap-2 mt-3">
                                    <button className="btn btn-outline-secondary">
                                        <img src="assets/img/sign/google.png" alt="Google" className="me-2" />
                                        Continue With Google
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <img src="assets/img/sign/fb.png" alt="Facebook" className="me-2" />
                                        Continue with Facebook
                                    </button>
                                </div>
                                <div className="text-center mt-3">
                                    <span>I accept your <a href="#" className="text-primary">terms & conditions</a></span>
                                </div>
                                <div className="text-center mt-3">
                                    <button className="btn btn-link" onClick={handleSignupClick}>Create account</button>
                                </div>
                                {responseMessage && (
                                    <div className="alert alert-info mt-3" role="alert">
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
};

export default Login;


