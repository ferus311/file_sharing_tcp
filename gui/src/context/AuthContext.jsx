import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const logout = () => {
        setToken(null);
        setUsername(null);
        navigate("/");
    };


    return (
        <AuthContext.Provider value={{ token, setToken, username, setUsername, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
