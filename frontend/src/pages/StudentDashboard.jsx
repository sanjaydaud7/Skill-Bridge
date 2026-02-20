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
            <h3>{stats?.totalCourses || 0}</h3>
            <p>Total Internships</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-blue">
            <span className="material-icons">trending_up</span>
          </div>
          <div className="stat-info">
            <h3>{stats?.inProgressCourses || 0}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-green">
            <span className="material-icons">check_circle</span>
          </div>
          <div className="stat-info">
            <h3>{stats?.completedCourses || 0}</h3>
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
                <p className="activity-title">{enrollment.courseId?.title || 'Untitled Course'}</p>
                <p className="activity-time">Last accessed: {new Date(enrollment.lastAccessed || enrollment.enrolledAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => navigate(`/dashboard/course/${enrollment.courseId?._id}`)}
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
        <div className="courses-grid">
          {filteredCourses.map((enrollment) => (
            <div key={enrollment._id} className="course-card">
              <img
                src={enrollment.courseId?.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={enrollment.courseId?.title || 'Course'}
                className="course-thumbnail"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=No+Image')}
              />
              <div className="course-info">
                <h3>{enrollment.courseId?.title || 'Untitled Course'}</h3>
                <div className="course-meta">
                  <span className="badge">{enrollment.courseId?.category || 'General'}</span>
                  <span className="duration">
                    <span className="material-icons">schedule</span>
                    {enrollment.courseId?.duration || 0} weeks
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${enrollment.progress?.completionPercentage || 0}%` }}
                  ></div>
                </div>
                <p className="progress-text">{enrollment.progress?.completionPercentage || 0}% Complete</p>
                <button
                  onClick={() => navigate(`/dashboard/course/${enrollment.courseId?._id}`)}
                  className="btn btn-primary btn-block"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
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
        <span className="section-subtitle">Access all your course videos</span>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">video_library</span>
          <h3>No videos available</h3>
          <p>Enroll in a course to access video lessons</p>
        </div>
      ) : (
        <div className="video-list">
          {enrolledCourses.map((enrollment) => (
            <div key={enrollment._id} className="video-course-section">
              <h3 className="course-title-video">{enrollment.courseId?.title || 'Untitled Course'}</h3>
              <button
                onClick={() => navigate(`/dashboard/course/${enrollment.courseId?._id}`)}
                className="btn btn-outline"
              >
                <span className="material-icons">play_arrow</span>
                View All Videos
              </button>
            </div>
          ))}
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
          <p>Your assignments will appear here once you enroll in courses</p>
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
        <p>Complete your courses to unlock final projects</p>
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
          <p>Enroll in courses to track your progress</p>
        </div>
      ) : (
        <div className="progress-list">
          {enrolledCourses.map((enrollment) => (
            <div key={enrollment._id} className="progress-item">
              <div className="progress-course-info">
                <h4>{enrollment.courseId?.title || 'Untitled Course'}</h4>
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
          <p>Complete courses to earn certificates</p>
        </div>
      ) : (
        <div className="certificates-grid">
          {certificates.map((cert) => (
            <div key={cert._id} className="certificate-card">
              <div className="certificate-icon">
                <span className="material-icons">verified</span>
              </div>
              <h4>{cert.courseTitle}</h4>
              <p>Issued on: {new Date(cert.issuedAt).toLocaleDateString()}</p>
              <button className="btn btn-outline btn-sm">Download PDF</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Resources & Materials Component
const ResourcesMaterials = ({ enrolledCourses }) => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Resources & Materials</h2>
        <span className="section-subtitle">Access course materials and resources</span>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">folder</span>
          <h3>No resources available</h3>
          <p>Enroll in courses to access learning materials</p>
        </div>
      ) : (
        <div className="resources-list">
          {enrolledCourses.map((enrollment) => (
            <div key={enrollment._id} className="resource-group">
              <h4>{enrollment.courseId?.title || 'Untitled Course'}</h4>
              <div className="resource-items">
                <div className="resource-item">
                  <span className="material-icons">description</span>
                  <span>Course Materials</span>
                </div>
                <div className="resource-item">
                  <span className="material-icons">code</span>
                  <span>Code Samples</span>
                </div>
                <div className="resource-item">
                  <span className="material-icons">link</span>
                  <span>External Resources</span>
                </div>
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
        axios.get(`${API_URL}/courses/user/enrolled`, config),
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
    { id: 'resources', label: 'Resources', icon: 'folder' },
    { id: 'profile', label: 'Profile Settings', icon: 'settings' },
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
                onClick={() => setActiveSection(item.id)}
              >
                <span className="material-icons">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
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
