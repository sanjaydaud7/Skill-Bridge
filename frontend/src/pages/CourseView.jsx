import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ReactPlayer from 'react-player';
import axios from 'axios';
import '../styles/CourseView.css';

const API_URL = 'http://localhost:5000/api';

const CourseView = () => {
  const { courseId } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [courseRes, curriculumRes, tasksRes, progressRes] = await Promise.all([
        axios.get(`${API_URL}/courses/${courseId}`, config),
        axios.get(`${API_URL}/courses/${courseId}/curriculum`, config),
        axios.get(`${API_URL}/tasks/${courseId}`, config),
        axios.get(`${API_URL}/progress/${courseId}`, config)
      ]);

      setCourse(courseRes.data.data);
      setModules(curriculumRes.data.data);
      setTasks(tasksRes.data.data);
      setProgress(progressRes.data.data);
      
      // Set first module as current if none selected
      if (curriculumRes.data.data.length > 0) {
        setCurrentModule(curriculumRes.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      if (error.response?.status === 403) {
        alert('Please enroll in this course first');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = async () => {
    setVideoEnded(true);
    if (!currentModule) return;

    // Check if already completed
    const alreadyCompleted = progress?.enrollment?.progress?.videosCompleted?.some(
      v => v.moduleId === currentModule._id
    );

    if (!alreadyCompleted) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post(
          `${API_URL}/progress/${courseId}/video/${currentModule._id}`,
          {},
          config
        );
        
        // Refresh progress
        const progressRes = await axios.get(`${API_URL}/progress/${courseId}`, config);
        setProgress(progressRes.data.data);
        
        alert('Video marked as completed! 🎉');
      } catch (error) {
        console.error('Error marking video complete:', error);
      }
    }
  };

  const isModuleCompleted = (moduleId) => {
    return progress?.enrollment?.progress?.videosCompleted?.some(
      v => v.moduleId === moduleId
    );
  };

  const isTaskCompleted = (taskId) => {
    return tasks.find(t => t._id === taskId)?.submissionStatus === 'approved';
  };

  const selectModule = (module) => {
    setCurrentModule(module);
    setVideoEnded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-container">
          <div className="empty-state">
            <h2>Course not found</h2>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="course-view-container">
        {/* Main Content Area */}
        <div className="course-main">
          {/* Course Header */}
          <div className="course-header">
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <h1>{course.title}</h1>
            <div className="course-meta-info">
              <span className="badge">{course.category}</span>
              <span className="badge badge-secondary">{course.difficulty}</span>
              <span className="duration">{course.duration} weeks</span>
            </div>
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress?.stats?.completionPercentage || 0}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {progress?.stats?.completionPercentage || 0}% Complete
              </p>
            </div>
          </div>

          {/* Video Player */}
          {currentModule && (
            <div className="video-section">
              <h2>{currentModule.title}</h2>
              <p className="module-description">{currentModule.description}</p>
              
              <div className="video-player-wrapper">
                <ReactPlayer
                  url={currentModule.videoUrl}
                  controls
                  width="100%"
                  height="100%"
                  onEnded={handleVideoEnd}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1 }
                    }
                  }}
                />
              </div>

              {videoEnded && !isModuleCompleted(currentModule._id) && (
                <div className="video-completed-message">
                  ✅ Video completed! Progress has been saved.
                </div>
              )}

              {/* Resources */}
              {currentModule.resources && currentModule.resources.length > 0 && (
                <div className="resources-section">
                  <h3>📚 Resources</h3>
                  <div className="resources-list">
                    {currentModule.resources.map((resource, index) => (
                      <a 
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-item"
                      >
                        <span className="resource-icon">
                          {resource.type === 'pdf' && '📄'}
                          {resource.type === 'link' && '🔗'}
                          {resource.type === 'code' && '💻'}
                          {resource.type === 'document' && '📃'}
                        </span>
                        <span>{resource.title}</span>
                        <span className="external-icon">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-label">Videos Completed</span>
              <span className="stat-value">
                {progress?.stats?.completedVideos || 0} / {progress?.stats?.totalModules || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tasks Approved</span>
              <span className="stat-value">
                {progress?.stats?.completedTasks || 0} / {progress?.stats?.totalTasks || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Project Status</span>
              <span className="stat-value">
                {progress?.stats?.projectApproved ? '✅ Approved' : '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="course-sidebar">
          {/* Curriculum */}
          <div className="sidebar-section">
            <h3>📖 Course Curriculum</h3>
            <div className="curriculum-list">
              {modules.map((module) => (
                <div
                  key={module._id}
                  className={`curriculum-item ${currentModule?._id === module._id ? 'active' : ''} ${isModuleCompleted(module._id) ? 'completed' : ''}`}
                  onClick={() => selectModule(module)}
                >
                  <div className="module-number">
                    {isModuleCompleted(module._id) ? '✓' : module.moduleNumber}
                  </div>
                  <div className="module-info">
                    <h4>{module.title}</h4>
                    <p>{Math.floor(module.duration / 60)} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="sidebar-section">
            <h3>📝 Tasks</h3>
            <div className="tasks-list">
              {tasks.length === 0 ? (
                <p className="no-tasks">No tasks yet</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`task-item ${isTaskCompleted(task._id) ? 'completed' : ''}`}
                    onClick={() => navigate(`/dashboard/course/${courseId}/tasks`)}
                  >
                    <div className="task-status">
                      {task.submissionStatus === 'approved' && '✅'}
                      {task.submissionStatus === 'pending' && '⏳'}
                      {task.submissionStatus === 'rejected' && '❌'}
                      {task.submissionStatus === 'not-submitted' && '○'}
                    </div>
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <p className="task-status-text">{task.submissionStatus}</p>
                    </div>
                  </div>
                ))
              )}
              <button 
                onClick={() => navigate(`/dashboard/course/${courseId}/tasks`)}
                className="btn btn-sm btn-outline"
              >
                View All Tasks
              </button>
            </div>
          </div>

          {/* Certificate */}
          <div className="sidebar-section">
            <h3>🏆 Certificate</h3>
            {progress?.stats?.completionPercentage === 100 && 
             progress?.stats?.completedTasks === progress?.stats?.totalTasks &&
             progress?.stats?.projectApproved ? (
              <button 
                onClick={() => navigate(`/dashboard/certificates`)}
                className="btn btn-primary btn-full"
              >
                Get Certificate
              </button>
            ) : (
              <div className="certificate-locked">
                <p>Complete all requirements to unlock certificate</p>
                <ul className="requirements-list">
                  <li className={progress?.stats?.completionPercentage === 100 ? 'done' : ''}>
                    {progress?.stats?.completionPercentage === 100 ? '✅' : '○'} All videos
                  </li>
                  <li className={progress?.stats?.completedTasks === progress?.stats?.totalTasks ? 'done' : ''}>
                    {progress?.stats?.completedTasks === progress?.stats?.totalTasks ? '✅' : '○'} All tasks
                  </li>
                  <li className={progress?.stats?.projectApproved ? 'done' : ''}>
                    {progress?.stats?.projectApproved ? '✅' : '○'} Final project
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
