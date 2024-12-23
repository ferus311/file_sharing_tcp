import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [allGroup, setAllGroup] = useState([]);


    const login = (token, username) => {
        setToken(token);
        setUsername(username);
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
    };

    const logout = () => {
        setToken('');
        setUsername('');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    };

    useEffect(() => {
        const handleLogout = () => {
            logout();
            window.location.href = '/login'; // Redirect to login page
        };

        window.electronAPI.on('logout', handleLogout);

        return () => {
            window.electronAPI.off('logout', handleLogout);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ token, username, login, logout, allGroup, setAllGroup }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
