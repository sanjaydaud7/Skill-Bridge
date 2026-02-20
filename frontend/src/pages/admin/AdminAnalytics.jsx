import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';
import '../../styles/AdminAnalytics.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let endpoint = '';
      const params = new URLSearchParams(dateRange);

      switch (activeTab) {
        case 'revenue':
          endpoint = '/admin/analytics/revenue';
          break;
        case 'courses':
          endpoint = '/admin/analytics/courses';
          break;
        case 'students':
          endpoint = '/admin/analytics/students';
          break;
        case 'submissions':
          endpoint = '/admin/analytics/submissions';
          break;
        default:
          endpoint = '/admin/analytics/revenue';
      }
      
      const response = await api.get(`${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnalytics(response.data?.data || null);
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-analytics">
        <div className="analytics-header">
          <div>
            <h1>Analytics & Reports</h1>
            <p>Detailed platform analytics and insights</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="analytics-tabs">
          <button
            className={`tab ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <span className="material-icons">payments</span>
            Revenue
          </button>
          <button
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <span className="material-icons">library_books</span>
            Internships
          </button>
          <button
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <span className="material-icons">school</span>
            Students
          </button>
          <button
            className={`tab ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <span className="material-icons">assignment</span>
            Submissions
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="date-range-filter">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            placeholder="Start Date"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            placeholder="End Date"
          />
          <button 
            className="btn-secondary"
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
          >
            Clear
          </button>
        </div>

        {/* Analytics Content */}
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        ) : (
          <div className="analytics-content">
            {activeTab === 'revenue' && analytics && (
              <div className="revenue-analytics">
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-icon revenue">
                      <span className="material-icons">account_balance_wallet</span>
                    </div>
                    <div className="stat-data">
                      <div className="stat-label">Total Revenue</div>
                      <div className="stat-value">₹{analytics.totalRevenue?.toLocaleString() || 0}</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon average">
                      <span className="material-icons">analytics</span>
                    </div>
                    <div className="stat-data">
                      <div className="stat-label">Average Payment</div>
                      <div className="stat-value">₹{analytics.averagePayment?.toFixed(2) || 0}</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon count">
                      <span className="material-icons">receipt</span>
                    </div>
                    <div className="stat-data">
                      <div className="stat-label">Total Payments</div>
                      <div className="stat-value">{analytics.totalPayments || 0}</div>
                    </div>
                  </div>
                </div>

                {analytics.topCourses && analytics.topCourses.length > 0 && (
                  <div className="analytics-section">
                    <h2>Top Revenue Internships</h2>
                    <div className="courses-revenue-list">
                      {analytics.topCourses.map((course, index) => (
                        <div key={index} className="course-revenue-item">
                          <div className="course-rank">{index + 1}</div>
                          <div className="course-details">
                            <div className="course-name">{course.title}</div>
                            <div className="course-revenue">₹{course.revenue?.toLocaleString()}</div>
                          </div>
                          <div className="course-enrollments">
                            {course.enrollmentCount} enrollments
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.paymentMethodBreakdown && (
                  <div className="analytics-section">
                    <h2>Payment Methods</h2>
                    <div className="payment-methods">
                      {Object.entries(analytics.paymentMethodBreakdown).map(([method, count]) => (
                        <div key={method} className="payment-method-card">
                          <div className="method-name">{method}</div>
                          <div className="method-count">{count} payments</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && analytics && (
              <div className="courses-analytics">
                {analytics.length > 0 ? (
                  <div className="courses-analytics-list">
                    {analytics.map((course, index) => (
                      <div key={index} className="course-analytics-card">
                        <div className="course-header">
                          <h3>{course.title}</h3>
                          <span className="course-category">{course.category}</span>
                        </div>
                        <div className="course-metrics">
                          <div className="metric">
                            <span className="material-icons">people</span>
                            <div>
                              <div className="metric-value">{course.totalEnrollments}</div>
                              <div className="metric-label">Enrollments</div>
                            </div>
                          </div>
                          <div className="metric">
                            <span className="material-icons">task_alt</span>
                            <div>
                              <div className="metric-value">{course.completedEnrollments}</div>
                              <div className="metric-label">Completed</div>
                            </div>
                          </div>
                          <div className="metric">
                            <span className="material-icons">payments</span>
                            <div>
                              <div className="metric-value">₹{course.totalRevenue?.toLocaleString()}</div>
                              <div className="metric-label">Revenue</div>
                            </div>
                          </div>
                          <div className="metric">
                            <span className="material-icons">trending_up</span>
                            <div>
                              <div className="metric-value">{course.averageProgress?.toFixed(1)}%</div>
                              <div className="metric-label">Avg Progress</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="material-icons">library_books</span>
                    <p>No course analytics available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && analytics && (
              <div className="students-analytics">
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-icon engagement">
                      <span className="material-icons">sentiment_satisfied</span>
                    </div>
                    <div className="stat-data">
                      <div className="stat-label">Engagement Rate</div>
                      <div className="stat-value">{analytics.engagementRate?.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon time">
                      <span className="material-icons">schedule</span>
                    </div>
                    <div className="stat-data">
                      <div className="stat-label">Avg Completion Time</div>
                      <div className="stat-value">{analytics.avgTimeToCompletion?.toFixed(1)} days</div>
                    </div>
                  </div>
                </div>

                {analytics.completionDistribution && (
                  <div className="analytics-section">
                    <h2>Completion Distribution</h2>
                    <div className="completion-bars">
                      {Object.entries(analytics.completionDistribution).map(([range, count]) => (
                        <div key={range} className="completion-bar-item">
                          <div className="completion-range">{range}</div>
                          <div className="completion-bar-wrapper">
                            <div 
                              className="completion-bar-fill"
                              style={{ width: `${(count / Math.max(...Object.values(analytics.completionDistribution))) * 100}%` }}
                            ></div>
                          </div>
                          <div className="completion-count">{count} students</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && analytics && (
              <div className="submissions-analytics">
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-icon tasks">
                      <span className="material-icons">assignment_turned_in</span>
                    </div>
                    <div className="stat-data">
                      <div className="stat-label">Task Approval Rate</div>
                      <div className="stat-value">{analytics.taskApprovalRate?.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon projects">
                      <span className="material-icons">work</span>
                    </div>
                    <div className="stat-data">
                      <div className="stat-label">Project Approval Rate</div>
                      <div className="stat-value">{analytics.projectApprovalRate?.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon review-time">
                      <span className="material-icons">timer</span>
                    </div>
                    <div className="stat-data">
                      <div className="stat-label">Avg Review Time</div>
                      <div className="stat-value">{analytics.avgReviewTimeHours?.toFixed(1)}h</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
