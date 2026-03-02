import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';
import '../../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });
      
      const response = await api.get(`/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/users/${userId}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data.data);
      setShowUserModal(true);
    } catch (err) {
      alert('Failed to load user details');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-users">
        <div className="users-header">
          <div>
            <h1>User Management</h1>
            <p>Manage platform users and roles</p>
          </div>
        </div>

        {/* Filters */}
        <div className="users-filters">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <select
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Enrollments</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`role-select role-${user.role}`}
                          value={user.role}
                          onChange={(e) => handleChangeRole(user._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{user.enrollments?.length || 0}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => viewUserDetails(user._id)}
                            title="View Details"
                          >
                            <span className="material-icons">visibility</span>
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleToggleStatus(user._id)}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <span className="material-icons">
                              {user.isActive ? 'block' : 'check_circle'}
                            </span>
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteUser(user._id)}
                            title="Delete"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="empty-message">
                        <span className="material-icons">inbox</span>
                        <p>No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="empty-state">
                  <span className="material-icons">people</span>
                  <p>No users found</p>
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

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Details</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowUserModal(false)}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="modal-body">
                <div className="user-details-grid">
                  <div className="detail-section">
                    <h3>Basic Information</h3>
                    <div className="detail-item">
                      <span>Name:</span>
                      <strong>{selectedUser.name}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Email:</span>
                      <strong>{selectedUser.email}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Role:</span>
                      <span className={`role-badge role-${selectedUser.role}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Status:</span>
                      <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Joined:</span>
                      <strong>{new Date(selectedUser.createdAt).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Activity Summary</h3>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <div className="stat-value">{selectedUser.enrollments?.length || 0}</div>
                        <div className="stat-label">Enrollments</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-value">{selectedUser.certificates?.length || 0}</div>
                        <div className="stat-label">Certificates</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-value">{selectedUser.payments?.length || 0}</div>
                        <div className="stat-label">Payments</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
