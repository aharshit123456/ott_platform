// DEPRECATED: WHAM! OTT Classic. Kept reachable under /legacy while the new
// WHAM! freelance network (src/wham) replaces it. Do not add features here.
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './legacy.css';
import Home from './pages/Home';
import PullList from './pages/PullList';
import VideoPlayer from './pages/VideoPlayer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

function LegacyApp() {
  return (
    <div className="legacy-root">
      <Routes>
        <Route index element={<Home />} />
        <Route path="pull-list" element={<PullList />} />
        <Route path="watch/:id" element={<VideoPlayer />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/legacy" replace />} />
      </Routes>
    </div>
  );
}

export default LegacyApp;
