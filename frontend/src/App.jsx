import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // ✅ ADD

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Prediction from "./pages/Prediction";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PredictionHistory from "./pages/PredictionHistory";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const { user, loading } = useAuth(); // ✅ USE AUTH

  // ✅ Prevent render until auth is checked (FIX BLINK)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl animate-pulse">Initializing...</p>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <BrowserRouter>

        {/* ✅ Navbar */}
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <Routes>
          {/* 🌍 Landing */}
          <Route path="/" element={<Landing />} />

          {/* 🔓 Auth routes */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/home" />}
          />

          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/home" />}
          />

          <Route
            path="/forgot-password"
            element={!user ? <ForgotPassword /> : <Navigate to="/home" />}
          />

          <Route
            path="/reset-password/:token"
            element={!user ? <ResetPassword /> : <Navigate to="/home" />}
          />

          {/* 🔒 Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />

          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            }
          />

          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <Prediction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />

          <Route
            path="/prediction-history"
            element={
              <ProtectedRoute>
                <PredictionHistory />
              </ProtectedRoute>
            }
          />

          {/* Unknown route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* ✅ Footer */}
        <Footer />

      </BrowserRouter>
    </div>
  );
}

export default App;