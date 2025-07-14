import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider, useAuth } from "./assets/AuthContext";
import Login from "./assets/Login";
import Home from "./assets/Home";
import Modules from "./assets/Modules";
import Topics from "./assets/Topics";
import TopicDetailsWrapper from "./assets/TopicDetailsWrapper";
import FloatingNotes from "./assets/FloatingNotes";
import ThemeToggle from "./assets/Theme";
import Profile from "./assets/Profile";
import LoadingSpinner from "./assets/LoadingSpinner";

import './assets/global.css';

const clientId = "452988976233-v5cck196uoeii6abjlmsi5mto4r6asf9.apps.googleusercontent.com";

// ✅ ProtectedRoute
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// ✅ PublicRoute
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
}

// ✅ AppWrapper
function AppWrapper() {
  const location = useLocation();
  const { loading } = useAuth();
  const hideFloatingNotes = location.pathname === "/login";

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {!hideFloatingNotes && <FloatingNotes />}
      <ThemeToggle />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
        <Route path="/topics/:level" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
        <Route path="/levels/:levelId/topics/:topicId" element={<ProtectedRoute><TopicDetailsWrapper /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Router>
          <AppWrapper />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
