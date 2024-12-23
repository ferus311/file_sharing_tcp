import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {

    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000); // Xóa thông báo sau 3 giây
            return;
        }
        try {
            const response = await window.electronAPI.signup(username, password, email);
            if (response.startsWith('2000')) {
                const tokenValue = response.split(' ')[1].replace(/\n/g, '').replace(/\r/g, '');
                login(tokenValue, username);
                navigate('/');

                setSuccessMessage('Signup successful! Redirecting to login...');
                setTimeout(() => {
                    setSuccessMessage('');
                    navigate('/');
                }, 3000); // Chờ 3 giây trước khi chuyển hướng và xóa thông báo
            } else {
                // console.log('Signup failed:', response);

                setErrorMessage('Signup failed. Please try again.');
                setTimeout(() => {
                    setErrorMessage('');
                }, 3000); // Xóa thông báo sau 3 giây
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('An error occurred during signup.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000); // Xóa thông báo sau 3 giây
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-header bg-primary text-white p-3 d-flex align-items-center">
                <button className="btn btn-link text-white" onClick={() => navigate('/')}>
                    <i className="fa fa-arrow-left"></i> Back to Homepage
                </button>
            </div>
            <div className="signup-content container mt-5">
                <div className="row justify-content-center py-5">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <h2 className="text-center mb-4">Create Account</h2>
                                {errorMessage && (
                                    <div className="alert alert-danger" role="alert">
                                        {errorMessage}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="alert alert-success" role="alert">
                                        {successMessage}
                                    </div>
                                )}
                                <form onSubmit={handleSignup}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            placeholder="Enter username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {/* <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            placeholder="Enter email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div> */}
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Signup</button>
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
                                    <button className="btn btn-link" onClick={() => navigate('/login')}>Already have an account? Log in</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
