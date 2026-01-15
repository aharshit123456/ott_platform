import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<VideoPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;
