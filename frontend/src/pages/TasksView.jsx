import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../styles/Tasks.css';

const API_URL = 'http://localhost:5000/api';

const TasksView = () => {
  const { courseId } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Submission form
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchTasks = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/tasks/${courseId}`, config);
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 403) {
        alert('Please enroll in this internship first');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const openSubmissionModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
    
    // Pre-fill if there's an existing submission
    if (task.existingSubmission) {
      setRepositoryUrl(task.existingSubmission.repositoryUrl || '');
      setLiveUrl(task.existingSubmission.liveUrl || '');
      setDescription(task.existingSubmission.description || '');
    } else {
      setRepositoryUrl('');
      setLiveUrl('');
      setDescription('');
      setUploadedFiles([]);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    setRepositoryUrl('');
    setLiveUrl('');
    setDescription('');
    setUploadedFiles([]);
  };

  const onDrop = (acceptedFiles) => {
    setUploadedFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 3,
    maxSize: 10485760 // 10MB
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!repositoryUrl.trim()) {
      alert('Repository URL is required');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('repositoryUrl', repositoryUrl);
      if (liveUrl) formData.append('liveUrl', liveUrl);
      if (description) formData.append('description', description);
      
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post(
        `${API_URL}/tasks/${courseId}/${selectedTask._id}/submit`,
        formData,
        config
      );

      alert('Task submitted successfully! 🎉');
      closeModal();
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error submitting task:', error);
      alert(error.response?.data?.message || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'not-submitted': { text: 'Not Submitted', class: 'badge-gray' },
      'pending': { text: 'Under Review', class: 'badge-warning' },
      'approved': { text: 'Approved', class: 'badge-success' },
      'rejected': { text: 'Needs Revision', class: 'badge-danger' }
    };
    return badges[status] || badges['not-submitted'];
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="tasks-container">
        <div className="tasks-header">
          <button onClick={() => navigate(`/dashboard/internship/${courseId}`)} className="back-btn">
            ← Back to Internship
          </button>
          <h1>📝 Internship Tasks</h1>
          <p className="subtitle">Complete these tasks to demonstrate your learning</p>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No tasks yet</h2>
            <p>Tasks will appear here as they become available</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => {
              const badge = getStatusBadge(task.submissionStatus);
              return (
                <div key={task._id} className="task-card">
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    <span className={`badge ${badge.class}`}>{badge.text}</span>
                  </div>

                  <p className="task-description">{task.description}</p>

                  <div className="task-meta">
                    <div className="meta-item">
                      <span className="meta-label">Unlocks after:</span>
                      <span className="meta-value">Module {task.unlocksAfterModule}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Points:</span>
                      <span className="meta-value">{task.points}</span>
                    </div>
                  </div>

                  {task.requirements && task.requirements.length > 0 && (
                    <div className="requirements">
                      <h4>Requirements:</h4>
                      <ul>
                        {task.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Existing Submission Feedback */}
                  {task.existingSubmission && task.submissionStatus === 'rejected' && (
                    <div className="feedback-section rejected">
                      <h4>📌 Feedback:</h4>
                      <p>{task.existingSubmission.feedback || 'Please review and resubmit'}</p>
                    </div>
                  )}

                  {task.existingSubmission && task.submissionStatus === 'approved' && (
                    <div className="feedback-section approved">
                      <h4>✅ Approved!</h4>
                      {task.existingSubmission.feedback && (
                        <p>{task.existingSubmission.feedback}</p>
                      )}
                      <p className="score">Score: {task.existingSubmission.score}/{task.points}</p>
                    </div>
                  )}

                  {task.existingSubmission && task.submissionStatus === 'pending' && (
                    <div className="feedback-section pending">
                      <h4>⏳ Submission under review</h4>
                      <p>Your submission is being evaluated. You'll receive feedback soon.</p>
                    </div>
                  )}

                  <div className="task-actions">
                    {task.submissionStatus === 'approved' ? (
                      <button className="btn btn-success" disabled>
                        ✓ Completed
                      </button>
                    ) : (
                      <button 
                        onClick={() => openSubmissionModal(task)}
                        className="btn btn-primary"
                      >
                        {task.submissionStatus === 'not-submitted' ? 'Submit Task' : 'Resubmit Task'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submission Modal */}
        {showModal && selectedTask && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Submit Task: {selectedTask.title}</h2>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="submission-form">
                <div className="form-group">
                  <label>Repository URL <span className="required">*</span></label>
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    required
                  />
                  <small>GitHub, GitLab, or Bitbucket repository link</small>
                </div>

                <div className="form-group">
                  <label>Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://your-project-demo.com"
                  />
                  <small>Deployed version of your project</small>
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your implementation, challenges, and solutions..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Upload Files (Optional)</label>
                  <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    <div className="dropzone-content">
                      <div className="upload-icon">📁</div>
                      {isDragActive ? (
                        <p>Drop files here...</p>
                      ) : (
                        <>
                          <p>Drag & drop files here, or click to select</p>
                          <small>Up to 3 files (ZIP, RAR, PDF, Images) • Max 10MB each</small>
                        </>
                      )}
                    </div>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                      <h4>Selected Files:</h4>
                      <ul>
                        {uploadedFiles.map((file, index) => (
                          <li key={index}>
                            📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
