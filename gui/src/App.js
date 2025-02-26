import React, { useContext } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './i18n'; // Import i18n

import Login from './pages/Login';
import Signup from './pages/Signup';
import Homepage from './pages/Homepage';
import Invite from './pages/Invite';
import JoinGroup from './pages/JoinGroup';
import Layout from './components/Layout';
import GroupDetail from './pages/GroupDetail';
import FileDetail from './pages/FileDetail';
import './style.css';

function PrivateRoute({ children }) {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route
                        path="/group/:groupId"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <GroupDetail />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/group/:groupId/file/:fileId"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <FileDetail />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <Layout>
                                <Homepage />
                            </Layout>
                        }
                    />
                    <Route
                        path="/invite"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Invite />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/join-group"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <JoinGroup />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
