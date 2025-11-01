// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/LandingPage';
import Login from './pages/Auth/signin';
import Signup from './pages/Auth/signup';
import ForgotPassword from './pages/Auth/forgot-password';
import ResetPassword from './pages/Auth/reset-password';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password/:token" element={<ResetPassword/>}/>
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* Protected Routes - User */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<CreateTrip />} />
          <Route path="/create-trip" element={<CreateTrip />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;