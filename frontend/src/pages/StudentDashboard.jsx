import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/Dashboard.css';

const API_URL = 'http://localhost:5000/api';

// Dashboard Overview Component
const DashboardOverview = ({ stats, enrolledCourses, navigate }) => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Dashboard Overview</h2>
        <span className="section-subtitle">Your learning progress at a glance</span>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gradient-purple">
            <span className="material-icons">school</span>
          </div>
          <div className="stat-info">
            <h3>{stats?.totalInternships || 0}</h3>
            <p>Total Internships</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-blue">
            <span className="material-icons">trending_up</span>
          </div>
          <div className="stat-info">
            <h3>{stats?.inProgressInternships || 0}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-green">
            <span className="material-icons">check_circle</span>
          </div>
          <div className="stat-info">
            <h3>{stats?.completedInternships || 0}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-orange">
            <span className="material-icons">emoji_events</span>
          </div>
          <div className="stat-info">
            <h3>{stats?.certificatesEarned || 0}</h3>
            <p>Certificates</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {enrolledCourses.slice(0, 3).map((enrollment) => (
            <div key={enrollment._id} className="activity-item">
              <span className="material-icons">play_circle</span>
              <div className="activity-details">
                <p className="activity-title">{enrollment.courseId?.title || 'Untitled Internship'}</p>
                <p className="activity-time">Last accessed: {new Date(enrollment.lastAccessed || enrollment.enrolledAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => navigate(`/dashboard/internship/${enrollment.courseId?._id}`)}
                className="btn-activity"
              >
                Continue
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// My Internships Component
const MyInternships = ({ enrolledCourses, navigate }) => {
  const [filter, setFilter] = useState('all');

  const filteredCourses = enrolledCourses.filter((enrollment) => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return (enrollment.progress?.completionPercentage || 0) < 100;
    if (filter === 'completed') return (enrollment.progress?.completionPercentage || 0) === 100;
    return true;
  });

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>My Internships</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({enrolledCourses.length})
          </button>
          <button
            className={filter === 'in-progress' ? 'active' : ''}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">school</span>
          <h3>No internships found</h3>
          <p>Start learning by enrolling in an internship</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Browse Internships
          </button>
        </div>
      ) : (
        <div className="internships-grid">
          {filteredCourses.map((enrollment) => {
            const pct = enrollment.progress?.completionPercentage || 0;
            const isCompleted = pct === 100;
            const difficulty = enrollment.courseId?.difficulty || 'beginner';
            return (
              <div key={enrollment._id} className="internship-card">
                {/* Thumbnail with status overlay */}
                <div className="internship-thumbnail-wrapper">
                  <img
                    src={enrollment.courseId?.thumbnail || 'https://placehold.co/400x220/667eea/white?text=Internship'}
                    alt={enrollment.courseId?.title || 'Internship'}
                    className="internship-thumbnail"
                    onError={(e) => (e.target.src = 'https://placehold.co/400x220/667eea/white?text=Internship')}
                  />
                  <span className={`internship-status-badge ${isCompleted ? 'completed' : 'in-progress'}`}>
                    <span className="material-icons">{isCompleted ? 'check_circle' : 'play_circle'}</span>
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="internship-info">
                  {/* Category + Difficulty badges */}
                  <div className="internship-meta">
                    <span className="badge">{enrollment.courseId?.category || 'General'}</span>
                    <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty}</span>
                  </div>

                  {/* Title */}
                  <h3>{enrollment.courseId?.title || 'Untitled Internship'}</h3>

                  {/* Stats row */}
                  <div className="internship-stats-row">
                    <span className="internship-stat">
                      <span className="material-icons">schedule</span>
                      {enrollment.courseId?.duration || 0} weeks
                    </span>
                    <span className="internship-stat">
                      <span className="material-icons">view_module</span>
                      {enrollment.courseId?.totalModules || 0} modules
                    </span>
                    <span className="internship-stat">
                      <span className="material-icons">task_alt</span>
                      {enrollment.courseId?.totalTasks || 0} tasks
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span className="progress-pct">{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Enrolled date */}
                  <p className="enrolled-date">
                    <span className="material-icons">calendar_today</span>
                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  <button
                    onClick={() => navigate(`/dashboard/internship/${enrollment.courseId?._id}`)}
                    className="btn-continue"
                  >
                    {isCompleted ? 'Review Internship' : 'Continue Internship'}
                    <span className="material-icons">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Video Lessons Component
const VideoLessons = ({ enrolledCourses, navigate }) => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Video Lessons</h2>
        <span className="section-subtitle">
          {enrolledCourses.length > 0
            ? `${enrolledCourses.length} internship${enrolledCourses.length > 1 ? 's' : ''} · ${enrolledCourses.reduce((sum, e) => sum + (e.courseId?.totalModules || 0), 0)} total modules`
            : 'Access all your internship videos'}
        </span>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">video_library</span>
          <h3>No videos available</h3>
          <p>Enroll in an internship to access video lessons</p>
        </div>
      ) : (
        <div className="video-cards-grid">
          {enrolledCourses.map((enrollment) => {
            const watched = enrollment.progress?.videosCompleted?.length || 0;
            const total   = enrollment.courseId?.totalModules || 0;
            const pct     = total > 0 ? Math.round((watched / total) * 100) : (enrollment.progress?.completionPercentage || 0);
            const isCompleted = pct >= 100;
            const difficulty  = enrollment.courseId?.difficulty || 'beginner';

            return (
              <div
                key={enrollment._id}
                className="video-card"
                onClick={() => navigate(`/dashboard/internship/${enrollment.courseId?._id}`)}
              >
                {/* Thumbnail with play overlay */}
                <div className="video-card-thumbnail-wrapper">
                  <img
                    src={enrollment.courseId?.thumbnail || 'https://placehold.co/480x270/667eea/white?text=Video+Lessons'}
                    alt={enrollment.courseId?.title || 'Internship'}
                    className="video-card-thumbnail"
                    onError={(e) => (e.target.src = 'https://placehold.co/480x270/667eea/white?text=Video+Lessons')}
                  />
                  <div className="video-play-overlay">
                    <div className="video-play-btn">
                      <span className="material-icons">{isCompleted ? 'replay' : 'play_arrow'}</span>
                    </div>
                  </div>
                  {/* Module count chip */}
                  <span className="video-module-chip">
                    <span className="material-icons">video_library</span>
                    {total} modules
                  </span>
                </div>

                {/* Card body */}
                <div className="video-card-body">
                  {/* Badges */}
                  <div className="video-card-badges">
                    <span className="badge">{enrollment.courseId?.category || 'General'}</span>
                    <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty}</span>
                  </div>

                  <h3 className="video-card-title">{enrollment.courseId?.title || 'Untitled Internship'}</h3>

                  {/* Stats row */}
                  <div className="video-card-stats">
                    <span className="video-stat">
                      <span className="material-icons">check_circle</span>
                      {watched} / {total} watched
                    </span>
                    <span className="video-stat">
                      <span className="material-icons">schedule</span>
                      {enrollment.courseId?.duration || 0} weeks
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="video-progress-section">
                    <div className="video-progress-header">
                      <span>{isCompleted ? 'Completed' : 'Progress'}</span>
                      <span className="video-progress-pct">{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill${isCompleted ? ' progress-fill-complete' : ''}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <button className={`btn-watch${isCompleted ? ' btn-watch-done' : ''}`}>
                    <span className="material-icons">{isCompleted ? 'replay' : 'play_circle'}</span>
                    {isCompleted ? 'Rewatch' : watched > 0 ? 'Continue Watching' : 'Start Watching'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Tasks & Assignments Component
const TasksAssignments = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-section">Loading tasks...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Tasks & Assignments</h2>
        <span className="section-subtitle">Complete your assignments to progress</span>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">assignment</span>
          <h3>No tasks assigned</h3>
          <p>Your assignments will appear here once you Enroll in internships</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h4>{task.title}</h4>
                <span className={`task-status ${task.status}`}>{task.status}</span>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-meta">
                <span>
                  <span className="material-icons">schedule</span>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
                <span>
                  <span className="material-icons">emoji_events</span>
                  {task.points} points
                </span>
              </div>
              <button className="btn btn-sm btn-primary">
                {task.status === 'pending' ? 'Start Task' : 'View Submission'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// My Submissions Component
const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-section">Loading submissions...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>My Submissions</h2>
        <span className="section-subtitle">Track your submitted assignments</span>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">upload_file</span>
          <h3>No submissions yet</h3>
          <p>Your submitted assignments will appear here</p>
        </div>
      ) : (
        <div className="submissions-list">
          {submissions.map((submission) => (
            <div key={submission._id} className="submission-item">
              <div className="submission-info">
                <h4>{submission.taskTitle}</h4>
                <p>Submitted on: {new Date(submission.submittedAt).toLocaleString()}</p>
              </div>
              <div className="submission-status">
                <span className={`status-badge ${submission.status}`}>{submission.status}</span>
                {submission.grade && <span className="grade">Grade: {submission.grade}%</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Final Projects Component
const FinalProjects = () => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Final Projects</h2>
        <span className="section-subtitle">Showcase your learning with capstone projects</span>
      </div>

      <div className="empty-state">
        <span className="material-icons empty-icon">work</span>
        <h3>No final projects yet</h3>
        <p>Complete your INTERNSHIPS to unlock final projects</p>
      </div>
    </div>
  );
};

// Progress Tracking Component
const ProgressTracking = ({ enrolledCourses }) => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Progress Tracking</h2>
        <span className="section-subtitle">Monitor your learning journey</span>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">insights</span>
          <h3>No progress data</h3>
          <p>Enroll in internships to track your progress</p>
        </div>
      ) : (
        <div className="progress-list">
          {enrolledCourses.map((enrollment) => (
            <div key={enrollment._id} className="progress-item">
              <div className="progress-INTERNSHIP-info">
                <h4>{enrollment.courseId?.title || 'Untitled INTERNSHIP'}</h4>
                <div className="progress-bar-large">
                  <div
                    className="progress-fill"
                    style={{ width: `${enrollment.progress?.completionPercentage || 0}%` }}
                  ></div>
                </div>
                <div className="progress-details">
                  <span>{enrollment.progress?.completionPercentage || 0}% Complete</span>
                  <span>
                    {enrollment.progress?.completedModules || 0} / {enrollment.courseId?.totalModules || 0} modules
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Certificates Component
const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCertificates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (cert) => {
    setDownloading(cert._id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/certificates/${cert._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SkillBridge_Certificate_${cert.certificateNumber || cert._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return <div className="loading-section">Loading certificates...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>My Certificates</h2>
        <span className="section-subtitle">Your earned certificates</span>
      </div>

      {certificates.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">card_membership</span>
          <h3>No certificates yet</h3>
          <p>Complete internships to earn certificates</p>
        </div>
      ) : (
        <div className="certificates-grid">
          {certificates.map((cert) => (
            <div key={cert._id} className="certificate-card">
              <div className="certificate-icon">
                <span className="material-icons">verified</span>
              </div>
              <h4>{cert.courseId?.title || 'INTERNSHIP Certificate'}</h4>
              <p>Issued on: {new Date(cert.issuedAt).toLocaleDateString()}</p>
              {cert.certificateNumber && (
                <p style={{ fontSize: '12px', color: '#888' }}>No: {cert.certificateNumber}</p>
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => downloadCertificate(cert)}
                disabled={downloading === cert._id}
              >
                {downloading === cert._id ? '⏳ Downloading...' : '📥 Download PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Resources & Materials Component
const TYPE_ICONS = {
  pdf: 'picture_as_pdf', image: 'image', document: 'description',
  video: 'videocam', link: 'link', other: 'attach_file'
};
const TYPE_COLORS = {
  pdf: '#ef4444', image: '#8b5cf6', document: '#3b82f6',
  video: '#f59e0b', link: '#10b981', other: '#64748b'
};

const ResourcesMaterials = ({ enrolledCourses }) => {
  const { token } = useAuth();
  const [resources, setResources] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoadingRes(true);
      try {
        const params = new URLSearchParams();
        if (typeFilter)  params.set('type', typeFilter);
        const res = await axios.get(`${API_URL}/resources?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setResources(res.data.data);
      } catch (err) {
        console.error('Resources fetch error:', err);
      } finally {
        setLoadingRes(false);
      }
    };
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, token]);

  const handleOpen = async (resource) => {
    try {
      const res = await axios.post(`${API_URL}/resources/${resource._id}/download`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(res.data.fileUrl || resource.fileUrl, '_blank', 'noreferrer');
    } catch {
      window.open(resource.fileUrl, '_blank', 'noreferrer');
    }
  };

  const globalResources  = resources.filter(r => !r.internshipId);
  const internshipResources = resources.filter(r => r.internshipId);

  const filtered = scopeFilter === 'global'
    ? globalResources
    : scopeFilter === 'internship'
      ? internshipResources
      : resources;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Resources & Materials</h2>
        <span className="section-subtitle">Learning materials uploaded by admins</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <select
          value={scopeFilter}
          onChange={e => setScopeFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', background: '#fff', cursor: 'pointer' }}
        >
          <option value="">All Resources</option>
          <option value="global">Global</option>
          <option value="internship">My Internships</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', background: '#fff', cursor: 'pointer' }}
        >
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="document">Document</option>
          <option value="video">Video</option>
          <option value="link">Link</option>
        </select>
      </div>

      {loadingRes ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading resources…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {enrolledCourses.length === 0 ? (
            <>
              <span className="material-icons empty-icon">folder</span>
              <h3>No resources yet</h3>
              <p>Enroll in internships to access learning materials</p>
            </>
          ) : (
            <>
              <span className="material-icons empty-icon">folder_open</span>
              <h3>No resources available</h3>
              <p>Your instructor hasn't uploaded any materials yet</p>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(resource => (
            <div
              key={resource._id}
              style={{
                background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                padding: '18px', display: 'flex', flexDirection: 'column', gap: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: `${TYPE_COLORS[resource.type]}22`
                }}>
                  <span className="material-icons" style={{ color: TYPE_COLORS[resource.type], fontSize: 22 }}>
                    {TYPE_ICONS[resource.type] || 'attach_file'}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {resource.title}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                    {resource.type}
                  </p>
                </div>
              </div>

              {resource.description && (
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  {resource.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                {resource.internshipId
                  ? <span style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, fontWeight: 500 }}>
                      {resource.internshipId.title}
                    </span>
                  : <span style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#d1fae5', color: '#065f46', borderRadius: 20, fontWeight: 500 }}>
                      Global
                    </span>
                }
                <button
                  onClick={() => handleOpen(resource)}
                  style={{
                    padding: '6px 14px', background: 'linear-gradient(135deg, #0D1B4B, #162362)',
                    color: '#E8B84B', border: 'none', borderRadius: 8,
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>
                    {resource.type === 'link' ? 'open_in_new' : 'download'}
                  </span>
                  {resource.type === 'link' ? 'Open' : 'Download'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update
    console.log('Profile updated:', formData);
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Profile Settings</h2>
        <span className="section-subtitle">Manage your account information</span>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <span className="material-icons">account_circle</span>
          </div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <span className="user-role">{user?.role}</span>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your phone number"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

// Main Dashboard Component
const StudentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, coursesRes] = await Promise.all([
        axios.get(`${API_URL}/progress/stats`, config),
        axios.get(`${API_URL}/internships/user/enrolled`, config),
      ]);

      setStats(statsRes.data.data);
      setEnrolledCourses(coursesRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'internships', label: 'My Internships', icon: 'school' },
    { id: 'videos', label: 'Video Lessons', icon: 'video_library' },
    { id: 'tasks', label: 'Tasks & Assignments', icon: 'assignment' },
    { id: 'submissions', label: 'My Submissions', icon: 'upload_file' },
    { id: 'projects', label: 'Final Projects', icon: 'work' },
    { id: 'progress', label: 'Progress Tracking', icon: 'insights' },
    { id: 'certificates', label: 'Certificates', icon: 'card_membership' },
    { id: 'portfolio', label: 'My Portfolio', icon: 'person_pin', link: '/portfolio/me' },
    { id: 'resume', label: 'Resume Builder', icon: 'description', link: '/resume-builder' },
    { id: 'resources', label: 'Resources', icon: 'folder' },
    { id: 'profile', label: 'Profile Settings', icon: 'settings', link: '/profile' },
  ];

  const renderSection = () => {
    if (loading) {
      return (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview stats={stats} enrolledCourses={enrolledCourses} navigate={navigate} />;
      case 'internships':
        return <MyInternships enrolledCourses={enrolledCourses} navigate={navigate} />;
      case 'videos':
        return <VideoLessons enrolledCourses={enrolledCourses} navigate={navigate} />;
      case 'tasks':
        return <TasksAssignments />;
      case 'submissions':
        return <MySubmissions />;
      case 'projects':
        return <FinalProjects />;
      case 'progress':
        return <ProgressTracking enrolledCourses={enrolledCourses} />;
      case 'certificates':
        return <MyCertificates />;
      case 'resources':
        return <ResourcesMaterials enrolledCourses={enrolledCourses} />;
      case 'profile':
        return <ProfileSettings user={user} />;
      default:
        return <DashboardOverview stats={stats} enrolledCourses={enrolledCourses} navigate={navigate} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="user-info">
              <div className="user-avatar">
                <span className="material-icons">account_circle</span>
              </div>
              {sidebarOpen && (
                <div className="user-details">
                  <h4>{user?.name}</h4>
                  <p>{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => item.link ? navigate(item.link) : setActiveSection(item.id)}
              >
                <span className="material-icons">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && item.link && <span className="material-icons" style={{fontSize:'14px',marginLeft:'auto',opacity:0.5}}>open_in_new</span>}
              </button>
            ))}
          </nav>

          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-icons">{sidebarOpen ? 'chevron_left' : 'chevron_right'}</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Continue your learning journey</p>
          </div>
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
