// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/LandingPage';
import Login from './pages/Auth/signin';
import Signup from './pages/Auth/signup';
import ForgotPassword from './pages/Auth/forgot-password';
import ResetPassword from './pages/Auth/reset-password';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
// import AdminPanel from './pages/Admin/AdminPanel';
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

          
          {/* Protected Routes - User */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<CreateTrip />} />
          
          {/* Protected Routes - Admin */}
          {/* <Route path="/admin" element={<AdminPanel />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;