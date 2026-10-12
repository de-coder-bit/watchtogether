import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import VideoDetailPage from './pages/VideoDetailPage';
import WatchRoomPage from './pages/WatchRoomPage';
import UploadPage from './pages/UploadPage';
import MyUploadsPage from './pages/MyUploadsPage';
import PartnerPairPage from './pages/PartnerPairPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-cinema-bg text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <BrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:id"
            element={
              <ProtectedRoute>
                <VideoDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomCode"
            element={
              <ProtectedRoute>
                <WatchRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-uploads"
            element={
              <ProtectedRoute>
                <MyUploadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pair"
            element={
              <ProtectedRoute>
                <PartnerPairPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <AppRoutes />
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
