import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Signup = () => {
    const { t } = useTranslation(); // Initialize useTranslation
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage(t('passwords_do_not_match'));
            setTimeout(() => {
                setErrorMessage('');
            }, 3000); // Xóa thông báo sau 3 giây
            return;
        }
        try {
            const response = await window.electronAPI.signup(username, password);
            if (response.startsWith('2000')) {
                const tokenValue = response.split(' ')[1].replace(/\n/g, '').replace(/\r/g, '');
                login(tokenValue, username);
                navigate('/');

                setSuccessMessage(t('signup_successful'));
                setTimeout(() => {
                    setSuccessMessage('');
                    navigate('/');
                }, 3000); // Chờ 3 giây trước khi chuyển hướng và xóa thông báo
            } else {
                setErrorMessage(t('signup_failed'));
                setTimeout(() => {
                    setErrorMessage('');
                }, 3000); // Xóa thông báo sau 3 giây
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(t('error_during_signup'));
            setTimeout(() => {
                setErrorMessage('');
            }, 3000); // Xóa thông báo sau 3 giây
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-header bg-primary text-white p-3 d-flex align-items-center">
                <button className="btn btn-link text-white" onClick={() => navigate('/')}>
                    <i className="fa fa-arrow-left"></i> {t('back_to_homepage')}
                </button>
            </div>
            <div className="signup-content container mt-5">
                <div className="row justify-content-center py-5">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <h2 className="text-center mb-4">{t('create_account')}</h2>
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
                                        <label htmlFor="username" className="form-label">{t('username')}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            placeholder={t('enter_username')}
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {/* <div className="mb-3">
                                        <label htmlFor="email" className="form-label">{t('email')}</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            placeholder={t('enter_email')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div> */}
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">{t('password')}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            placeholder={t('enter_password')}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">{t('confirm_password')}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            placeholder={t('confirm_password')}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">{t('signup')}</button>
                                </form>
                                <div className="text-center mt-3">
                                    <span>{t('or')}</span>
                                </div>
                                <div className="d-grid gap-2 mt-3">
                                    <button className="btn btn-outline-secondary">
                                        <img src="/assets/img/sign/google.png" alt="Google" className="me-2" />
                                        {t('continue_with_google')}
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <img src="/assets/img/sign/fb.png" alt="Facebook" className="me-2" />
                                        {t('continue_with_facebook')}
                                    </button>
                                </div>
                                <div className="text-center mt-3">
                                    <span>{t('accept_terms')}</span>
                                </div>
                                <div className="text-center mt-3">
                                    <button className="btn btn-link" onClick={() => navigate('/login')}>{t('already_have_account')}</button>
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
