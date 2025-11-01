import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlane, 
  FaChartBar, 
  FaBolt,
  FaCloud,
  FaMoneyBillWave,
  FaSync,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaSearch
} from 'react-icons/fa';
import { GiPalmTree } from 'react-icons/gi';
import '../styles/Dashboard.css';

const getDayTempRange = (forecasts) => {
  if (!forecasts || forecasts.length === 0) return 'N/A';
  const temps = forecasts.map(f => f.temperature);
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  return `${Math.round(min)}° / ${Math.round(max)}°`;
};

const getDayCondition = (forecasts) => {
  if (!forecasts || forecasts.length === 0) return 'N/A';
  
  // Count condition frequencies
  const conditionCount = {};
  forecasts.forEach(f => {
    conditionCount[f.condition] = (conditionCount[f.condition] || 0) + 1;
  });
  
  // Return most frequent condition
  return Object.keys(conditionCount).reduce((a, b) => 
    conditionCount[a] > conditionCount[b] ? a : b
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    apiUsage: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [currencyRates, setCurrencyRates] = useState(null);
  const [converter, setConverter] = useState({
    amount: 1,
    from: 'USD',
    to: 'EUR',
    result: 0
  });
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState('Andhra Pradesh');
  const [locationInput, setLocationInput] = useState('Andhra Pradesh');
  const [weatherLoading, setWeatherLoading] = useState(false);

  const API_BASE = 'http://127.0.0.1:8000';

  // API Service Functions
  // API Service Functions
const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('access_token');
};

// Add this function to get API Key
const getApiKey = () => {
  return 'Rj1oezb-Yfb2-64DBZiAZqTAB_ox5KRT7CFFKIyL1GE';
};

const makeAuthenticatedRequest = async (endpoint, options = {}, requiresAuth = true) => {
  const token = getAuthToken();
  const apiKey = getApiKey();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'x-real-ip': '127.0.0.1',
      ...options.headers,
    },
  };

  if (requiresAuth && token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (requiresAuth && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

const makePublicRequest = async (endpoint, options = {}) => {
  const apiKey = getApiKey();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'x-real-ip': '127.0.0.1',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

  // Popular currencies
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

  // Effects
  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
    fetchCurrencyRates();
    // Fetch Andhra Pradesh weather by default
    fetchWeatherData('Andhra Pradesh');
  }, []);

  // Data Fetching Functions
  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
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

      try {
        const statsResponse = await makeAuthenticatedRequest('/users/me/stats');
        const userStats = await statsResponse.json();
        setStats({
          totalPlans: userStats.total_plans || 0,
          apiUsage: userStats.total_queries || 0
        });
      } catch (error) {
        console.warn('Stats endpoint not available');
        setStats({ totalPlans: 0, apiUsage: 0 });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
const fetchDashboardData = async () => {
  try {
    // Fetch recent plans from plans endpoint
    try {
      const plansResponse = await makeAuthenticatedRequest('/plans/?skip=0&limit=6');
      const plans = await plansResponse.json();
      
      console.log('Plans API Response:', plans); // Debug log
      
      if (plans && Array.isArray(plans) && plans.length > 0) {
        const formattedTrips = plans.map((plan, index) => ({
          id: plan.id || index,
          title: plan.title || `Trip ${index + 1}`,
          date: new Date(plan.created_at).toLocaleDateString(),
          location: plan.destination || 'Unknown Location',
          type: plan.trip_type || plan.status?.toUpperCase() || 'TRIP',
          budget: plan.budget || 0,
          duration: plan.duration || 0,
          status: plan.status || 'draft'
        }));
        setRecentTrips(formattedTrips);
        
        // Update stats with actual plan count
        setStats(prev => ({
          ...prev,
          totalPlans: plans.length
        }));
      } else {
        setRecentTrips([]);
      }
    } catch (error) {
      console.warn('Plans endpoint not available:', error);
      setRecentTrips([]);
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    setRecentTrips([]);
  } finally {
    setLoading(false);
  }
};

  // Weather Functions
  const fetchWeatherData = async (city) => {
    if (!city) return;
    
    setWeatherLoading(true);
    try {
      // Fetch current weather
      const response = await makePublicRequest('/weather/current', {
        method: 'POST',
        body: JSON.stringify({ city })
      });

      const weather = await response.json();
      const processedWeather = processWeatherResponse(weather, city);
      setWeatherData(processedWeather);
      
      // Fetch forecast data
      await fetchForecastData(city);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      const mockWeather = generateMockWeather(city);
      setWeatherData(mockWeather);
      setForecastData(generateMockForecast(city));
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchForecastData = async (city) => {
    try {
      const response = await makePublicRequest(`/weather/forecast/${city}`);
      const forecast = await response.json();
      setForecastData(processForecastResponse(forecast));
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      setForecastData(generateMockForecast(city));
    }
  };

  const processWeatherResponse = (weatherResponse, city) => {
    const rawDescription = weatherResponse.current_weather?.description;
    const temperature = extractTemperature(rawDescription);
    const condition = extractWeatherCondition(rawDescription);
    const icon = getWeatherIcon(condition);

    return {
      city: city,
      current_weather: {
        description: rawDescription,
        condition: condition,
        temperature: temperature,
        icon: icon,
        raw_data: weatherResponse.current_weather?.raw_data
      },
      timestamp: weatherResponse.timestamp
    };
  };

  const processForecastResponse = (forecastResponse) => {
    const forecastText = forecastResponse.forecast;
    return parseForecastData(forecastText, forecastResponse.city);
  };

  const extractTemperature = (description) => {
    if (!description) return 20;
    
    // Try to extract temperature from description like "13.8°C"
    const tempMatch = description.match(/(\d+\.?\d*)°C/);
    if (tempMatch) {
      return parseFloat(tempMatch[1]);
    }
    
    // Fallback: generate reasonable temperature based on city
    return Math.floor(Math.random() * 30) + 10; // 10-40°C
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

  const parseForecastData = (forecastText, city) => {
    if (!forecastText) return null;
    
    const days = [];
    const lines = forecastText.split('\n');
    let currentDay = null;
    
    lines.forEach(line => {
      line = line.trim();
      
      // Check for day header like "**2025-10-29**"
      const dayMatch = line.match(/\*\*(\d{4}-\d{2}-\d{2})\*\*/);
      if (dayMatch) {
        if (currentDay) {
          days.push(currentDay);
        }
        currentDay = {
          date: dayMatch[1],
          forecasts: []
        };
      }
      
      // Parse time entries like "18:00:00: 13.8°C, moderate rain"
      if (currentDay && line.includes(':')) {
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}):\s*([^,]+),\s*(.+)/);
        if (timeMatch) {
          const [_, time, tempStr, condition] = timeMatch;
          const tempMatch = tempStr.match(/(\d+\.?\d*)°C/);
          
          currentDay.forecasts.push({
            time: time,
            temperature: tempMatch ? parseFloat(tempMatch[1]) : 20,
            condition: condition.trim(),
            icon: getWeatherIcon(condition)
          });
        }
      }
    });
    
    if (currentDay) {
      days.push(currentDay);
    }
    
    return {
      city: city,
      days: days.slice(0, 2), // Only take 2 days max
      raw_data: forecastText
    };
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
      'Clear': '☀️',
      'moderate rain': '🌧️',
      'light rain': '🌦️',
      'overcast clouds': '☁️',
      'scattered clouds': '⛅',
      'broken clouds': '☁️'
    };
    
    const conditionLower = condition.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (conditionLower.includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '☀️';
  };

  // Currency Functions
  const fetchCurrencyRates = async (baseCurrency = 'INR') => {
    try {
      const response = await makePublicRequest(`/currency/rates/${baseCurrency}`);
      const ratesData = await response.json();
      setCurrencyRates(ratesData);
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      const mockRates = generateMockRates(baseCurrency);
      setCurrencyRates(mockRates);
    }
  };

  const handleCurrencyConvert = async () => {
    try {
      const response = await makePublicRequest('/currency/convert', {
        method: 'POST',
        body: JSON.stringify({
          amount: converter.amount,
          from_currency: converter.from,
          to_currency: converter.to
        })
      });

      const result = await response.json();
      setConverter(prev => ({
        ...prev,
        result: result.converted_amount || 0
      }));
      
    } catch (error) {
      console.error('Error converting currency:', error);
      const mockRate = getMockExchangeRate(converter.from, converter.to);
      setConverter(prev => ({
        ...prev,
        result: prev.amount * mockRate
      }));
    }
  };

  // Event Handlers
  const handleGetWeather = () => {
    if (locationInput.trim()) {
      const city = locationInput.trim();
      setUserLocation(city);
      fetchWeatherData(city);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGetWeather();
    }
  };

  const handleCreateNewTrip = () => {
    navigate('/planner');
  };

  const handleTripClick = (tripId) => {
    navigate(`/planner?trip=${tripId}`);
  };

  const handleRefreshWeather = () => {
    if (userLocation) {
      fetchWeatherData(userLocation);
    }
  };

  // Mock Data Generators (Fallback)
  const generateMockWeather = (city) => {
    // Special case for Andhra Pradesh - typical weather
    if (city.toLowerCase().includes('andhra')) {
      return {
        city: city,
        current_weather: { 
          description: 'Sunny, 32°C',
          condition: 'Sunny',
          temperature: 32,
          icon: '☀️'
        }
      };
    }

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

  const generateMockForecast = (city) => {
    const days = [];
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'];
    
    // Special case for Andhra Pradesh - typical forecast
    if (city.toLowerCase().includes('andhra')) {
      for (let i = 0; i < 2; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const day = {
          date: date.toISOString().split('T')[0],
          forecasts: []
        };
        
        // Add time entries per day with Andhra Pradesh typical weather
        const times = ['06:00:00', '12:00:00', '18:00:00', '21:00:00'];
        for (const time of times) {
          // Andhra Pradesh typically has warm weather
          const baseTemp = 30 + Math.floor(Math.random() * 8) - 4; // 26-34°C
          const condition = i === 0 ? 'Sunny' : conditions[Math.floor(Math.random() * 2)]; // More likely sunny
          
          day.forecasts.push({
            time: time,
            temperature: baseTemp,
            condition: condition,
            icon: getWeatherIcon(condition)
          });
        }
        
        days.push(day);
      }
      
      return {
        city: city,
        days: days
      };
    }

    // Default mock forecast for other cities
    for (let i = 0; i < 2; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const day = {
        date: date.toISOString().split('T')[0],
        forecasts: []
      };
      
      // Add time entries per day
      const times = ['06:00:00', '12:00:00', '18:00:00', '21:00:00'];
      for (const time of times) {
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        day.forecasts.push({
          time: time,
          temperature: Math.floor(Math.random() * 25) + 10,
          condition: condition,
          icon: getWeatherIcon(condition)
        });
      }
      
      days.push(day);
    }
    
    return {
      city: city,
      days: days
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

  const getMockExchangeRate = (from, to) => {
    const rates = {
      USD: { EUR: 0.85, GBP: 0.73, JPY: 110.5, INR: 74.5, CAD: 1.25, AUD: 1.35, CHF: 0.92, CNY: 6.45, SGD: 1.34 },
      EUR: { USD: 1.18, GBP: 0.86, JPY: 130.0, INR: 87.5, CAD: 1.47, AUD: 1.59, CHF: 1.08, CNY: 7.59, SGD: 1.58 },
    };
    return rates[from]?.[to] || 1;
  };

  // Auto-update converter when inputs change
useEffect(() => {
  if (currencyRates && currencyRates.rates && currencyRates.rates[converter.to]) {
    const rate = currencyRates.rates[converter.to];
    setConverter(prev => ({
      ...prev,
      result: prev.amount * rate
    }));
  }
}, [converter.amount, converter.to, currencyRates]);

// Update currency rates when base currency changes
useEffect(() => {
  if (converter.from) {
    fetchCurrencyRates(converter.from);
  }
}, [converter.from]);
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
          {/* Left Section - Weather */}
          <div className="dashboard-section-db">
            <div className="stats-container-db">
              {/* Stats Row */}
              <div className="stats-row-db">
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
              </div>
              
              {/* Weather Card */}
              <div className="tool-card-db">
                <div className="tool-header-db">
                  <FaCloud className="tool-icon-db" />
                  <h3>Weather Forecast</h3>
                  <button 
                    className="refresh-btn-db"
                    onClick={handleRefreshWeather}
                    disabled={!userLocation || weatherLoading}
                  >
                    <FaSync className={weatherLoading ? 'spinning' : ''} />
                  </button>
                </div>
                <div className="tool-content-db">
                  {/* Location Search Input */}
                  <div className="location-search-db">
                    <div className="search-input-container-db">
                      <FaMapMarkerAlt className="search-icon-db" />
                      <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter city name..."
                        className="location-input-db"
                      />
                      <button 
                        className="get-weather-btn-db"
                        onClick={handleGetWeather}
                        disabled={!locationInput.trim() || weatherLoading}
                      >
                        {weatherLoading ? 'Loading...' : 'Get Weather'}
                      </button>
                    </div>
                  </div>

                  {weatherLoading ? (
                    <div className="weather-loading-db">
                      <div className="loading-spinner-small-db"></div>
                      <p>Fetching weather data...</p>
                    </div>
                  ) : weatherData && userLocation ? (
                    <div className="weather-info-db">
                      {/* Current Weather */}
                      <div className="current-weather-db">
                        <div className="weather-location-db">
                          <FaMapMarkerAlt className="location-icon-db" />
                          <span>{weatherData.city}</span>
                        </div>
                        <div className="weather-main-db">
                          <div className="weather-icon-db large">
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
                      
                      {/* 2-Day Forecast - Always visible */}
                      {forecastData && forecastData.days && forecastData.days.length > 0 && (
                        <div className="forecast-section-db">
                          <h4 className="forecast-title-db">2-Day Forecast</h4>
                          <div className="forecast-days-db">
                            {forecastData.days.map((day, index) => (
                              <div key={index} className="forecast-day-db">
                                <div className="forecast-date-db">
                                  {new Date(day.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div className="day-summary-db">
                                  <div className="day-temp-range-db">
                                    {getDayTempRange(day.forecasts)}
                                  </div>
                                  <div className="day-condition-db">
                                    {getDayCondition(day.forecasts)}
                                  </div>
                                </div>
                                <div className="hourly-forecast-db">
                                  {day.forecasts.slice(0, 4).map((forecast, timeIndex) => (
                                    <div key={timeIndex} className="hour-slot-db">
                                      <div className="hour-time-db">{forecast.time.split(':')[0]}h</div>
                                      <div className="hour-icon-db">{forecast.icon}</div>
                                      <div className="hour-temp-db">{forecast.temperature}°</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="weather-prompt-db">
                      <p>Enter a city name and click "Get Weather" to see current conditions and forecast</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Currency Converter */}
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
          {/* Show budget if available */}
          {trip.budget > 0 && (
            <div className="trip-budget-db">
              <FaMoneyBillWave className="meta-icon-db" />
              ${trip.budget.toLocaleString()}
            </div>
          )}
          {/* Show duration if available */}
          {trip.duration > 0 && (
            <div className="trip-duration-db">
              <FaCalendarAlt className="meta-icon-db" />
              {trip.duration} days
            </div>
          )}
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