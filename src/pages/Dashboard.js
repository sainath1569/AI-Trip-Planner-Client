// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlane, 
  FaChartBar, 
  FaBolt,
  FaCloud,
  FaMoneyBillWave,
  FaSync,
  FaCompass,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar
} from 'react-icons/fa';
import { GiPalmTree } from 'react-icons/gi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    apiUsage: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [currencyRates, setCurrencyRates] = useState(null);
  const [converter, setConverter] = useState({
    amount: 1,
    from: 'USD',
    to: 'EUR',
    result: 0
  });
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState('Kolkata');

  const API_BASE = 'http://127.0.0.1:8000';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  };

  // FIXED: Enhanced API call function - only add auth when needed
  const makeAuthenticatedRequest = async (endpoint, options = {}, requiresAuth = true) => {
    const token = getAuthToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Only add Authorization header if endpoint requires auth AND token exists
    if (requiresAuth) {
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      // Only handle 401 for authenticated requests
      if (requiresAuth && response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };

  // FIXED: Make unauthenticated requests for public endpoints
  const makePublicRequest = async (endpoint, options = {}) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };

  // Popular currencies array
  const popularCurrencies = [
    { code: 'USD', name: 'US Dollar', country: 'United States' },
    { code: 'EUR', name: 'Euro', country: 'European Union' },
    { code: 'GBP', name: 'British Pound', country: 'United Kingdom' },
    { code: 'JPY', name: 'Japanese Yen', country: 'Japan' },
    { code: 'CAD', name: 'Canadian Dollar', country: 'Canada' },
    { code: 'AUD', name: 'Australian Dollar', country: 'Australia' },
    { code: 'CHF', name: 'Swiss Franc', country: 'Switzerland' },
    { code: 'CNY', name: 'Chinese Yuan', country: 'China' },
    { code: 'INR', name: 'Indian Rupee', country: 'India' },
    { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore' }
  ];

  useEffect(() => {
    fetchUserLocation();
    fetchUserData();
    fetchDashboardData();
    fetchCurrencyRates();
  }, []);

  // Fetch user's location
  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || 'Kolkata';
            setUserLocation(city);
            fetchWeatherData(city);
          } catch (error) {
            console.error('Error fetching location:', error);
            setUserLocation('Kolkata');
            fetchWeatherData('Kolkata');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserLocation('Kolkata');
          fetchWeatherData('Kolkata');
        }
      );
    } else {
      setUserLocation('Kolkata');
      fetchWeatherData('Kolkata');
    }
  };

  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No token found, user data will be limited');
        const userData = {
          username: 'Traveler',
          email: ''
        };
        setUser(userData);
        return;
      }

      const userData = {
        username: localStorage.getItem('username') || 'Traveler',
        email: localStorage.getItem('email') || ''
      };
      setUser(userData);

      // Fetch user stats with proper error handling
      try {
        const statsResponse = await makeAuthenticatedRequest('/users/me/stats');
        const userStats = await statsResponse.json();
        setStats({
          totalPlans: userStats.total_plans || 0,
          apiUsage: userStats.total_queries || 0
        });
      } catch (error) {
        console.warn('Stats endpoint not available, using mock data:', error);
        setStats({
          totalPlans: 5,
          apiUsage: 85
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't navigate to login for user data errors
      if (error.message.includes('Session expired')) {
        console.warn('Session expired, continuing with limited functionality');
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch recent trips
      try {
        const historyResponse = await makeAuthenticatedRequest('/users/me/history?limit=6');
        const queries = await historyResponse.json();
        const formattedTrips = queries.map((query, index) => ({
          id: query.id || index,
          title: query.query_text?.substring(0, 30) + (query.query_text?.length > 30 ? '...' : '') || `Trip ${index + 1}`,
          date: new Date(query.created_at).toLocaleDateString(),
          location: ['Bali, Indonesia', 'Tokyo, Japan', 'Paris, France', 'New York, USA', 'Sydney, Australia', 'Dubai, UAE'][index % 6],
          type: ['beach', 'mountain', 'city', 'cultural', 'adventure', 'luxury'][index % 6],
          favorite: Math.random() > 0.7
        }));
        setRecentTrips(formattedTrips);
      } catch (error) {
        console.warn('History endpoint not available, using mock data:', error);
        const mockTrips = [
          { id: 1, title: 'Bali Beach Vacation', date: '2024-01-15', location: 'Bali, Indonesia', type: 'beach', favorite: true },
          { id: 2, title: 'Tokyo City Exploration', date: '2024-01-10', location: 'Tokyo, Japan', type: 'city', favorite: false },
          { id: 3, title: 'Paris Cultural Tour', date: '2024-01-05', location: 'Paris, France', type: 'cultural', favorite: true },
        ];
        setRecentTrips(mockTrips);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debug function to see what the API is actually returning
  const debugWeatherResponse = (response) => {
    console.log('=== WEATHER API DEBUG INFO ===');
    console.log('Full response:', response);
    console.log('Current weather object:', response.current_weather);
    console.log('Description:', response.current_weather?.description);
    console.log('Forecast:', response.forecast);
    console.log('City:', response.city);
    console.log('=== END DEBUG INFO ===');
  };

  // FIXED: Use public request for weather (no auth required)
  const fetchWeatherData = async (city = userLocation) => {
    try {
      console.log('Fetching weather for:', city);
      
      const response = await makePublicRequest('/weather/current', {
        method: 'POST',
        body: JSON.stringify({ city })
      });

      const weather = await response.json();
      
      // Debug the actual response
      debugWeatherResponse(weather);
      
      // Process the weather response with better temperature handling
      const processedWeather = processWeatherResponse(weather, city);
      setWeatherData(processedWeather);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Use mock data as fallback
      const mockWeather = generateMockWeather(city);
      setWeatherData(mockWeather);
    }
  };

  // Improved weather response processing
  const processWeatherResponse = (weatherResponse, city) => {
    const description = weatherResponse.current_weather?.description || '';
    
    // Extract temperature with multiple fallback methods
    let temperature = extractTemperatureFromDescription(description);
    
    // If temperature is unrealistic (like 305°C), use fallback
    if (temperature > 60 || temperature < -50) {
      console.warn('Unrealistic temperature detected, using fallback:', temperature);
      temperature = extractRealisticTemperature(description) || 25;
    }
    
    const condition = extractWeatherCondition(description);
    const icon = getWeatherIcon(condition);

    return {
      city: city,
      current_weather: {
        description: description,
        condition: condition,
        temperature: temperature,
        icon: icon
      }
    };
  };

  // Improved temperature extraction
  const extractTemperatureFromDescription = (description) => {
    if (!description) return 25;
    
    // First check if it's Kelvin (temperatures around 270-310)
    const kelvinMatch = description.match(/\b(\d{3})\b/);
    if (kelvinMatch) {
      const kelvinTemp = parseInt(kelvinMatch[1]);
      if (kelvinTemp > 250 && kelvinTemp < 320) {
        // Convert Kelvin to Celsius: K - 273.15
        const celsiusTemp = Math.round(kelvinTemp - 273.15);
        console.log(`Converted ${kelvinTemp}K to ${celsiusTemp}°C`);
        return celsiusTemp;
      }
    }
    
    // Try multiple patterns to extract temperature
    const patterns = [
      /\b(\d+)\s*°?C\b/i,        // 25°C or 25 C
      /\b(\d+)\s*degrees?\b/i,    // 25 degrees
      /temperature[^\d]*(\d+)/i,  // temperature: 25
      /\b(\d+)\s*F\b/i,          // 77F (Fahrenheit)
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        let temp = parseInt(match[1]);
        
        // Convert Fahrenheit to Celsius if needed
        if (pattern.toString().includes('F') && temp > 50) {
          temp = Math.round((temp - 32) * 5/9);
        }
        
        return temp;
      }
    }
    
    // Fallback: look for any number that could be a reasonable temperature
    const numberMatches = description.match(/\b(\d{1,2})\b/g);
    if (numberMatches) {
      const possibleTemps = numberMatches.map(Number).filter(temp => 
        temp >= -20 && temp <= 50
      );
      if (possibleTemps.length > 0) {
        return possibleTemps[0];
      }
    }
    
    return 25; // Default fallback
  };

  // Additional fallback for unrealistic temperatures
  const extractRealisticTemperature = (description) => {
    if (!description) return 25;
    
    // Look for temperature patterns that might be in different formats
    const patterns = [
      /(\d{1,2})°?C/i,           // 25C or 25°C
      /(\d{1,2})\s*celsius/i,     // 25 celsius
      /temp[^\d]*(\d{1,2})/i,     // temp 25
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        const temp = parseInt(match[1]);
        if (temp >= -20 && temp <= 50) {
          return temp;
        }
      }
    }
    
    return null;
  };

  const extractWeatherCondition = (description) => {
    if (!description) return 'Clear';
    const desc = description.toLowerCase();
    
    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) return 'Rainy';
    if (desc.includes('cloud') || desc.includes('overcast')) return 'Cloudy';
    if (desc.includes('sun') || desc.includes('clear') || desc.includes('fair')) return 'Sunny';
    if (desc.includes('snow') || desc.includes('flurries') || desc.includes('blizzard')) return 'Snow';
    if (desc.includes('storm') || desc.includes('thunder') || desc.includes('lightning')) return 'Thunderstorm';
    if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return 'Foggy';
    if (desc.includes('wind') || desc.includes('breezy')) return 'Windy';
    
    return 'Clear';
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'Sunny': '☀️',
      'Cloudy': '☁️',
      'Rainy': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Foggy': '🌫️',
      'Windy': '💨',
      'Clear': '☀️'
    };
    return icons[condition] || '☀️';
  };

  const fetchCurrencyRates = async (baseCurrency = 'INR') => {
    try {
      const response = await makePublicRequest(`/currency/rates/${baseCurrency}`);
      
      const ratesData = await response.json();
      console.log('Currency Rates API Response:', ratesData);
      
      setCurrencyRates(ratesData);
      
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      // Use mock rates as fallback
      const mockRates = generateMockRates(baseCurrency);
      setCurrencyRates(mockRates);
    }
  };

  // Mock exchange rates for fallback
  const getMockExchangeRate = (from, to) => {
    const rates = {
      USD: { EUR: 0.85, GBP: 0.73, JPY: 110.5, INR: 74.5, CAD: 1.25, AUD: 1.35, CHF: 0.92, CNY: 6.45, SGD: 1.34 },
      EUR: { USD: 1.18, GBP: 0.86, JPY: 130.0, INR: 87.5, CAD: 1.47, AUD: 1.59, CHF: 1.08, CNY: 7.59, SGD: 1.58 },
      // Add more rates as needed
    };
    
    return rates[from]?.[to] || 1;
  };

  // FIXED: Use public request for currency conversion (no auth required)
  const handleCurrencyConvert = async () => {
    try {
      console.log('Converting currency:', converter);
      
      const response = await makePublicRequest('/currency/convert', {
        method: 'POST',
        body: JSON.stringify({
          amount: converter.amount,
          from_currency: converter.from,
          to_currency: converter.to
        })
      });

      const result = await response.json();
      console.log('Currency Conversion API Response:', result);
      
      setConverter(prev => ({
        ...prev,
        result: result.converted_amount || 0
      }));
      
    } catch (error) {
      console.error('Error converting currency:', error);
      // Use mock conversion as fallback
      const mockRate = getMockExchangeRate(converter.from, converter.to);
      setConverter(prev => ({
        ...prev,
        result: prev.amount * mockRate
      }));
    }
  };

  // Helper functions for mock data (keep as fallback)
  const generateMockWeather = (city) => {
    const weatherConditions = [
      { condition: 'Sunny', temp: 28, icon: '☀️' },
      { condition: 'Partly Cloudy', temp: 24, icon: '⛅' },
      { condition: 'Cloudy', temp: 22, icon: '☁️' },
      { condition: 'Rainy', temp: 18, icon: '🌧️' },
    ];
    
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    return {
      city: city,
      current_weather: { 
        description: `${randomWeather.condition}, ${randomWeather.temp}°C`,
        condition: randomWeather.condition,
        temperature: randomWeather.temp,
        icon: randomWeather.icon
      }
    };
  };

  const generateMockRates = (baseCurrency) => {
    const baseRates = {
      USD: 1, EUR: 0.85, GBP: 0.73, JPY: 110.5, CAD: 1.25, AUD: 1.35,
      CHF: 0.92, CNY: 6.45, INR: 74.5, SGD: 1.34, NZD: 1.45, KRW: 1180
    };

    const baseValue = baseRates[baseCurrency] || 1;
    const rates = {};

    Object.keys(baseRates).forEach(currency => {
      if (currency !== baseCurrency) {
        rates[currency] = parseFloat((baseRates[currency] / baseValue).toFixed(4));
      }
    });

    return {
      base_currency: baseCurrency,
      rates: rates
    };
  };

  const handleCreateNewTrip = () => {
    navigate('/planner');
  };

  const handleTripClick = (tripId) => {
    navigate(`/planner?trip=${tripId}`);
  };

  const handleRefreshWeather = () => {
    fetchWeatherData(userLocation);
  };

  // Update converter when amount or currencies change
  useEffect(() => {
    if (currencyRates && currencyRates.rates && currencyRates.rates[converter.to]) {
      const rate = currencyRates.rates[converter.to];
      setConverter(prev => ({
        ...prev,
        result: prev.amount * rate
      }));
    }
  }, [converter.amount, converter.from, converter.to, currencyRates]);

  if (loading) {
    return (
      <div className="loading-container-db">
        <div className="loading-spinner-large-db"></div>
        <p>Loading your travel dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-db">
      {/* Background Effects */}
      <div className="dashboard-background-db">
        <div className="floating-element-db element-1-db"></div>
        <div className="floating-element-db element-2-db"></div>
        <div className="floating-element-db element-3-db"></div>
      </div>

      {/* Header */}
      <header className="content-header-db">
        <div className="header-content-db">
          <h1 className="page-title-db">
            Welcome back, {user?.username}!
          </h1>
          <p className="welcome-text-db">
            Ready to plan your next adventure?
          </p>
        </div>
        <button 
          className="new-trip-btn-db"
          onClick={handleCreateNewTrip}
        >
          <FaPlane className="btn-icon-db" />
          Create New Trip
        </button>
      </header>

      {/* Main Content */}
      <div className="dashboard-content-db">
        {/* Stats & Tools Section */}
        <div className="dashboard-grid-db">
          {/* Stats Section */}
          <div className="dashboard-section-db">
            <div className="stats-container-db">
              <div className="stat-card-db">
                <div className="stat-icon-wrapper-db">
                  <FaChartBar className="stat-icon-db" />
                </div>
                <div className="stat-content-db">
                  <h3>{stats.totalPlans}</h3>
                  <p>Plans Created</p>
                </div>
              </div>
              <div className="stat-card-db">
                <div className="stat-icon-wrapper-db">
                  <FaBolt className="stat-icon-db" />
                </div>
                <div className="stat-content-db">
                  <h3>{stats.apiUsage}%</h3>
                  <p>API Usage</p>
                  <div className="usage-bar-db">
                    <div 
                      className="usage-progress-db" 
                      style={{ width: `${stats.apiUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Weather Card */}
              <div className="tool-card-db">
                <div className="tool-header-db">
                  <FaCloud className="tool-icon-db" />
                  <h3>Weather Forecast</h3>
                  <button 
                    className="refresh-btn-db"
                    onClick={handleRefreshWeather}
                  >
                    <FaSync />
                  </button>
                </div>
                <div className="tool-content-db">
                  {weatherData ? (
                    <div className="weather-info-db">
                      <div className="weather-location-db">
                        <FaMapMarkerAlt className="location-icon-db" />
                        <span>{weatherData.city}</span>
                      </div>
                      <div className="weather-main-db">
                        <div className="weather-icon-db">
                          {weatherData.current_weather?.icon || '☀️'}
                        </div>
                        <div className="weather-details-db">
                          <div className="weather-temp-db">
                            {weatherData.current_weather?.temperature || '24'}°C
                          </div>
                          <div className="weather-desc-db">
                            {weatherData.current_weather?.condition || 'Sunny'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="weather-loading-db">Loading weather...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Currency Converter Section */}
          <div className="dashboard-section-db">
            <div className="tools-container-db">
              <div className="tool-card-db">
                <div className="tool-header-db">
                  <FaMoneyBillWave className="tool-icon-db" />
                  <h3>Currency Converter</h3>
                </div>
                <div className="tool-content-db">
                  <div className="converter-db">
                    <div className="converter-row-db">
                      <input
                        type="number"
                        value={converter.amount}
                        onChange={(e) => setConverter(prev => ({
                          ...prev,
                          amount: parseFloat(e.target.value) || 0
                        }))}
                        className="converter-input-db"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={converter.from}
                        onChange={(e) => {
                          setConverter(prev => ({
                            ...prev,
                            from: e.target.value
                          }));
                          fetchCurrencyRates(e.target.value);
                        }}
                        className="currency-select-db"
                      >
                        {popularCurrencies.map(currency => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="converter-row-db">
                      <div className="converted-amount-db">
                        {converter.result.toFixed(2)}
                      </div>
                      <select
                        value={converter.to}
                        onChange={(e) => setConverter(prev => ({
                          ...prev,
                          to: e.target.value
                        }))}
                        className="currency-select-db"
                      >
                        {popularCurrencies.map(currency => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button 
                      className="convert-btn-db"
                      onClick={handleCurrencyConvert}
                    >
                      Convert Currency
                    </button>

                    {currencyRates && (
                      <div className="exchange-rates-db">
                        <div className="rates-label-db">Current Rates (Base: {currencyRates.base_currency})</div>
                        <div className="rates-grid-db">
                          {Object.entries(currencyRates.rates || {})
                            .slice(0, 4)
                            .map(([currency, rate]) => (
                              <span key={currency}>
                                {currency}: {typeof rate === 'number' ? rate.toFixed(4) : 'N/A'}
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips Section */}
        <div className="dashboard-section-db">
          <div className="section-header-db">
            <h2 className="section-title-db">
              <FaCalendarAlt className="section-icon-db" />
              Recent Trips
            </h2>
            {recentTrips.length > 0 && (
              <button 
                className="view-all-btn-db"
                onClick={() => navigate('/planner')}
              >
                View All
              </button>
            )}
          </div>

          {recentTrips.length > 0 ? (
            <div className="trips-grid-db">
              {recentTrips.map(trip => (
                <div 
                  key={trip.id} 
                  className="trip-card-db"
                  onClick={() => handleTripClick(trip.id)}
                >
                  <div className="trip-header-db">
                    <h3 className="trip-title-db">{trip.title}</h3>
                    {trip.favorite && (
                      <span className="favorite-badge-db">
                        <FaStar />
                      </span>
                    )}
                  </div>
                  <div className="trip-meta-db">
                    <div className="trip-location-db">
                      <FaMapMarkerAlt className="meta-icon-db" />
                      {trip.location}
                    </div>
                    <div className="trip-date-db">
                      <FaCalendarAlt className="meta-icon-db" />
                      {trip.date}
                    </div>
                  </div>
                  <div className="trip-type-badge-db">
                    {trip.type}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-db">
              <div className="empty-icon-db">
                <GiPalmTree />
              </div>
              <h3>No trips planned yet</h3>
              <p>Start planning your first adventure with our AI assistant</p>
              <button 
                className="new-trip-btn-db primary-db"
                onClick={handleCreateNewTrip}
              >
                Create Your First Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;