// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
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
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
      const response = await fetch('/api/admin/users?limit=100', {
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
      const endpoint = type === 'queries' ? '/api/admin/cleanup/queries' : '/api/admin/cleanup/api-usage';
      
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
            📊 Overview
          </button>
          <button 
            className={`nav-item-ad ${activeTab === 'users' ? 'active-ad' : ''}`}
            onClick={() => {
              setActiveTab('users');
              fetchUsers();
            }}
          >
            👥 Users
          </button>
          <button 
            className={`nav-item-ad ${activeTab === 'analytics' ? 'active-ad' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={`nav-item-ad ${activeTab === 'cleanup' ? 'active-ad' : ''}`}
            onClick={() => setActiveTab('cleanup')}
          >
            🧹 Cleanup
          </button>
          <button 
            className={`nav-item-ad ${activeTab === 'system' ? 'active-ad' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            ⚙️ System
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
          {activeTab === 'system' && <SystemTab stats={stats} />}
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
          <div className="metric-icon-ad">👥</div>
          <div className="metric-info-ad">
            <h3>Total Users</h3>
            <span className="metric-value-ad">{stats.system?.total_users || 0}</span>
          </div>
        </div>
        
        <div className="metric-card-ad">
          <div className="metric-icon-ad">🗺️</div>
          <div className="metric-info-ad">
            <h3>Travel Plans</h3>
            <span className="metric-value-ad">{stats.system?.total_plans || 0}</span>
          </div>
        </div>
        
        <div className="metric-card-ad">
          <div className="metric-icon-ad">💬</div>
          <div className="metric-info-ad">
            <h3>Total Queries</h3>
            <span className="metric-value-ad">{stats.system?.total_queries || 0}</span>
          </div>
        </div>
        
        <div className="metric-card-ad">
          <div className="metric-icon-ad">📊</div>
          <div className="metric-info-ad">
            <h3>API Requests</h3>
            <span className="metric-value-ad">{stats.system?.total_api_requests || 0}</span>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="section-card-ad">
        <h3>🌍 Popular Destinations</h3>
        <div className="destinations-list-ad">
          {stats.popular_destinations?.map((dest, index) => (
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
            {stats.averages?.trip_duration ? `${stats.averages.trip_duration} days` : 'N/A'}
          </div>
        </div>
        <div className="average-card-ad">
          <h4>Average Budget</h4>
          <div className="average-value-ad">
            {stats.averages?.budget ? `$${stats.averages.budget}` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users }) => {
  return (
    <div className="users-section-ad">
      <div className="section-header-ad">
        <h2>User Management</h2>
        <span className="user-count-ad">{users.length} users</span>
      </div>
      
      <div className="users-table-ad">
        <div className="table-header-ad">
          <div>User</div>
          <div>Email</div>
          <div>Joined</div>
          <div>Status</div>
        </div>
        
        <div className="table-body-ad">
          {users.map((user) => (
            <div key={user.id} className="table-row-ad">
              <div className="user-cell-ad">
                <div className="user-avatar-ad">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span>{user.username}</span>
              </div>
              <div>{user.email}</div>
              <div>{new Date(user.created_at).toLocaleDateString()}</div>
              <div>
                <span className="status-badge-ad active-ad">Active</span>
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

  return (
    <div className="analytics-grid-ad">
      <div className="section-card-ad">
        <h3>📈 API Endpoint Usage (Last 7 Days)</h3>
        <div className="endpoints-list-ad">
          {stats.api_endpoints?.map((endpoint, index) => (
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
                  style={{ width: `${Math.min((endpoint.requests / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
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
        <h3>🗑️ Data Cleanup</h3>
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
                onChange={(e) => setCleanupDays(parseInt(e.target.value))}
                min="1"
                max="365"
              />
              <span>days</span>
            </div>
          </div>
        </div>

        <div className="cleanup-actions-ad">
          <button 
            className="cleanup-btn-ad warning-ad"
            onClick={() => onCleanup('queries')}
          >
            🧹 Cleanup Old Queries
          </button>
          <button 
            className="cleanup-btn-ad warning-ad"
            onClick={() => onCleanup('api-usage')}
          >
            📊 Cleanup API Usage Data
          </button>
        </div>

        <div className="cleanup-warning-ad">
          ⚠️ This action cannot be undone. Make sure you have backups if needed.
        </div>
      </div>
    </div>
  );
};

// System Tab Component
const SystemTab = ({ stats }) => {
  return (
    <div className="system-section-ad">
      <div className="section-card-ad">
        <h3>⚙️ System Information</h3>
        <div className="system-info-ad">
          <div className="info-item-ad">
            <span className="info-label-ad">Database Size:</span>
            <span className="info-value-ad">{stats.system?.db_size || 'N/A'}</span>
          </div>
          <div className="info-item-ad">
            <span className="info-label-ad">Active Sessions:</span>
            <span className="info-value-ad">{stats.system?.active_sessions || 'N/A'}</span>
          </div>
          <div className="info-item-ad">
            <span className="info-label-ad">Server Uptime:</span>
            <span className="info-value-ad">{stats.system?.uptime || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;