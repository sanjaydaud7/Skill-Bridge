import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';
import '../../styles/AdminEnrollments.css';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    course: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showManualEnrollModal, setShowManualEnrollModal] = useState(false);
  const [manualEnrollData, setManualEnrollData] = useState({
    userId: '',
    courseId: '',
    status: 'active'
  });

  useEffect(() => {
    fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });
      
      const response = await api.get(`/admin/enrollments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEnrollments(response.data.data?.enrollments || []);
      setTotalPages(response.data.data?.pages || 1);
    } catch (err) {
      console.error('Fetch enrollments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (enrollmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/enrollments/${enrollmentId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResetProgress = async (enrollmentId) => {
    if (!window.confirm('Reset all progress for this enrollment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/enrollments/${enrollmentId}/reset`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset progress');
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!window.confirm('Unenroll this student? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/enrollments/${enrollmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unenroll student');
    }
  };

  const handleManualEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/enrollments/manual', manualEnrollData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowManualEnrollModal(false);
      setManualEnrollData({ userId: '', courseId: '', status: 'active' });
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll student');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-enrollments">
        <div className="enrollments-header">
          <div>
            <h1>Enrollment Management</h1>
            <p>Manage student internship enrollments</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowManualEnrollModal(true)}
          >
            <span className="material-icons">person_add</span>
            Manual Enrollment
          </button>
        </div>

        {/* Filters */}
        <div className="enrollments-filters">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="certificate-purchased">Certificate Purchased</option>
          </select>
        </div>

        {/* Enrollments Table */}
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading enrollments...</p>
          </div>
        ) : (
          <>
            <div className="enrollments-table">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Internship</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Enrolled Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments && enrollments.length > 0 ? enrollments.map((enrollment) => (
                    <tr key={enrollment._id}>
                      <td>
                        <div className="student-info">
                          <div className="student-avatar">
                            {enrollment.user?.name?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <div className="student-name">{enrollment.user?.name}</div>
                            <div className="student-email">{enrollment.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{enrollment.course?.title}</td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${enrollment.completionPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {enrollment.completionPercentage?.toFixed(1) || 0}%
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-select ${enrollment.status}`}
                          value={enrollment.status}
                          onChange={(e) => handleStatusUpdate(enrollment._id, e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="certificate-purchased">Certificate Purchased</option>
                        </select>
                      </td>
                      <td>{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => handleResetProgress(enrollment._id)}
                            title="Reset Progress"
                          >
                            <span className="material-icons">restart_alt</span>
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleUnenroll(enrollment._id)}
                            title="Unenroll"
                          >
                            <span className="material-icons">person_remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="empty-message">
                        <span className="material-icons">inbox</span>
                        <p>No enrollments found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {enrollments.length === 0 && (
                <div className="empty-state">
                  <span className="material-icons">school</span>
                  <p>No enrollments found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Manual Enrollment Modal */}
        {showManualEnrollModal && (
          <div className="modal-overlay" onClick={() => setShowManualEnrollModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Manual Enrollment</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowManualEnrollModal(false)}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>User ID</label>
                  <input
                    type="text"
                    value={manualEnrollData.userId}
                    onChange={(e) => setManualEnrollData({...manualEnrollData, userId: e.target.value})}
                    placeholder="Enter user ID"
                  />
                </div>

                <div className="form-group">
                  <label>Internship ID</label>
                  <input
                    type="text"
                    value={manualEnrollData.courseId}
                    onChange={(e) => setManualEnrollData({...manualEnrollData, courseId: e.target.value})}
                    placeholder="Enter internship ID"
                  />
                </div>

                <div className="form-group">
                  <label>Initial Status</label>
                  <select
                    value={manualEnrollData.status}
                    onChange={(e) => setManualEnrollData({...manualEnrollData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowManualEnrollModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleManualEnroll}
                >
                  Enroll Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEnrollments;
