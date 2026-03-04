import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/InternshipView.css';
import { saveAs } from 'file-saver';

const API_URL = 'http://localhost:5000/api';

const InternshipView = () => {
  const { courseId } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [INTERNSHIP, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null); // For videos array support
  const [loading, setLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const videoRef = useRef(null);
  const [certificate, setCertificate] = useState(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  // Fetch certificate if eligible
  useEffect(() => {
    const fetchCertificate = async () => {
      if (
        progress?.stats?.completionPercentage === 100 &&
        progress?.stats?.completedTasks === progress?.stats?.totalTasks &&
        progress?.stats?.projectApproved
      ) {
        setLoadingCertificate(true);
        try {
          const res = await axios.get(`${API_URL}/certificates`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // API returns { success, count, data: [...] }
          const certs = res.data?.data || [];
          const courseCert = certs.find(c => c.courseId?._id === courseId || c.courseId === courseId);
          if (courseCert) {
            setCertificate(courseCert);
          } else {
            setCertificate(null);
          }
        } catch (err) {
          setCertificate(null);
        }
        setLoadingCertificate(false);
      }
    };
    fetchCertificate();
  }, [progress, courseId, token]);

  // Download certificate PDF
  const handleDownloadCertificate = async () => {
    if (!certificate) return;
    try {
      const res = await axios.get(`${API_URL}/certificates/${certificate._id}/download`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      saveAs(res.data, `Certificate-${certificate.certificateNumber || certificate._id}.pdf`);
    } catch (err) {
      alert('Failed to download certificate.');
    }
  };

  // Certificate generation handler
  const handleGenerateCertificate = async () => {
    setLoadingCertificate(true);
    try {
      // Use 'BYPASS' for paymentId if payment is bypassed
      const paymentId = progress?.enrollment?.paymentId || 'BYPASS';
      const res = await axios.post(
        `${API_URL}/certificates/${courseId}/generate`,
        { paymentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.success) {
        setCertificate(res.data.data);
        alert('Certificate generated successfully!');
      } else {
        alert(res.data.message || 'Failed to generate certificate.');
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to generate certificate.'
      );
      setCertificate(null);
    }
    setLoadingCertificate(false);
  };

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
        axios.get(`${API_URL}/internships/${courseId}`, config),
        axios.get(`${API_URL}/internships/${courseId}/curriculum`, config),
        axios.get(`${API_URL}/tasks/${courseId}`, config),
        axios.get(`${API_URL}/progress/${courseId}`, config)
      ]);

      setCourse(courseRes.data.data);
      setModules(curriculumRes.data.data);
      setTasks(tasksRes.data.data);
      setProgress(progressRes.data.data);
      
      // Set first module/video as current if none selected
      if (curriculumRes.data.data.length > 0) {
        const firstModule = curriculumRes.data.data[0];
        setCurrentModule(firstModule);
        
        // If module has videos array, set first video as current
        if (firstModule.videos && firstModule.videos.length > 0) {
          setCurrentVideo(firstModule.videos[0]);
        } else {
          setCurrentVideo(null);
        }
        
        // Expand first module by default
        setExpandedModules({ [firstModule._id]: true });
      }
    } catch (error) {
      console.error('Error fetching INTERNSHIP data:', error);
      if (error.response?.status === 403) {
        alert('Please enroll in this internship first');
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

  // Bypass function to complete all videos, tasks, and project for testing
  const handleBypassCompletion = async () => {
    if (!window.confirm('⚠️ TESTING MODE: This will mark ALL videos, tasks, and project as complete. Continue?')) {
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      console.log('Calling bypass-complete endpoint for courseId:', courseId);

      // Call the bypass-complete endpoint
      const response = await axios.post(
        `${API_URL}/progress/${courseId}/bypass-complete`,
        {},
        config
      );

      console.log('Bypass response:', response.data);

      // Refresh progress
      const progressRes = await axios.get(`${API_URL}/progress/${courseId}`, config);
      setProgress(progressRes.data.data);

      // Refresh tasks
      const tasksRes = await axios.get(`${API_URL}/tasks/${courseId}`, config);
      setTasks(tasksRes.data.data);

      const { videosCompleted, tasksCompleted, projectApproved } = response.data.data;

      alert(
        `✅ Bypass completed!\n\n` +
        `📹 Videos: ${videosCompleted} completed\n` +
        `📝 Tasks: ${tasksCompleted} completed\n` +
        `🎯 Project: ${projectApproved ? 'Approved' : 'N/A'}\n\n` +
        `🏆 Certificate is now available!`
      );
    } catch (error) {
      console.error('Error in bypass completion:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`❌ Error during bypass: ${errorMsg}\n\nCheck console for details.`);
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
    
    // If module has videos array, set first video as current
    if (module.videos && module.videos.length > 0) {
      setCurrentVideo(module.videos[0]);
    } else {
      setCurrentVideo(null);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectVideo = (video) => {
    setCurrentVideo(video);
    setVideoEnded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Get the current video URL to play
  const getCurrentVideoUrl = () => {
    if (currentVideo) {
      return currentVideo.videoUrl;
    }
    if (currentModule && currentModule.videoUrl) {
      return currentModule.videoUrl;
    }
    return null;
  };

  // Get current video title
  const getCurrentVideoTitle = () => {
    if (currentVideo) {
      return currentVideo.title;
    }
    if (currentModule) {
      return currentModule.title;
    }
    return '';
  };

  // Get current video description
  const getCurrentVideoDescription = () => {
    if (currentVideo && currentVideo.description) {
      return currentVideo.description;
    }
    if (currentModule && currentModule.description) {
      return currentModule.description;
    }
    return '';
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    
    let videoId = '';
    
    // Handle youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    }
    // Handle youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // Handle youtube.com/embed/VIDEO_ID
    else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
  };

  // Handle video end event
  const handleVideoEnded = () => {
    handleVideoEnd();
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading internship...</p>
        </div>
      </div>
    );
  }

  if (!INTERNSHIP) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-container">
          <div className="empty-state">
            <h2>Internship not found</h2>
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
      <div className="iv-container">
        {/* Main Content Area */}
        <div className="iv-main">
          {/* INTERNSHIP Header */}
          <div className="iv-header">
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <h1>{INTERNSHIP.title}</h1>
            <div className="iv-meta-info">
              <span className="badge">{INTERNSHIP.category}</span>
              <span className="badge badge-secondary">{INTERNSHIP.difficulty}</span>
              <span className="duration">{INTERNSHIP.duration} weeks</span>
            </div>
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress?.stats?.completionPercentage || 0}%` }}
                ></div>
              </div>
              <div className="progress-info-row">
                <p className="progress-text">
                  {progress?.stats?.completionPercentage || 0}% Complete
                </p>
                <button 
                  onClick={handleBypassCompletion}
                  className="bypass-btn"
                  title="Testing: Mark all videos, tasks, and project as complete"
                >
                  ⚡ Complete All (Test)
                </button>
              </div>
            </div>
          </div>

          {/* Video Player */}
          {(currentModule || currentVideo) && getCurrentVideoUrl() && (
            <div className="video-section">
              <h2>{getCurrentVideoTitle()}</h2>
              {getCurrentVideoDescription() && (
                <p className="module-description">{getCurrentVideoDescription()}</p>
              )}
              
              <div className="video-player-wrapper">
                {isYouTubeUrl(getCurrentVideoUrl()) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(getCurrentVideoUrl())}
                    title={getCurrentVideoTitle()}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    controls
                    controlsList="nodownload"
                    onEnded={handleVideoEnded}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#000'
                    }}
                    key={getCurrentVideoUrl()}
                  >
                    <source src={getCurrentVideoUrl()} type="video/mp4" />
                    <source src={getCurrentVideoUrl()} type="video/webm" />
                    <source src={getCurrentVideoUrl()} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                )}
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
        <div className="iv-sidebar">
          {/* Curriculum */}
          <div className="sidebar-section">
            <h3>📖 Internship Curriculum</h3>
            <div className="curriculum-list">
              {modules.map((module) => (
                <div key={module._id} className="curriculum-module-wrapper">
                  {/* Module/Week Header */}
                  <div
                    className={`curriculum-item ${currentModule?._id === module._id ? 'active' : ''} ${isModuleCompleted(module._id) ? 'completed' : ''}`}
                    onClick={() => {
                      if (module.videos && module.videos.length > 0) {
                        toggleModule(module._id);
                      } else {
                        selectModule(module);
                      }
                    }}
                  >
                    <div className="module-number">
                      {isModuleCompleted(module._id) ? '✓' : module.moduleNumber}
                    </div>
                    <div className="module-info">
                      <h4>{module.title}</h4>
                      <p>
                        {module.videos && module.videos.length > 0 
                          ? `${module.videos.length} videos`
                          : module.duration ? `${Math.floor(module.duration / 60)} min` : 'Video'
                        }
                      </p>
                    </div>
                    {module.videos && module.videos.length > 0 && (
                      <span className="expand-icon">
                        {expandedModules[module._id] ? '▼' : '▶'}
                      </span>
                    )}
                  </div>

                  {/* Day-wise Videos (if videos array exists) */}
                  {module.videos && module.videos.length > 0 && expandedModules[module._id] && (
                    <div className="videos-list">
                      {module.videos.map((video, index) => (
                        <div
                          key={index}
                          className={`video-item ${currentVideo && currentVideo.videoUrl === video.videoUrl ? 'active-video' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentModule(module);
                            selectVideo(video);
                          }}
                        >
                          <span className="video-play-icon">▶</span>
                          <div className="video-item-info">
                            <h5>{video.title}</h5>
                            {video.duration && (
                              <span className="video-duration">
                                {Math.floor(video.duration / 60)} min
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    onClick={() => navigate(`/dashboard/internship/${courseId}/tasks`)}
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
                onClick={() => navigate(`/dashboard/internship/${courseId}/tasks`)}
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
                <div className="certificate-ready">
                  <div className="ready-badge">
                    ✅ You're Eligible!
                  </div>
                  <p className="ready-message">
                    Congratulations! You've completed all requirements.
                  </p>
                  {loadingCertificate ? (
                    <p>Loading certificate...</p>
                  ) : certificate ? (
                    <>
                      <button
                        onClick={handleDownloadCertificate}
                        className="btn btn-primary btn-full"
                      >
                        📄 Download Certificate PDF
                      </button>
                      <p className="certificate-note">
                        Certificate unlocked! You can download it as PDF.
                      </p>
                    </>
                  ) : (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/certificates?courseId=${courseId}`)}
                          className="btn btn-success btn-full"
                        >
                          🎓 Get Certificate
                        </button>
                        <p className="certificate-note">
                          (Use bypass payment option for testing)
                        </p>
                      </>
                  )}
                </div>
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
      <Footer />
    </div>
  );
};

export default InternshipView;
