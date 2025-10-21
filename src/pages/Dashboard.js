// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlane, 
  FaChartBar, 
  FaGlobeAmericas, 
  FaBolt, 
  FaStar,
  FaEdit,
  FaShare,
  FaFilter,
  FaPlus,
  FaUmbrellaBeach,
  FaMountain,
  FaCoffee,
  FaBuilding
} from 'react-icons/fa';
import { 
  GiTempleGate,
  GiPalmTree
} from 'react-icons/gi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalTrips: 0,
    countriesExplored: 0,
    apiUsage: 0,
    favoriteTrips: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Get user data from localStorage
    const userData = {
      username: localStorage.getItem('username') || 'Traveler',
      email: localStorage.getItem('email') || '',
      profileImage: localStorage.getItem('profileImage') || ''
    };
    setUser(userData);

    // Mock data - replace with actual API calls
    setStats({
      totalTrips: 12,
      countriesExplored: 8,
      apiUsage: 47,
      favoriteTrips: 5
    });

    setRecentTrips([
      { id: 1, title: 'Bali Adventure', date: '2024-01-15', type: 'beach', favorite: true },
      { id: 2, title: 'Japan Temple Tour', date: '2024-01-10', type: 'temple', favorite: false },
      { id: 3, title: 'Paris Cafe Hopping', date: '2024-01-05', type: 'cafe', favorite: true },
      { id: 4, title: 'Swiss Alps', date: '2024-01-03', type: 'mountain', favorite: false },
      { id: 5, title: 'Luxury Dubai', date: '2024-01-01', type: 'hotel', favorite: true }
    ]);
  }, []);

  const filters = [
    { id: 'all', label: 'All', icon: <FaFilter /> },
    { id: 'beach', label: 'Beaches', icon: <FaUmbrellaBeach /> },
    { id: 'temple', label: 'Temples', icon: <GiTempleGate /> },
    { id: 'cafe', label: 'Cafes', icon: <FaCoffee /> },
    { id: 'hotel', label: 'Hotels', icon: <FaBuilding /> },
    { id: 'mountain', label: 'Mountains', icon: <FaMountain /> }
  ];

  const handleCreateNewTrip = () => {
    navigate('/planner');
  };

  const handleTripClick = (tripId) => {
    navigate(`/planner?trip=${tripId}`);
  };

  const filteredTrips = activeFilter === 'all' 
    ? recentTrips 
    : recentTrips.filter(trip => trip.type === activeFilter);

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            Welcome back, {user?.username}!
          </h1>
          <p className="dashboard-subtitle">
            Ready to plan your next adventure?
          </p>
        </div>
        <button 
          className="create-trip-btn"
          onClick={handleCreateNewTrip}
        >
          <FaPlane style={{ marginRight: '8px' }} />
          Create New Trip
        </button>
      </header>

      {/* Stats Grid */}
      <section >
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartBar />
            </div>
            <div className="stat-content">
              <h3>{stats.totalTrips}</h3>
              <p>Total Trips</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaGlobeAmericas />
            </div>
            <div className="stat-content">
              <h3>{stats.countriesExplored}</h3>
              <p>Countries Explored</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaBolt />
            </div>
            <div className="stat-content">
              <h3>{stats.apiUsage}%</h3>
              <p>API Usage</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <h3>{stats.favoriteTrips}</h3>
              <p>Favorite Trips</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <h2 className="section-title">Explore by Category</h2>
        <div className="filters-grid">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              <span className="filter-icon">{filter.icon}</span>
              <span className="filter-label">{filter.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Trips */}
      <section className="trips-section">
        <div className="section-header">
          <h2 className="section-title">Recent Trips</h2>
          {recentTrips.length > 0 && (
            <button 
              className="view-all-btn"
              onClick={() => navigate('/planner')}
            >
              View All
            </button>
          )}
        </div>

        {filteredTrips.length > 0 ? (
          <div className="trips-grid">
            {filteredTrips.map(trip => (
              <div 
                key={trip.id} 
                className="trip-card"
                onClick={() => handleTripClick(trip.id)}
              >
                <div className="trip-header">
                  <h3 className="trip-title">{trip.title}</h3>
                  {trip.favorite && (
                    <span className="favorite-badge">
                      <FaStar />
                    </span>
                  )}
                </div>
                <div className="trip-meta">
                  <span className="trip-date">{trip.date}</span>
                  <span className="trip-type">{trip.type}</span>
                </div>
                <div className="trip-actions">
                  <button className="action-btn">
                    <FaEdit style={{ marginRight: '4px' }} />
                    Edit
                  </button>
                  <button className="action-btn">
                    <FaShare style={{ marginRight: '4px' }} />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <GiPalmTree />
            </div>
            <h3>No trips yet</h3>
            <p>Start planning your first adventure!</p>
            <button 
              className="create-trip-btn primary"
              onClick={handleCreateNewTrip}
            >
              <FaPlus style={{ marginRight: '8px' }} />
              Create Your First Trip
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;