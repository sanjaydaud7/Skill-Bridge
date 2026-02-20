import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import api from '../../config/api';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await api.get('/admin/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        setStats(response.data.data);
        setError(null);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Dashboard error:', err);
      console.error('Error details:', err.response);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-error">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>
          <button onClick={fetchDashboardData} className="refresh-btn">
            <span className="material-icons">refresh</span>
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard
            title="Total Users"
            value={stats?.users?.total || 0}
            icon="people"
            color="blue"
            trend={stats?.users?.newThisMonth > 0 ? 'up' : 'down'}
            trendValue={`+${stats?.users?.newThisMonth || 0} this month`}
          />
          <StatsCard
            title="Active Internships"
            value={stats?.courses?.active || 0}
            icon="library_books"
            color="green"
            trend="up"
            trendValue={`${stats?.courses?.total || 0} total`}
          />
          <StatsCard
            title="Pending Reviews"
            value={stats?.submissions?.pending || 0}
            icon="assignment"
            color="orange"
            trend={stats?.submissions?.pending > 0 ? 'up' : 'down'}
            trendValue={`${stats?.submissions?.reviewedToday || 0} today`}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats?.revenue?.total?.toLocaleString() || 0}`}
            icon="payments"
            color="purple"
            trend="up"
            trendValue={`$${stats?.revenue?.thisMonth || 0} this month`}
          />
        </div>

        {/* Secondary Stats */}
        <div className="secondary-stats">
          <div className="stat-item">
            <span className="material-icons">school</span>
            <div>
              <div className="stat-value">{stats?.enrollments?.active || 0}</div>
              <div className="stat-label">Active Enrollments</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="material-icons">task_alt</span>
            <div>
              <div className="stat-value">{stats?.enrollments?.completed || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="material-icons">card_membership</span>
            <div>
              <div className="stat-value">{stats?.certificates?.issued || 0}</div>
              <div className="stat-label">Certificates Issued</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="material-icons">trending_up</span>
            <div>
              <div className="stat-value">
                {stats?.enrollments?.completionRate 
                  ? `${stats.enrollments.completionRate.toFixed(1)}%` 
                  : '0%'}
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="activity-list">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <span className="material-icons">
                      {getActivityIcon(activity.action)}
                    </span>
                  </div>
                  <div className="activity-content">
                    <div className="activity-description">
                      {activity.description}
                    </div>
                    <div className="activity-time">
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No recent activity</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <a href="/admin/courses" className="action-btn">
              <span className="material-icons">add</span>
              Create Internship
            </a>
            <a href="/admin/submissions" className="action-btn">
              <span className="material-icons">rate_review</span>
              Review Submissions
            </a>
            <a href="/admin/users" className="action-btn">
              <span className="material-icons">person_add</span>
              Manage Users
            </a>
            <a href="/admin/analytics" className="action-btn">
              <span className="material-icons">analytics</span>
              View Analytics
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const getActivityIcon = (action) => {
  const iconMap = {
    'create': 'add_circle',
    'update': 'edit',
    'delete': 'delete',
    'approve': 'check_circle',
    'reject': 'cancel',
    'enroll': 'person_add',
    'unenroll': 'person_remove',
    'revoke': 'block',
    'restore': 'restore',
    'refund': 'money_off',
    'manual_certificate': 'card_membership',
    'manual_payment': 'payment',
    'status_change': 'swap_horiz'
  };
  return iconMap[action] || 'info';
};

export default AdminDashboard;
