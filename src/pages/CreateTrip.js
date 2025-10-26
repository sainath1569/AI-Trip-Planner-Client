// src/pages/CreateTrip/CreateTrip.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaPlane, 
  FaSearch, 
  FaShare, 
  FaDownload, 
  FaTrash,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChartBar,
  FaBolt,
  FaPaperPlane,
  FaCopy,
  FaChevronDown,
  FaThumbtack,
  FaCompass,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers
} from 'react-icons/fa';
import { 
  HiSparkles,
  HiMap
} from 'react-icons/hi';
import '../styles/CreateTrip.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Updated Chat Message Component
const ChatMessage = ({ message, isUser, onCopy, onDownload }) => {
  const [showHeader, setShowHeader] = useState(false);

  return (
    <div 
      className={`chat-message-ct ${isUser ? 'user-message-ct' : 'ai-message-ct'}`}
      onMouseEnter={() => !isUser && setShowHeader(true)}
      onMouseLeave={() => !isUser && setShowHeader(false)}
    >
      <div className="message-avatar-ct">
        {isUser ? <FaUser /> : <HiSparkles />}
      </div>
      <div className="message-content-ct">
        {!isUser && showHeader && (
          <div className="ai-message-header-ct">
            <div className="ai-header-actions-ct">
              <button 
                className="header-action-btn-ct copy-btn-ct"
                onClick={() => onCopy(message)}
                title="Copy this response"
              >
                <FaCopy /> Copy
              </button>
              <button 
                className="header-action-btn-ct download-btn-ct"
                onClick={() => onDownload(message)}
                title="Download as PDF"
              >
                <FaDownload /> PDF
              </button>
            </div>
          </div>
        )}
        <div className="message-text-ct">{message}</div>
      </div>
    </div>
  );
};

const CreateTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trips, setTrips] = useState([]);
  const [pinnedPlans, setPinnedPlans] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [pinnedExpanded, setPinnedExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const chatContainerRef = useRef(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  };

  // Enhanced API call function
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
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
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response;
  };

  // API Calls
  const fetchUserProfile = async () => {
    try {
      const response = await makeAuthenticatedRequest('/auth/me');
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.message.includes('Session expired') || error.message.includes('No authentication token')) {
        navigate('/login');
      }
    }
  };

  const fetchTravelPlans = async () => {
    try {
      const response = await makeAuthenticatedRequest('/plans/');
      const plans = await response.json();
      setTrips(plans);
      
      // Initialize pinned plans from localStorage
      const savedPinned = localStorage.getItem('pinnedPlans');
      if (savedPinned) {
        const pinnedIds = JSON.parse(savedPinned);
        const pinned = plans.filter(plan => pinnedIds.includes(plan.id));
        setPinnedPlans(pinned);
      }
    } catch (error) {
      console.error('Error fetching travel plans:', error);
    }
  };

  // Fetch specific trip details
  const fetchTripDetails = async (planId) => {
    try {
      const response = await makeAuthenticatedRequest(`/plans/${planId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching trip details:', error);
      return null;
    }
  };

  // Generate travel plan
  const generateTravelPlan = async (planData) => {
    try {
      const response = await makeAuthenticatedRequest('/plans/generate', {
        method: 'POST',
        body: JSON.stringify(planData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating travel plan:', error);
      throw error;
    }
  };

  const deleteTravelPlan = async (planId) => {
    try {
      const response = await makeAuthenticatedRequest(`/plans/${planId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting travel plan:', error);
      return false;
    }
  };

  // Pin/Unpin functionality
  const togglePinPlan = (planId, e) => {
    e.stopPropagation();
    
    const savedPinned = localStorage.getItem('pinnedPlans');
    let pinnedIds = savedPinned ? JSON.parse(savedPinned) : [];
    
    if (pinnedIds.includes(planId)) {
      // Unpin
      pinnedIds = pinnedIds.filter(id => id !== planId);
      setPinnedPlans(prev => prev.filter(plan => plan.id !== planId));
    } else {
      // Pin
      pinnedIds.push(planId);
      const planToPin = trips.find(plan => plan.id === planId);
      if (planToPin) {
        setPinnedPlans(prev => [...prev, planToPin]);
      }
    }
    
    localStorage.setItem('pinnedPlans', JSON.stringify(pinnedIds));
  };

  const isPlanPinned = (planId) => {
    const savedPinned = localStorage.getItem('pinnedPlans');
    const pinnedIds = savedPinned ? JSON.parse(savedPinned) : [];
    return pinnedIds.includes(planId);
  };

  // Parse prompt to extract trip details
  const parsePrompt = (promptText) => {
    const durationMatch = promptText.match(/(\d+)-?day/i) || promptText.match(/(\d+)\s*days?/i);
    const destinationMatch = promptText.match(/to\s+([^,.!?]+)/i) || promptText.match(/in\s+([^,.!?]+)/i);
    const budgetMatch = promptText.match(/\$(\d+)/i) || promptText.match(/(\d+)\s*(USD|dollars)/i);
    
    return {
      duration: durationMatch ? parseInt(durationMatch[1]) : 7,
      destination: destinationMatch ? destinationMatch[1].trim() : 'Custom Destination',
      budget: budgetMatch ? parseInt(budgetMatch[1]) : null,
      currency: 'USD',
      preferences: [],
      group_size: 1
    };
  };

  // Copy individual AI message
  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('Message copied to clipboard!');
    }
  };

  // Download individual AI message as PDF
  const handleDownloadMessageAsPDF = (content) => {
    try {
      const printWindow = window.open('', '_blank');
      const tripTitle = activeTrip?.title || 'Travel Plan';
      
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${tripTitle}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #f59e0b;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .trip-title {
              color: #f59e0b;
              font-size: 24px;
              margin: 0;
            }
            .trip-meta {
              color: #666;
              font-size: 14px;
              margin: 5px 0;
            }
            .content {
              white-space: pre-wrap;
              font-size: 14px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .header { margin-top: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="trip-title">${tripTitle}</h1>
            ${activeTrip ? `
              <div class="trip-meta">
                ${activeTrip.destination} • ${activeTrip.duration} days
                ${activeTrip.budget ? ` • ${activeTrip.currency} ${activeTrip.budget}` : ''}
              </div>
            ` : ''}
            <div class="trip-meta">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </div>
          <div class="content">${content}</div>
          <div class="footer">
            Created with WanderAI • ${window.location.origin}
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download as PDF');
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        navigate('/login');
        return;
      }

      try {
        await fetchUserProfile();
        await fetchTravelPlans();

        const tripId = searchParams.get('trip');
        if (tripId) {
          const tripToEdit = trips.find(trip => trip.id === parseInt(tripId));
          if (tripToEdit) {
            const fullTripDetails = await fetchTripDetails(tripToEdit.id);
            if (fullTripDetails) {
              setActiveTrip(fullTripDetails);
              setConversation([
                {
                  message: fullTripDetails.content || `I've created a ${fullTripDetails.duration}-day trip to ${fullTripDetails.destination} for you!`,
                  isUser: false,
                  timestamp: new Date().toISOString()
                }
              ]);
            }
          }
        }
      } catch (error) {
        console.error('Initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [searchParams, navigate]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Handle trip click
  const handleTripClick = async (trip) => {
    console.log('🔄 Loading trip details for:', trip.title);
    
    setIsLoading(true);
    
    try {
      const fullTripDetails = await fetchTripDetails(trip.id);
      
      if (fullTripDetails) {
        setActiveTrip(fullTripDetails);
        setConversation([
          {
            message: fullTripDetails.content || `I've created a ${fullTripDetails.duration}-day trip to ${fullTripDetails.destination} for you!`,
            isUser: false,
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        setActiveTrip(trip);
        setConversation([
          {
            message: trip.content || `I've created a ${trip.duration}-day trip to ${trip.destination} for you!`,
            isUser: false,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading trip details:', error);
      setActiveTrip(trip);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
  if (!prompt.trim()) return;

  setIsGenerating(true);

  try {
    // Add user message to conversation
    const userMessage = {
      message: prompt,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');

    let response;

    if (activeTrip) {
      // ✅ USE NEW CHAT ENDPOINT for existing plans
      response = await makeAuthenticatedRequest(`/plans/chat/${activeTrip.id}?message=${encodeURIComponent(currentPrompt)}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      // Add AI response to conversation
      const aiMessage = {
        message: data.content || "I've updated your plan based on your request!",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
      // Update active trip with new content
      setActiveTrip(data);
      
    } else {
      // Create new trip
      const parsedDetails = parsePrompt(currentPrompt);
      const planData = {
        title: `${parsedDetails.duration}-Day Trip to ${parsedDetails.destination}`,
        destination: parsedDetails.destination,
        duration: parsedDetails.duration,
        budget: parsedDetails.budget,
        currency: parsedDetails.currency,
        preferences: parsedDetails.preferences,
        group_size: parsedDetails.group_size
      };

      response = await makeAuthenticatedRequest('/plans/generate', {
        method: 'POST',
        body: JSON.stringify(planData)
      });
      
      const data = await response.json();
      
      // Add AI response
      const aiMessage = {
        message: data.content || "I've created your travel plan!",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
      // Set as active trip
      setActiveTrip(data);
      
      // Add to trips list
      setTrips(prev => [data, ...prev]);
    }
    
  } catch (error) {
    console.error('Error in handleSendMessage:', error);
    
    let errorMessage = "Sorry, I encountered an error. Please try again.";
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage = "Unable to connect to the server. Please check your internet connection.";
    } else if (error.message.includes('Session expired')) {
      errorMessage = "Your session has expired. Please log in again.";
      navigate('/login');
    } else {
      errorMessage = error.message || "An unexpected error occurred.";
    }
    
    alert(`Error: ${errorMessage}`);
    
    // Add error message to conversation
    const errorMessageObj = {
      message: errorMessage,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    setConversation(prev => [...prev, errorMessageObj]);
  } finally {
    setIsGenerating(false);
  }
};


  const handleDeleteTrip = async (tripId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip?')) {
      const success = await deleteTravelPlan(tripId);
      if (success) {
        setTrips(prev => prev.filter(trip => trip.id !== tripId));
        setPinnedPlans(prev => prev.filter(plan => plan.id !== tripId));
        
        const savedPinned = localStorage.getItem('pinnedPlans');
        if (savedPinned) {
          const pinnedIds = JSON.parse(savedPinned).filter(id => id !== tripId);
          localStorage.setItem('pinnedPlans', JSON.stringify(pinnedIds));
        }
        
        if (activeTrip?.id === tripId) {
          setActiveTrip(null);
          setPrompt('');
          setConversation([]);
        }
      } else {
        alert('Failed to delete trip');
      }
    }
  };

  const handleShareTrip = async (trip, e) => {
    e.stopPropagation();
    const contentToShare = trip.content || `Trip to ${trip.destination}`;
    await navigator.clipboard.writeText(contentToShare.substring(0, 500));
    alert('Trip content copied to clipboard!');
  };

  const togglePinned = () => {
    setPinnedExpanded(!pinnedExpanded);
  };

  const handleNewTrip = () => {
    setActiveTrip(null);
    setPrompt('');
    setConversation([]);
  };

  const filteredTrips = trips.filter(trip =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPinned = pinnedPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container-ct">
        <div className="loading-spinner-large-ct"></div>
        <p>Loading your travel plans...</p>
      </div>
    );
  }

  return (
    <div className={`trip-planner-ct ${sidebarOpen ? 'sidebar-open-ct' : 'sidebar-closed-ct'}`}>
      {/* Sidebar */}
      <div className="sidebar-ct">
        <div className="sidebar-header-ct">
          <button 
            className="new-trip-btn-ct"
            onClick={handleNewTrip}
          >
            <HiSparkles />
            New Trip
          </button>
          <div className="search-container-ct">
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-ct"
            />
            <span className="search-icon-ct">
              <FaSearch />
            </span>
          </div>
        </div>

        <div className="sidebar-content-ct">
          {/* Trip History */}
          <div className="trip-history-ct">
            <h3 className="sidebar-section-title-ct">
              <FaCompass />
              Recent Trips
            </h3>
            <div className="trip-list-ct">
              {filteredTrips.length === 0 ? (
                <div className="empty-state-ct">
                  <p>No trips yet</p>
                  <p className="empty-subtitle-ct">Create your first trip to get started!</p>
                </div>
              ) : (
                filteredTrips.map(trip => (
                  <div
                    key={trip.id}
                    className={`trip-item-ct ${activeTrip?.id === trip.id ? 'active-ct' : ''}`}
                    onClick={() => handleTripClick(trip)}
                  >
                    <div className="trip-item-header-ct">
                      <h4 className="trip-item-title-ct">{trip.title}</h4>
                    </div>
                    <p className="trip-item-preview-ct">
                      {trip.destination} • {trip.duration} days
                      {trip.budget && ` • ${trip.currency} ${trip.budget}`}
                    </p>
                    <div className="trip-item-actions-ct">
                      <button 
                        className={`action-btn-ct pin-btn-ct ${isPlanPinned(trip.id) ? 'pinned-ct' : ''}`}
                        onClick={(e) => togglePinPlan(trip.id, e)}
                        title={isPlanPinned(trip.id) ? "Unpin plan" : "Pin plan"}
                      >
                        <FaThumbtack />
                      </button>
                      <button 
                        className="action-btn-ct share-ct"
                        onClick={(e) => handleShareTrip(trip, e)}
                        title="Share"
                      >
                        <FaShare />
                      </button>
                      <button 
                        className="action-btn-ct delete-ct"
                        onClick={(e) => handleDeleteTrip(trip.id, e)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pinned Section */}
          <div className="pinned-section-ct">
            <div className="pinned-header-ct" onClick={togglePinned}>
              <h3 className="sidebar-section-title-ct">
                <FaThumbtack />
                Pinned Plans
              </h3>
              <button className="pinned-toggle-ct">
                <FaChevronDown style={{ 
                  transform: pinnedExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease'
                }} />
              </button>
            </div>
            <div className={`pinned-content-ct ${pinnedExpanded ? 'expanded-ct' : 'collapsed-ct'}`}>
              <div className="pinned-list-ct">
                {filteredPinned.length === 0 ? (
                  <div className="empty-state-ct">
                    <p>No pinned plans yet</p>
                    <p className="empty-subtitle-ct">Click the pin icon on trips to pin them</p>
                  </div>
                ) : (
                  filteredPinned.map(plan => (
                    <div
                      key={plan.id}
                      className="trip-item-ct pinned-ct"
                      onClick={() => handleTripClick(plan)}
                    >
                      <div className="trip-item-header-ct">
                        <h4 className="trip-item-title-ct">{plan.title}</h4>
                        <span className="pinned-indicator-ct">
                          <FaThumbtack />
                        </span>
                      </div>
                      <p className="trip-item-preview-ct">
                        {plan.destination} • {plan.duration} days
                        {plan.budget && ` • ${plan.currency} ${plan.budget}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="user-section-ct">
          <div className="user-info-ct">
            <div className="user-avatar-ct">
              <FaUser />
            </div>
            <div className="user-details-ct">
              <span className="username-ct">{user?.username || 'Traveler'}</span>
              <span className="user-email-ct">{user?.email}</span>
            </div>
          </div>
          <div className="user-menu-ct">
            <button className="menu-btn-ct">
              <FaCog />
            </button>
            <div className="dropdown-menu-ct">
              <button onClick={() => navigate('/dashboard')}>
                <FaChartBar />
                <span className="dropdown-text-ct">Dashboard</span>
              </button>
              <button>
                <FaUser />
                <span className="dropdown-text-ct">Profile</span>
              </button>
              <button>
                <FaCog />
                <span className="dropdown-text-ct">Settings</span>
              </button>
              <button onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');
                navigate('/');
              }}>
                <FaSignOutAlt />
                <span className="dropdown-text-ct">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-ct">
        <div className="content-header-ct">
          <div className="header-content-ct">
            <h1 className="page-title-ct">
              {activeTrip ? activeTrip.title : 'AI Trip Planner'}
            </h1>
            {user && (
              <p className="welcome-text-ct">
                Welcome back, {user.username}! {activeTrip ? 'Continue planning your trip' : 'Describe your dream trip below'}
              </p>
            )}
          </div>
        </div>

        <div className="chat-container-ct">
          {activeTrip ? (
            <div className="trip-details-ct">
              {/* Trip Meta Information */}
              <div className="trip-meta-info-ct">
                <div className="meta-item-ct">
                  <FaMapMarkerAlt className="meta-icon-ct" />
                  <span>{activeTrip.destination}</span>
                </div>
                <div className="meta-item-ct">
                  <FaCalendarAlt className="meta-icon-ct" />
                  <span>{activeTrip.duration} days</span>
                </div>
                {activeTrip.budget && (
                  <div className="meta-item-ct">
                    <FaMoneyBillWave className="meta-icon-ct" />
                    <span>{activeTrip.currency} {activeTrip.budget}</span>
                  </div>
                )}
                <div className="meta-item-ct">
                  <FaUsers className="meta-icon-ct" />
                  <span>{activeTrip.group_size || 1} traveler(s)</span>
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="chat-interface-ct" ref={chatContainerRef}>
                <div className="chat-messages-ct">
                  {conversation.length === 0 ? (
                    <div className="no-conversation-ct">
                      <p>Start a conversation about your trip!</p>
                      <p>Ask questions like:</p>
                      <ul>
                        <li>"Can you add more details about day 2?"</li>
                        <li>"What are the best restaurants in the area?"</li>
                        <li>"Can you suggest alternative activities?"</li>
                      </ul>
                    </div>
                  ) : (
                    conversation.map((msg, index) => (
                      <ChatMessage
                        key={index}
                        message={msg.message}
                        isUser={msg.isUser}
                        onCopy={handleCopyMessage}
                        onDownload={handleDownloadMessageAsPDF}
                      />
                    ))
                  )}
                  {isGenerating && (
                    <div className="chat-message-ct ai-message-ct">
                      <div className="message-avatar-ct">
                        <HiSparkles />
                      </div>
                      <div className="message-content-ct">
                        <div className="loading-dots-ct">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="welcome-message-ct">
              <div className="welcome-icon-ct">
                <HiSparkles />
              </div>
              <h2>Plan Your Perfect Journey</h2>
              <p>Describe your dream trip and let AI create a personalized itinerary for you!</p>
              <div className="example-prompts-ct">
                <h4>Try these examples:</h4>
                <div className="prompt-examples-ct">
                  <button onClick={() => setPrompt("Plan a 7-day romantic getaway to Paris with budget under $3000")}>
                    <FaCompass />
                    Romantic Paris getaway
                  </button>
                  <button onClick={() => setPrompt("Create a 10-day family adventure in Thailand with kids aged 8 and 12")}>
                    <FaCompass />
                    Thailand family adventure
                  </button>
                  <button onClick={() => setPrompt("Design a 5-day solo backpacking trip through Japan's temples")}>
                    <FaCompass />
                    Japan solo backpacking
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="input-container-ct">
            <div className="input-wrapper-ct">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeTrip 
                    ? "Ask questions or request changes to your trip plan..." 
                    : "E.g., Plan a 7-day beach vacation in Bali for 2 people with $2000 budget"
                }
                className="prompt-input-ct"
                rows="3"
                disabled={isGenerating}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!prompt.trim() || isGenerating}
                className="send-btn-ct"
              >
                {isGenerating ? (
                  <div className="loading-spinner-ct"></div>
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
            <div className="input-footer-ct">
              <span className="tip-text-ct">
                <FaBolt />
                {activeTrip 
                  ? "Continue the conversation to refine your travel plan"
                  : "Be specific about duration, destination, budget, and preferences for better results"
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;