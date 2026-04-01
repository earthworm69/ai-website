import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ImageGenerator from './pages/ImageGenerator';
import VideoGenerator from './pages/VideoGenerator';
import SavedImages from './pages/SavedImages';
import SavedVideos from './pages/SavedVideos';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/image-generator" replace />} />
                <Route path="image-generator" element={<ImageGenerator />} />
                <Route path="video-generator" element={<VideoGenerator />} />
                <Route path="saved-images" element={<SavedImages />} />
                <Route path="saved-videos" element={<SavedVideos />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
