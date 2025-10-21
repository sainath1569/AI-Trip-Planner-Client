// src/pages/Landing/Landing.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="container">
          <div className="nav-bar">
            <div className="logo">
              <h2>✈️ AI Trip Planner</h2>
            </div>
            <nav className="nav-links">
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Plan Your Perfect Trip with 
              <span className="gradient-text"> AI Power</span>
            </h1>
            <p className="hero-description">
              Let artificial intelligence create personalized travel itineraries 
              based on your preferences, budget, and dreams. 
              Discover hidden gems and optimize your journey like never before.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary btn-large">
                Start Planning Free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                I Have an Account
              </Link>
            </div>
          </div>
          
          {/* Feature Showcase */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Planning</h3>
              <p>Intelligent algorithms create optimized itineraries</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Coverage</h3>
              <p>Millions of destinations and attractions worldwide</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Save & Organize</h3>
              <p>Store and manage all your travel plans in one place</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Any Device</h3>
              <p>Access your plans anywhere, anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>50,000+</h3>
              <p>Trips Planned</p>
            </div>
            <div className="stat-item">
              <h3>150+</h3>
              <p>Countries Covered</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>User Satisfaction</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>AI Assistance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;