import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaSignOutAlt,
  FaCamera,
  FaUserCircle,
  FaCompass,
  FaSparkles
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import '../styles/Profile.css';

const API_BASE_URL = 'https://ai-way-2-vacation.onrender.com';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  };

  // Load profile picture from localStorage
  useEffect(() => {
    const savedProfilePic = localStorage.getItem('profile_pic');
    if (savedProfilePic) {
      setProfilePic(savedProfilePic);
    }
  }, []);

  // API call function
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      handleLogout();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response;
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest('/auth/me');
      const userData = await response.json();
      setUser(userData);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle profile picture upload
  const handleProfilePicUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setProfilePic(imageDataUrl);
        localStorage.setItem('profile_pic', imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('profile_pic');
    localStorage.removeItem('lastActiveTripId');
    localStorage.removeItem('pinnedPlans');
    navigate('/login');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container-pp">
        <div className="loading-spinner-large-pp"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <h2>Profile Not Found</h2>
        <p>Unable to load your profile information.</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="profile-page-pp">
      {/* Header */}
      <div className="content-header-pp">
        <div className="header-content-pp">
          <h1 className="page-title-pp">
            <HiSparkles />
            My Profile
          </h1>
          <p className="welcome-text-pp">
            Welcome back, {user.username}! Manage your account and preferences.
          </p>
        </div>
      </div>

      <div className="profile-content-pp">
        {/* Profile Card */}
        <div className="profile-card-pp">
          {/* Profile Picture Section */}
          <div className="profile-pic-section-pp">
            <div className="profile-pic-container-pp">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="profile-pic-pp" />
              ) : (
                <FaUserCircle className="profile-pic-placeholder-pp" />
              )}
              <button 
                className="change-photo-btn-pp"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaCamera />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePicUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="user-info-section-pp">
            <div className="user-details-pp">
              <h2 className="username-pp">{user.username}</h2>
              <p className="user-email-pp">
                <FaEnvelope />
                {user.email}
              </p>
              {user.created_at && (
                <p className="member-since-pp">
                  <FaCalendarAlt />
                  Member since {formatDate(user.created_at)}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-pp">
            <div className="action-buttons-pp">
              <button 
                className="action-btn-pp primary"
                onClick={() => navigate('/create-trip')}
              >
                <HiSparkles />
                Create New Trip
              </button>
              <button 
                className="action-btn-pp secondary"
                onClick={() => navigate('/Dashboard')}
              >
                <FaCompass />
                Explore Home
              </button>
              <button 
                className="action-btn-pp logout"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;