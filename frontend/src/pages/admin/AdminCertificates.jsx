import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';
import '../../styles/AdminCertificates.css';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showManualIssueModal, setShowManualIssueModal] = useState(false);
  const [manualIssueData, setManualIssueData] = useState({
    enrollmentId: '',
    overrideEligibility: false
  });

  useEffect(() => {
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search
      });
      
      const response = await api.get(`/admin/certificates?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCertificates(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Fetch certificates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (certificateId) => {
    const reason = prompt('Please provide a reason for revocation (min 10 characters):');
    if (!reason || reason.length < 10) {
      alert('Reason must be at least 10 characters');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/certificates/${certificateId}/revoke`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke certificate');
    }
  };

  const handleRestore = async (certificateId) => {
    if (!window.confirm('Restore this certificate?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/certificates/${certificateId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore certificate');
    }
  };

  const handleManualIssue = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/certificates/manual', manualIssueData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowManualIssueModal(false);
      setManualIssueData({ enrollmentId: '', overrideEligibility: false });
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue certificate');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-certificates">
        <div className="certificates-header">
          <div>
            <h1>Certificate Management</h1>
            <p>Manage internship completion certificates</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowManualIssueModal(true)}
          >
            <span className="material-icons">card_membership</span>
            Issue Certificate
          </button>
        </div>

        {/* Search */}
        <div className="certificates-filters">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search by certificate number, code, or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading certificates...</p>
          </div>
        ) : (
          <>
            <div className="certificates-grid">
              {certificates && certificates.length > 0 ? certificates.map((cert) => (
                <div key={cert._id} className={`certificate-card ${!cert.isValid ? 'revoked' : ''}`}>
                  <div className="certificate-header">
                    <span className="material-icons">card_membership</span>
                    <span className={`status-badge ${cert.isValid ? 'active' : 'revoked'}`}>
                      {cert.isValid ? 'Active' : 'Revoked'}
                    </span>
                  </div>

                  <div className="certificate-body">
                    <div className="cert-number">{cert.certificateNumber}</div>
                    <div className="student-name">{cert.userId?.name}</div>
                    <div className="internship-title">{cert.courseId?.title}</div>
                    
                    <div className="cert-details">
                      <div className="cert-detail-item">
                        <span className="material-icons">verified</span>
                        <span>{cert.verificationCode}</span>
                      </div>
                      <div className="cert-detail-item">
                        <span className="material-icons">calendar_today</span>
                        <span>{new Date(cert.issuedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {!cert.isValid && cert.revocationReason && (
                      <div className="revocation-reason">
                        <strong>Revoked:</strong> {cert.revocationReason}
                      </div>
                    )}
                  </div>

                  <div className="certificate-footer">
                    {cert.isValid ? (
                      <button
                        className="btn-action revoke"
                        onClick={() => handleRevoke(cert._id)}
                      >
                        <span className="material-icons">block</span>
                        Revoke
                      </button>
                    ) : (
                      <button
                        className="btn-action restore"
                        onClick={() => handleRestore(cert._id)}
                      >
                        <span className="material-icons">restore</span>
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <span className="material-icons">card_membership</span>
                  <p>No certificates found</p>
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

        {/* Manual Issue Modal */}
        {showManualIssueModal && (
          <div className="modal-overlay" onClick={() => setShowManualIssueModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Issue Certificate Manually</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowManualIssueModal(false)}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Enrollment ID</label>
                  <input
                    type="text"
                    value={manualIssueData.enrollmentId}
                    onChange={(e) => setManualIssueData({...manualIssueData, enrollmentId: e.target.value})}
                    placeholder="Enter enrollment ID"
                  />
                  <small>The student's enrollment ID for the internship</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={manualIssueData.overrideEligibility}
                      onChange={(e) => setManualIssueData({...manualIssueData, overrideEligibility: e.target.checked})}
                    />
                    <span>Override eligibility checks</span>
                  </label>
                  <small>Check this to issue certificate even if requirements are not met</small>
                </div>

                <div className="info-box">
                  <span className="material-icons">info</span>
                  <div>
                    <strong>Normal Requirements:</strong>
                    <ul>
                      <li>100% video completion</li>
                      <li>All tasks approved</li>
                      <li>Project approved</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowManualIssueModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleManualIssue}
                >
                  Issue Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCertificates;
