import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Homepage from './pages/Homepage';
import Invite from './pages/Invite';
import JoinGroup from './pages/JoinGroup';
import Layout from './components/Layout';
import GroupDetail from './pages/GroupDetail';
import FileDetail from './pages/FileDetail';
import './style.css';


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
                            <Layout>
                                <GroupDetail />
                            </Layout>
                        }
                    />
                    <Route path="/group/:groupId/file/:fileId" element={<Layout><FileDetail /></Layout>} />
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
                            <Layout>
                                <Invite />
                            </Layout>
                        }
                    />
                    <Route
                        path="/join-group"
                        element={
                            <Layout>
                                <JoinGroup />
                            </Layout>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
