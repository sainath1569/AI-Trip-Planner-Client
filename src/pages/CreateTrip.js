// src/pages/CreateTrip/CreateTrip.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaPlane, 
  FaSearch, 
  FaStar, 
  FaEdit, 
  FaShare, 
  FaDownload, 
  FaTrash,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChartBar,
  FaBolt,
  FaChevronLeft,
  FaChevronRight,
  FaPaperPlane,
  FaCopy,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import { 
  RiHeartFill, 
  RiHeartLine,
  RiUserSettingsLine
} from 'react-icons/ri';
import '../styles/CreateTrip.css';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trips, setTrips] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);

  // Mock trip data
  const mockTrips = [
    {
      id: 1,
      title: 'Bali Beach Adventure',
      prompt: 'Plan a 7-day trip to Bali focusing on beaches, yoga, and local cuisine',
      content: `**Bali 7-Day Itinerary**

**Day 1: Arrival in Seminyak**
- Check into beachfront villa
- Sunset at Double Six Beach
- Dinner at La Plancha

**Day 2: Uluwatu Temple & Beaches**
- Morning: Uluwatu Temple visit
- Afternoon: Padang Padang Beach
- Evening: Kecak Fire Dance

**Day 3: Ubud Cultural Experience**
- Yoga session at sunrise
- Visit Sacred Monkey Forest
- Traditional Balinese cooking class`,
      timestamp: '2024-01-15T10:30:00',
      favorite: true,
      type: 'beach'
    },
    {
      id: 2,
      title: 'Japan Temple Tour',
      prompt: 'Create a 5-day cultural tour of Kyoto temples and traditional experiences',
      content: `**Kyoto Cultural Journey**

**Day 1: Arrival & Gion District**
- Check into ryokan
- Explore Gion district
- Traditional kaiseki dinner`,
      timestamp: '2024-01-10T14:20:00',
      favorite: true,
      type: 'temple'
    },
    {
      id: 3,
      title: 'Paris Cafe Hopping',
      prompt: '3-day Paris itinerary focusing on famous cafes and patisseries',
      content: `**Paris Cafe Tour**...`,
      timestamp: '2024-01-05T09:15:00',
      favorite: false,
      type: 'cafe'
    }
  ];

  useEffect(() => {
    // Get user data
    const userData = {
      username: localStorage.getItem('username') || 'Traveler',
      email: localStorage.getItem('email') || '',
      profileImage: localStorage.getItem('profileImage') || ''
    };
    setUser(userData);

    // Load trips (in real app, this would be from API)
    setTrips(mockTrips);
    setFavorites(mockTrips.filter(trip => trip.favorite));

    // Check if editing existing trip
    const tripId = searchParams.get('trip');
    if (tripId) {
      const tripToEdit = mockTrips.find(trip => trip.id === parseInt(tripId));
      if (tripToEdit) {
        setActiveTrip(tripToEdit);
        setPrompt(tripToEdit.prompt);
      }
    }
  }, [searchParams]);

  const handleCreateTrip = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const newTrip = {
        id: Date.now(),
        title: prompt.substring(0, 30) + '...',
        prompt: prompt,
        content: `**Generated Trip Plan for: ${prompt}**

This is where the AI-generated trip plan would appear with detailed itinerary, accommodations, activities, and recommendations.

**Highlights:**
- Customized daily schedule
- Budget recommendations
- Local cuisine suggestions
- Transportation options
- Cultural insights

The AI has analyzed your preferences and created an optimized itinerary for your dream trip!`,
        timestamp: new Date().toISOString(),
        favorite: false,
        type: 'custom'
      };

      setTrips(prev => [newTrip, ...prev]);
      setActiveTrip(newTrip);
      setPrompt('');
      setIsGenerating(false);
    }, 2000);
  };

  const handleEditTrip = (trip) => {
    setActiveTrip(trip);
    setPrompt(trip.prompt);
  };

  const handleDeleteTrip = (tripId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      setFavorites(prev => prev.filter(trip => trip.id !== tripId));
      if (activeTrip?.id === tripId) {
        setActiveTrip(null);
        setPrompt('');
      }
    }
  };

  const handleToggleFavorite = (tripId, e) => {
    e.stopPropagation();
    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, favorite: !trip.favorite } : trip
    ));
  };

  const handleShareTrip = async (trip, e) => {
    e.stopPropagation();
    // PDF generation would go here
    alert(`Sharing trip: ${trip.title}`);
  };

  const handleDownloadTrip = (trip, e) => {
    e.stopPropagation();
    // PDF download logic
    alert(`Downloading trip: ${trip.title}`);
  };

  const handleCopyContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Trip content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleFavorites = () => {
    setFavoritesExpanded(!favoritesExpanded);
  };

  const filteredTrips = trips.filter(trip =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFavorites = favorites.filter(trip =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`trip-planner ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button 
            className="new-trip-btn"
            onClick={() => {
              setActiveTrip(null);
              setPrompt('');
            }}
          >
            <FaPlane />
            New Trip
          </button>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">
              <FaSearch />
            </span>
          </div>
        </div>

        <div className="sidebar-content">
          {/* Trip History - Takes full height when favorites collapsed */}
          <div className="trip-history" style={{ 
            flex: favoritesExpanded ? 1 : '1 1 auto' 
          }}>
            <h3 className="sidebar-section-title">
              <FaChartBar />
              Recent Trips
            </h3>
            <div className="trip-list">
              {filteredTrips.map(trip => (
                <div
                  key={trip.id}
                  className={`trip-item ${activeTrip?.id === trip.id ? 'active' : ''}`}
                  onClick={() => setActiveTrip(trip)}
                >
                  <div className="trip-item-header">
                    <h4 className="trip-item-title">{trip.title}</h4>
                    <button
                      className={`favorite-btn ${trip.favorite ? 'favorited' : ''}`}
                      onClick={(e) => handleToggleFavorite(trip.id, e)}
                    >
                      {trip.favorite ? <RiHeartFill /> : <RiHeartLine />}
                    </button>
                  </div>
                  <p className="trip-item-preview">
                    {trip.prompt.substring(0, 60)}...
                  </p>
                  <div className="trip-item-actions">
                    <button 
                      className="action-btn edit"
                      onClick={(e) => { e.stopPropagation(); handleEditTrip(trip); }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-btn share"
                      onClick={(e) => handleShareTrip(trip, e)}
                    >
                      <FaShare />
                    </button>
                    <button 
                      className="action-btn download"
                      onClick={(e) => handleDownloadTrip(trip, e)}
                    >
                      <FaDownload />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={(e) => handleDeleteTrip(trip.id, e)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Favorites Section */}
          <div className="favorites-section">
            <div className="favorites-header" onClick={toggleFavorites}>
              <h3 className="sidebar-section-title">
                <FaStar />
                Favorites
              </h3>
              <button className="favorites-toggle">
                {favoritesExpanded ? '' : ''}
                <FaChevronDown style={{ 
                  transform: favoritesExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease'
                }} />
              </button>
            </div>
            <div className={`favorites-content ${favoritesExpanded ? 'expanded' : ''}`}>
              <div className="favorites-list">
                {filteredFavorites.map(trip => (
                  <div
                    key={trip.id}
                    className={`trip-item favorite ${activeTrip?.id === trip.id ? 'active' : ''}`}
                    onClick={() => setActiveTrip(trip)}
                  >
                    <div className="trip-item-header">
                      <h4 className="trip-item-title">{trip.title}</h4>
                      <span className="favorite-indicator">
                        <RiHeartFill />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.username} />
              ) : (
                <FaUser />
              )}
            </div>
            <div className="user-details">
              <span className="username">{user?.username}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <div className="user-menu">
            <button className="menu-btn">
              <RiUserSettingsLine />
            </button>
            <div className="dropdown-menu">
              <button onClick={() => navigate('/dashboard')}>
                <FaChartBar />
                <span className="dropdown-text">Dashboard</span>
              </button>
              <button>
                <FaUser />
                <span className="dropdown-text">Profile</span>
              </button>
              <button>
                <FaCog />
                <span className="dropdown-text">Settings</span>
              </button>
              <button onClick={() => {
                localStorage.clear();
                navigate('/');
              }}>
                <FaSignOutAlt />
                <span className="dropdown-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <>
                <FaChevronLeft className="close-icon" />
              </>
            ) : (
              <FaChevronRight />
            )}
          </button>
          <h1 className="page-title">AI Trip Planner</h1>
        </div>

        <div className="chat-container">
          {activeTrip ? (
            <div className="trip-details">
              <div className="trip-header">
                <div className="trip-title-section">
                  <h2>{activeTrip.title}</h2>
                </div>
                <div className="trip-meta">
                  <span className="trip-date">
                    {new Date(activeTrip.timestamp).toLocaleDateString()}
                  </span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopyContent(activeTrip.content)}
                    title="Copy trip content"
                  >
                    <FaCopy />
                  </button>
                  <span className="trip-type">{activeTrip.type}</span>
                </div>
              </div>
              <div className="trip-content">
                <pre>{activeTrip.content}</pre>
              </div>
            </div>
          ) : (
            <div className="welcome-message">
              <div className="welcome-icon">
                <FaPlane />
              </div>
              <h2>Welcome to AI Trip Planner</h2>
              <p>Describe your dream trip and let AI create a personalized itinerary for you!</p>
              <div className="example-prompts">
                <h4>Try these examples:</h4>
                <div className="prompt-examples">
                  <button onClick={() => setPrompt("Plan a 7-day romantic getaway to Paris with budget under $3000")}>
                    <RiHeartFill />
                    Romantic Paris getaway
                  </button>
                  <button onClick={() => setPrompt("Create a 10-day family adventure in Thailand with kids aged 8 and 12")}>
                    <FaUser />
                    Thailand family adventure
                  </button>
                  <button onClick={() => setPrompt("Design a 5-day solo backpacking trip through Japan's temples")}>
                    <FaBolt />
                    Japan solo backpacking
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Start asking AI to plan a trip"
                className="prompt-input"
                rows="3"
                disabled={isGenerating}
              />
              <button
                onClick={handleCreateTrip}
                disabled={!prompt.trim() || isGenerating}
                className="send-btn"
              >
                {isGenerating ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <FaPaperPlane />
                )}
              </button>
              
            </div>
            <div className="input-footer">
              <span className="tip-text">
                <FaBolt />
                Be specific about duration, budget, interests, and travel style for better results
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;