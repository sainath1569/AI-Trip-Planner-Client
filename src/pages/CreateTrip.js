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
  FaThumbtack
} from 'react-icons/fa';
import { 
  RiUserSettingsLine
} from 'react-icons/ri';
import '../styles/CreateTrip.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Updated Chat Message Component with fixed header for AI responses
const ChatMessage = ({ message, isUser, onCopy, onDownload }) => {
  const [showHeader, setShowHeader] = useState(false);

  return (
    <div 
      className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}
      onMouseEnter={() => !isUser && setShowHeader(true)}
      onMouseLeave={() => !isUser && setShowHeader(false)}
    >
      <div className="message-avatar">
        {isUser ? <FaUser /> : <FaPlane />}
      </div>
      <div className="message-content">
        {/* Fixed header for AI messages */}
        {!isUser && showHeader && (
          <div className="ai-message-header">
            <div className="ai-header-actions">
              <button 
                className="header-action-btn copy-btn"
                onClick={() => onCopy(message)}
                title="Copy this response"

              >
                <FaCopy /> Copy
              </button>
              <button 
                className="header-action-btn download-btn"
                onClick={() => onDownload(message)}
                title="Download as PDF"
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>
        )}
        <pre>{message}</pre>
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
  const [pinnedExpanded, setPinnedExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const chatContainerRef = useRef(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  };

  // Enhanced API call function with proper error handling
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

  // SINGLE ROUTE: Use only /generate for everything
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

  // Parse prompt to extract trip details for new trips
  const parsePrompt = (promptText) => {
    const durationMatch = promptText.match(/(\d+)-?day/i) || promptText.match(/(\d+)\s*days?/i);
    const destinationMatch = promptText.match(/to\s+([^,.!?]+)/i) || promptText.match(/in\s+([^,.!?]+)/i);
    
    return {
      duration: durationMatch ? parseInt(durationMatch[1]) : 7,
      destination: destinationMatch ? destinationMatch[1].trim() : 'Custom Destination',
      budget: null,
      currency: 'USD',
      preferences: [],
      group_size: 1
    };
  };

  // Copy individual AI message
  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a small toast notification here instead of alert
      console.log('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for browsers that don't support clipboard API
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
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      
      // Get trip title for the PDF filename
      const tripTitle = activeTrip?.title || 'Travel Plan';
      
      // Create PDF content with styling
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
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .trip-title {
              color: #4f46e5;
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
              border-left: 4px solid #4f46e5;
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
            Created with AI Trip Planner • ${window.location.origin}
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Wait for content to load then print as PDF
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing
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
              // Initialize conversation with existing content
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

  // Handle trip click - load the full plan
  const handleTripClick = async (trip) => {
    console.log('🔄 Loading trip details for:', trip.title);
    
    setIsLoading(true);
    
    try {
      const fullTripDetails = await fetchTripDetails(trip.id);
      
      if (fullTripDetails) {
        setActiveTrip(fullTripDetails);
        // Initialize conversation with existing content
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

  // Use only /generate route for everything
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
      setPrompt('');

      let planData;

      if (activeTrip) {
        // Continue conversation - send message with plan_id
        planData = {
          message: prompt,
          plan_id: activeTrip.id,
          // Include conversation context for better responses
          conversation_context: conversation.slice(-5).map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.message
          }))
        };
      } else {
        // Create new trip
        const parsedDetails = parsePrompt(prompt);
        planData = {
          title: `${parsedDetails.duration}-Day Trip to ${parsedDetails.destination}`,
          destination: parsedDetails.destination,
          duration: parsedDetails.duration,
          budget: parsedDetails.budget,
          currency: parsedDetails.currency,
          preferences: parsedDetails.preferences,
          group_size: parsedDetails.group_size,
          message: prompt
        };
      }

      const response = await generateTravelPlan(planData);
      
      if (response) {
        // Add AI response to conversation
        const aiMessage = {
          message: response.content || "I've processed your request!",
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => [...prev, aiMessage]);
        
        if (!activeTrip && response.id) {
          // This is a new trip - add to trips list
          setTrips(prev => [response, ...prev]);
          setActiveTrip(response);
        } else if (activeTrip) {
          // Update existing trip with new content
          setActiveTrip(prev => ({
            ...prev,
            content: response.content || prev.content
          }));
        }
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
        // Remove from trips
        setTrips(prev => prev.filter(trip => trip.id !== tripId));
        
        // Remove from pinned plans
        setPinnedPlans(prev => prev.filter(plan => plan.id !== tripId));
        
        // Remove from localStorage
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
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Loading your travel plans...</p>
      </div>
    );
  }

  return (
    <div className={`trip-planner ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button 
            className="new-trip-btn"
            onClick={handleNewTrip}
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
          {/* Trip History */}
          <div className="trip-history" style={{ 
            flex: pinnedExpanded ? 0 : 1,
            display: pinnedExpanded ? 'none' : 'block'
          }}>
            <h3 className="sidebar-section-title">
              <FaChartBar />
              Recent Trips
            </h3>
            <div className="trip-list">
              {filteredTrips.length === 0 ? (
                <div className="empty-state">
                  <p>No trips yet</p>
                  <p className="empty-subtitle">Create your first trip to get started!</p>
                </div>
              ) : (
                filteredTrips.map(trip => (
                  <div
                    key={trip.id}
                    className={`trip-item ${activeTrip?.id === trip.id ? 'active' : ''}`}
                    onClick={() => handleTripClick(trip)}
                  >
                    <div className="trip-item-header">
                      <h4 className="trip-item-title">{trip.title}</h4>
                    </div>
                    <p className="trip-item-preview">
                      {trip.destination} • {trip.duration} days
                      {trip.budget && ` • ${trip.currency} ${trip.budget}`}
                    </p>
                    <div className="trip-item-actions">
                      <button 
                        className={`action-btn pin-btn ${isPlanPinned(trip.id) ? 'pinned' : ''}`}
                        onClick={(e) => togglePinPlan(trip.id, e)}
                        title={isPlanPinned(trip.id) ? "Unpin plan" : "Pin plan"}
                      >
                        <FaThumbtack />
                      </button>
                      <button 
                        className="action-btn share"
                        onClick={(e) => handleShareTrip(trip, e)}
                        title="Share"
                      >
                        <FaShare />
                      </button>
                      <button 
                        className="action-btn delete"
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

          {/* Collapsible Pinned Section */}
          <div className="pinned-section">
            <div className="pinned-header" onClick={togglePinned}>
              <h3 className="sidebar-section-title">
                <FaThumbtack />
                Pinned Plans
              </h3>
              <button className="pinned-toggle">
                <FaChevronDown style={{ 
                  transform: pinnedExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease'
                }} />
              </button>
            </div>
            <div className={`pinned-content ${pinnedExpanded ? 'expanded' : 'collapsed'}`}>
              <div className="pinned-list">
                {filteredPinned.length === 0 ? (
                  <div className="empty-state">
                    <p>No pinned plans yet</p>
                    <p className="empty-subtitle">Click the pin icon on trips to pin them</p>
                  </div>
                ) : (
                  filteredPinned.map(plan => (
                    <div
                      key={plan.id}
                      className="trip-item pinned"
                      onClick={() => handleTripClick(plan)}
                    >
                      <div className="trip-item-header">
                        <h4 className="trip-item-title">{plan.title}</h4>
                        <span className="pinned-indicator">
                          <FaThumbtack />
                        </span>
                      </div>
                      <p className="trip-item-preview">
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
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <span className="username">{user?.username || 'Traveler'}</span>
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
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');
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
          <div className="header-content">
            <h1 className="page-title">
              {activeTrip ? 'Travel Plan Chat' : 'AI Trip Planner'}
            </h1>
            {user && (
              <p className="welcome-text">
                Welcome back, {user.username}! {activeTrip ? 'Continue planning your trip' : 'Describe your dream trip below'}
              </p>
            )}
          </div>
        </div>

        <div className="chat-container">
          {activeTrip ? (
            <div className="trip-details">
              {/* FIXED HEADER - Stays at top while chat scrolls */}
              <div className="chat-header-fixed">
                <div className="chat-header-content">
                  <div className="chat-title-section">
                    <h2>{activeTrip.title}</h2>
                    <div className="chat-meta">
                      {activeTrip.budget && (
                        <span className="chat-budget">{activeTrip.currency} {activeTrip.budget}</span>
                      )}
                    </div>
                  </div>
                  <div className="chat-actions-fixed">
                    <button 
                      className={`action-btn pin-btn ${isPlanPinned(activeTrip.id) ? 'pinned' : ''}`}
                      onClick={(e) => togglePinPlan(activeTrip.id, e)}
                      title={isPlanPinned(activeTrip.id) ? "Unpin plan" : "Pin plan"}
                    >
                      <FaThumbtack />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Chat Interface - Scrolls independently */}
              <div className="chat-interface" ref={chatContainerRef}>
                <div className="chat-messages">
                  {conversation.length === 0 ? (
                    <div className="no-conversation">
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
                    <div className="chat-message ai-message">
                      <div className="message-avatar">
                        <FaPlane />
                      </div>
                      <div className="message-content">
                        <div className="loading-dots">
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
                    Romantic Paris getaway
                  </button>
                  <button onClick={() => setPrompt("Create a 10-day family adventure in Thailand with kids aged 8 and 12")}>
                    Thailand family adventure
                  </button>
                  <button onClick={() => setPrompt("Design a 5-day solo backpacking trip through Japan's temples")}>
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
                placeholder={
                  activeTrip 
                    ? "Ask questions or request changes to your trip plan..." 
                    : "E.g., Plan a 7-day beach vacation in Bali for 2 people with $2000 budget"
                }
                className="prompt-input"
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