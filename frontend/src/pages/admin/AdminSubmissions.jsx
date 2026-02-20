import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';
import '../../styles/AdminSubmissions.css';

const AdminSubmissions = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    course: '',
    sortBy: 'oldest'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    feedback: '',
    points: 0,
    grade: 'A',
    score: 100
  });

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, filters]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'tasks' ? '/admin/submissions/tasks' : '/admin/submissions/projects';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });
      
      const response = await api.get(`${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubmissions(response.data.data?.submissions || []);
      setTotalPages(response.data.data?.pages || 1);
    } catch (err) {
      console.error('Fetch submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = async (submissionId) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'tasks' 
        ? `/admin/submissions/tasks/${submissionId}`
        : `/admin/submissions/projects/${submissionId}`;
      
      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedSubmission(response.data.data);
      setReviewData({
        status: 'approved',
        feedback: '',
        points: activeTab === 'tasks' ? response.data.data.task?.maxPoints || 0 : undefined,
        grade: 'A',
        score: 100
      });
      setShowReviewModal(true);
    } catch (err) {
      alert('Failed to load submission details');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData.feedback.trim()) {
      alert('Please provide feedback');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'tasks'
        ? `/admin/submissions/tasks/${selectedSubmission._id}/review`
        : `/admin/submissions/projects/${selectedSubmission._id}/review`;
      
      const payload = activeTab === 'tasks'
        ? { status: reviewData.status, feedback: reviewData.feedback, points: reviewData.points }
        : { status: reviewData.status, feedback: reviewData.feedback, grade: reviewData.grade, score: reviewData.score };
      
      await api.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowReviewModal(false);
      fetchSubmissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-submissions">
        <div className="submissions-header">
          <div>
            <h1>Submissions Review</h1>
            <p>Review and grade student submissions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="submissions-tabs">
          <button
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <span className="material-icons">assignment</span>
            Task Submissions
          </button>
          <button
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <span className="material-icons">work</span>
            Project Submissions
          </button>
        </div>

        {/* Filters */}
        <div className="submissions-filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="needs_revision">Needs Revision</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
          >
            <option value="oldest">Oldest First</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading submissions...</p>
          </div>
        ) : (
          <>
            <div className="submissions-grid">
              {submissions && submissions.length > 0 ? submissions.map((submission) => (
                <div key={submission._id} className="submission-card">
                  <div className="submission-header">
                    <div className="student-info">
                      <div className="student-avatar">
                        {submission.student?.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div className="student-name">{submission.student?.name}</div>
                        <div className="student-email">{submission.student?.email}</div>
                      </div>
                    </div>
                    <span className={`status-badge ${submission.status}`}>
                      {submission.status}
                    </span>
                  </div>

                  <div className="submission-body">
                    <div className="submission-title">
                      {activeTab === 'tasks' ? submission.task?.title : submission.project?.title}
                    </div>
                    <div className="submission-course">
                      {submission.course?.title}
                    </div>
                    <div className="submission-date">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="submission-footer">
                    <button
                      className="btn-review"
                      onClick={() => openReviewModal(submission._id)}
                    >
                      <span className="material-icons">rate_review</span>
                      Review
                    </button>
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <span className="material-icons">inbox</span>
                  <p>No submissions found</p>
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

        {/* Review Modal */}
        {showReviewModal && selectedSubmission && (
          <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Review Submission</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowReviewModal(false)}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="modal-body">
                {/* Student Info */}
                <div className="review-section">
                  <h3>Student Information</h3>
                  <div className="info-row">
                    <span>Name:</span>
                    <strong>{selectedSubmission.student?.name}</strong>
                  </div>
                  <div className="info-row">
                    <span>Email:</span>
                    <strong>{selectedSubmission.student?.email}</strong>
                  </div>
                </div>

                {/* Submission Content */}
                <div className="review-section">
                  <h3>Submission</h3>
                  {selectedSubmission.githubLink && (
                    <div className="info-row">
                      <span>GitHub:</span>
                      <a href={selectedSubmission.githubLink} target="_blank" rel="noopener noreferrer">
                        {selectedSubmission.githubLink}
                      </a>
                    </div>
                  )}
                  {selectedSubmission.liveLink && (
                    <div className="info-row">
                      <span>Live Link:</span>
                      <a href={selectedSubmission.liveLink} target="_blank" rel="noopener noreferrer">
                        {selectedSubmission.liveLink}
                      </a>
                    </div>
                  )}
                  {selectedSubmission.description && (
                    <div className="description">
                      <strong>Description:</strong>
                      <p>{selectedSubmission.description}</p>
                    </div>
                  )}
                </div>

                {/* Review Form */}
                <div className="review-section">
                  <h3>Your Review</h3>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={reviewData.status}
                      onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                    >
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="needs_revision">Needs Revision</option>
                    </select>
                  </div>

                  {activeTab === 'tasks' ? (
                    <div className="form-group">
                      <label>Points (Max: {selectedSubmission.task?.maxPoints || 0})</label>
                      <input
                        type="number"
                        min="0"
                        max={selectedSubmission.task?.maxPoints || 0}
                        value={reviewData.points}
                        onChange={(e) => setReviewData({...reviewData, points: parseInt(e.target.value)})}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Grade</label>
                        <select
                          value={reviewData.grade}
                          onChange={(e) => setReviewData({...reviewData, grade: e.target.value})}
                        >
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Score (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={reviewData.score}
                          onChange={(e) => setReviewData({...reviewData, score: parseInt(e.target.value)})}
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Feedback</label>
                    <textarea
                      rows="4"
                      value={reviewData.feedback}
                      onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})}
                      placeholder="Provide detailed feedback..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmitReview}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissions;
