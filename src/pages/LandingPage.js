// src/pages/Landing/Landing.js
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaRobot, 
  FaGlobeAmericas, 
  FaSave, 
  FaMobileAlt,
  FaRoute,
  FaHeart,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaStar,
  FaCompass,
  FaExchangeAlt,
  FaMap,
  FaMoneyBillWave,
  FaCloudDownloadAlt
} from 'react-icons/fa';
import { 
  HiSparkles, 
  HiMap, 
  HiCloudDownload 
} from 'react-icons/hi';
import '../styles/Landing.css';

const Landing = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Tokyo, Japan",
      rating: 5,
      text: "WanderAI completely transformed how I travel! The currency converter saved me so much hassle, and the offline maps were a lifesaver.",
      avatar: "SJ"
    },
    {
      id: 2,
      name: "Marcus Chen",
      location: "Barcelona, Spain",
      rating: 5,
      text: "As a solo traveler, the country exploration features helped me discover hidden gems I would have never found on my own.",
      avatar: "MC"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      location: "Bali, Indonesia",
      rating: 5,
      text: "The travel library kept all my documents organized, and the real-time currency updates helped me stick to my budget perfectly.",
      avatar: "ER"
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="container">
          <div className="nav-bar">
            <div className="logo">
              <HiSparkles className="logo-icon" />
              <h2>WanderAI</h2>
            </div>
            <nav className="nav-links">
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <HiSparkles className="badge-icon" />
              AI-Powered Travel Planning
            </div>
            <h1 className="hero-title">
              Craft Your Perfect
              <span className="gradient-text"> Journey</span>
            </h1>
            <p className="hero-description">
              Let our intelligent algorithms design personalized travel experiences 
              tailored to your unique style, budget, and dreams. 
              Discover hidden gems and create memories that last forever.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary btn-large">
                <FaCompass className="btn-icon" />
                Start Your Adventure
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                <HiMap className="btn-icon" />
                Continue Planning
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <FaStar className="trust-icon" />
                <span>4.9/5 from 2k+ travelers</span>
              </div>
              <div className="trust-item">
                <FaUsers className="trust-icon" />
                <span>50k+ trips planned</span>
              </div>
              <div className="trust-item">
                <FaGlobeAmericas className="trust-icon" />
                <span>150+ countries</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="hero-background">
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to Travel Smart</h2>
            <p>Powerful tools that make travel planning effortless and enjoyable</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaExchangeAlt className="feature-icon" />
              </div>
              <h3>Smart Currency Converter</h3>
              <p>Real-time exchange rates with built-in fee calculator. Never overpay again with our intelligent currency conversion that includes local bank fees and best exchange practices.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaGlobeAmericas className="feature-icon" />
              </div>
              <h3>Country Exploration</h3>
              <p>Deep dive into 150+ countries with local insights, cultural tips, and seasonal recommendations. Discover hidden local favorites beyond tourist hotspots.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaMap className="feature-icon" />
              </div>
              <h3>Interactive Maps</h3>
              <p>Seamless navigation with layered maps showing attractions, restaurants, and transportation. Custom pins and route optimization for efficient sightseeing.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaSave className="feature-icon" />
              </div>
              <h3>Digital Travel Library</h3>
              <p>Store boarding passes, hotel confirmations, and important documents in one secure place. Access everything instantly across all your devices.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaCloudDownloadAlt className="feature-icon" />
              </div>
              <h3>Full Offline Access</h3>
              <p>Download complete itineraries, maps, and essential information. Travel with confidence even without internet connection in remote areas.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaMoneyBillWave className="feature-icon" />
              </div>
              <h3>Budget Optimizer</h3>
              <p>AI-powered spending analysis and budget tracking. Get personalized recommendations to maximize your experience while staying within budget.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <FaRoute className="stat-icon" />
              <h3>50,000+</h3>
              <p>Trips Planned</p>
            </div>
            <div className="stat-item">
              <FaGlobeAmericas className="stat-icon" />
              <h3>150+</h3>
              <p>Countries Covered</p>
            </div>
            <div className="stat-item">
              <FaHeart className="stat-icon" />
              <h3>98%</h3>
              <p>User Satisfaction</p>
            </div>
            <div className="stat-item">
              <FaClock className="stat-icon" />
              <h3>24/7</h3>
              <p>AI Assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-header">
            <h2>What Travelers Say</h2>
            <p>Join thousands of satisfied explorers who transformed their journeys</p>
          </div>
          
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-avatar">
                    {review.avatar}
                  </div>
                  <div className="review-info">
                    <h4>{review.name}</h4>
                    <p>{review.location}</p>
                  </div>
                  <div className="review-rating">
                    {[...Array(review.rating)].map((_, i) => (
                      <FaStar key={i} className="star-icon" />
                    ))}
                  </div>
                </div>
                <p className="review-text">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <FaCompass className="cta-icon" />
            <h2>Start Your Adventure Today</h2>
            <p>Join our community of smart travelers and experience the future of travel planning</p>
            <Link to="/signup" className="btn btn-primary btn-large">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;