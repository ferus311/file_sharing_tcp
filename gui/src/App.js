import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import LogActivity from './pages/LogActivity';
import Homepage from './pages/Homepage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/log-activity" element={<LogActivity />} />
                    <Route path="/" element={<Homepage />} />
                    {/* <Route path="/home" element={<Homepage />} /> */}

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;