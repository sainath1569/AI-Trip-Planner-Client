// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaUsers, 
  FaChartLine, 
  FaTrashAlt,
  FaUser,
  FaMapMarkerAlt,
  FaComments,
  FaDatabase,
  FaFire,
  FaBolt,
  FaGlobeAmericas,
  FaCalendarAlt,
  FaDollarSign
} from 'react-icons/fa';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [cleanupDays, setCleanupDays] = useState(90);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/admin/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCleanup = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'queries' 
        ? 'http://127.0.0.1:8000/admin/cleanup/queries' 
        : 'http://127.0.0.1:8000/admin/cleanup/api-usage';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: cleanupDays }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Successfully deleted ${result.deleted} ${type} records older than ${cleanupDays} days`);
        fetchStats(); // Refresh stats
      } else {
        alert('Cleanup failed: ' + response.status);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      alert('Cleanup failed');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner-large-ad"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-ad">
      {/* Sidebar */}
      <div className="sidebar-ad">
        <div className="sidebar-header-ad">
          <h2>Admin Panel</h2>
          <div className="admin-badge-ad">Administrator</div>
        </div>
        
        <nav className="sidebar-nav-ad">
          <button 
            className={`nav-item-ad ${activeTab === 'overview' ? 'active-ad' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartBar className="nav-icon-ad" />
            Overview
          </button>
          <button 
            className={`nav-item-ad ${activeTab === 'users' ? 'active-ad' : ''}`}
            onClick={() => {
              setActiveTab('users');
              fetchUsers();
            }}
          >
            <FaUsers className="nav-icon-ad" />
            Users
          </button>
          <button 
            className={`nav-item-ad ${activeTab === 'analytics' ? 'active-ad' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartLine className="nav-icon-ad" />
            Analytics
          </button>
          <button 
            className={`nav-item-ad ${activeTab === 'cleanup' ? 'active-ad' : ''}`}
            onClick={() => setActiveTab('cleanup')}
          >
            <FaTrashAlt className="nav-icon-ad" />
            Cleanup
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content-ad">
        <div className="content-header-ad">
          <h1 className="page-title-ad">Admin Dashboard</h1>
          <p className="welcome-text-ad">Manage your travel planning platform</p>
        </div>

        <div className="dashboard-content-ad">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'users' && <UsersTab users={users} />}
          {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
          {activeTab === 'cleanup' && (
            <CleanupTab 
              cleanupDays={cleanupDays}
              setCleanupDays={setCleanupDays}
              onCleanup={handleCleanup}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats }) => {
  if (!stats) return <div>No data available</div>;

  return (
    <div className="overview-grid-ad">
      {/* Key Metrics */}
      <div className="metrics-grid-ad">
        <div className="metric-card-ad">
          <div className="metric-icon-ad">
            <FaUser />
          </div>
          <div className="metric-info-ad">
            <h3>Total Users</h3>
            <span className="metric-value-ad">{stats.system?.total_users || 0}</span>
          </div>
        </div>
        
        <div className="metric-card-ad">
          <div className="metric-icon-ad">
            <FaMapMarkerAlt />
          </div>
          <div className="metric-info-ad">
            <h3>Travel Plans</h3>
            <span className="metric-value-ad">{stats.system?.total_plans || 0}</span>
          </div>
        </div>
        
        <div className="metric-card-ad">
          <div className="metric-icon-ad">
            <FaComments />
          </div>
          <div className="metric-info-ad">
            <h3>Total Queries</h3>
            <span className="metric-value-ad">{stats.system?.total_queries || 0}</span>
          </div>
        </div>
        
        <div className="metric-card-ad">
          <div className="metric-icon-ad">
            <FaDatabase />
          </div>
          <div className="metric-info-ad">
            <h3>Active Users (30d)</h3>
            <span className="metric-value-ad">{stats.system?.active_users_30d || 0}</span>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="section-card-ad">
        <h3>
          <FaGlobeAmericas className="section-header-icon" />
          Popular Destinations
        </h3>
        <div className="destinations-list-ad">
          {stats.popular_destinations?.slice(0, 8).map((dest, index) => (
            <div key={index} className="destination-item-ad">
              <span className="destination-name-ad">{dest.destination}</span>
              <span className="destination-count-ad">{dest.count} plans</span>
            </div>
          ))}
        </div>
      </div>

      {/* Averages */}
      <div className="averages-grid-ad">
        <div className="average-card-ad">
          <h4>Average Trip Duration</h4>
          <div className="average-value-ad">
            {stats.averages?.trip_duration ? `${stats.averages.trip_duration.toFixed(1)} days` : 'N/A'}
          </div>
        </div>
        <div className="average-card-ad">
          <h4>Average Budget</h4>
          <div className="average-value-ad">
            {stats.averages?.budget ? `$${stats.averages.budget.toFixed(0)}` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="users-section-ad">
      <div className="section-header-ad">
        <h2>
          <FaUsers className="section-header-icon" />
          User Management
        </h2>
        <span className="user-count-ad">{users.length} users</span>
      </div>
      
      <div className="users-table-ad">
        <div className="table-header-ad">
          <div>User</div>
          <div>Email</div>
          <div>Role</div>
          <div>Joined</div>
          <div>Last Login</div>
          <div>Status</div>
        </div>
        
        <div className="table-body-ad">
          {users.map((user) => (
            <div key={user.id} className="table-row-ad">
              <div className="user-cell-ad">
                <div className="user-avatar-ad">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="username-ad">{user.username}</span>
              </div>
              <div className="email-ad">{user.email}</div>
              <div>
                <span className={`role-badge-ad ${user.role === 'admin' ? 'admin-badge' : 'user-badge'}`}>
                  {user.role}
                </span>
              </div>
              <div>{formatDate(user.created_at)}</div>
              <div>{user.last_login ? formatDate(user.last_login) : 'Never'}</div>
              <div>
                <span className={`status-badge-ad ${user.is_active ? 'active-ad' : 'inactive-ad'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ stats }) => {
  if (!stats) return <div>No analytics data</div>;

  // Calculate max requests for percentage
  const maxRequests = Math.max(...stats.api_endpoints.map(ep => ep.requests));

  return (
    <div className="analytics-grid-ad">
      <div className="section-card-ad full-width-ad">
        <h3>
          <FaChartLine className="section-header-icon" />
          API Endpoint Usage (Last 7 Days)
        </h3>
        <div className="endpoints-list-ad">
          {stats.api_endpoints?.slice(0, 15).map((endpoint, index) => (
            <div key={index} className="endpoint-item-ad">
              <div className="endpoint-info-ad">
                <span className="endpoint-name-ad">{endpoint.endpoint}</span>
                <span className="endpoint-stats-ad">
                  {endpoint.requests} requests • {endpoint.avg_response_time.toFixed(2)}ms avg
                </span>
              </div>
              <div className="endpoint-bar-ad">
                <div 
                  className="endpoint-bar-fill-ad"
                  style={{ 
                    width: `${Math.min((endpoint.requests / maxRequests) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Endpoints Summary */}
      <div className="metrics-grid-ad">
        <div className="metric-card-ad">
          <div className="metric-icon-ad">
            <FaFire />
          </div>
          <div className="metric-info-ad">
            <h3>Most Used Endpoint</h3>
            <span className="metric-value-ad small-text-ad">
              {stats.api_endpoints?.[0]?.endpoint || 'N/A'}
            </span>
            <span className="metric-subtext-ad">
              {stats.api_endpoints?.[0]?.requests || 0} requests
            </span>
          </div>
        </div>
        
        <div className="metric-card-ad">
          <div className="metric-icon-ad">
            <FaBolt />
          </div>
          <div className="metric-info-ad">
            <h3>Fastest Endpoint</h3>
            <span className="metric-value-ad small-text-ad">
              {stats.api_endpoints?.reduce((fastest, current) => 
                current.avg_response_time < (fastest?.avg_response_time || Infinity) ? current : fastest
              )?.endpoint || 'N/A'}
            </span>
            <span className="metric-subtext-ad">
              {stats.api_endpoints?.reduce((fastest, current) => 
                current.avg_response_time < (fastest?.avg_response_time || Infinity) ? current : fastest
              )?.avg_response_time.toFixed(2) || 0}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cleanup Tab Component
const CleanupTab = ({ cleanupDays, setCleanupDays, onCleanup }) => {
  return (
    <div className="cleanup-section-ad">
      <div className="section-card-ad">
        <h3>
          <FaTrashAlt className="section-header-icon" />
          Data Cleanup
        </h3>
        <p className="cleanup-description-ad">
          Remove old data to free up storage space and maintain system performance.
        </p>
        
        <div className="cleanup-controls-ad">
          <div className="control-group-ad">
            <label>Delete records older than:</label>
            <div className="days-input-ad">
              <input
                type="number"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(parseInt(e.target.value) || 90)}
                min="1"
                max="365"
                className="days-input-field-ad"
              />
              <span>days</span>
            </div>
          </div>
        </div>

        <div className="cleanup-actions-ad">
          <button 
            className="cleanup-btn-ad warning-ad"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete queries older than ${cleanupDays} days?`)) {
                onCleanup('queries');
              }
            }}
          >
            <FaTrashAlt />
            Cleanup Old Queries
          </button>
          <button 
            className="cleanup-btn-ad warning-ad"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete API usage data older than ${cleanupDays} days?`)) {
                onCleanup('api-usage');
              }
            }}
          >
            <FaDatabase />
            Cleanup API Usage Data
          </button>
        </div>

        <div className="cleanup-warning-ad">
          ⚠️ This action cannot be undone. Make sure you have backups if needed.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;