import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import LogActivity from './pages/LogActivity';
import Homepage from './pages/Homepage';
import Layout from './components/Layout';
import GroupDetail from './pages/GroupDetail';
import FolderDetail from './pages/FolderDetail';
import FileDetail from './pages/FileDetail';
import './style.css';


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/log-activity" element={<LogActivity />} />
                    {/* <Route path="/group-members" element={<GroupMembers/>} /> */}
                    <Route
                        path="/group/:groupId"
                        element={
                            <Layout>
                                <GroupDetail />
                            </Layout>
                        }
                    />
                    <Route path="/group/:groupId/folder/:folderId" element={<Layout><FolderDetail /></Layout>} />
                    <Route path="/group/:groupId/file/:fileId" element={<Layout><FileDetail /></Layout>} />
                    <Route
                        path="/"
                        element={
                            <Layout>
                                <Homepage />
                            </Layout>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
