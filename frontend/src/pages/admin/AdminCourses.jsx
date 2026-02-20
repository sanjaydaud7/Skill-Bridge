import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';
import '../../styles/AdminCourses.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    status: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: 'technology',
    difficulty: 'beginner',
    duration: 8,
    thumbnail: '',
    price: 0,
    skills: '',
    learningOutcomes: '',
    prerequisites: ''
  });
  const [creating, setCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, search]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query params, only include non-empty filters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('difficulty', filters.level);
      if (filters.status) params.append('status', filters.status);
      
      const response = await api.get(`/admin/courses?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Backend returns: { success, data: [...courses], pagination: { total, page, pages } }
      setCourses(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load internships');
      console.error('Fetch courses error:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete internship');
    }
  };

  const handleToggleStatus = async (courseId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/courses/${courseId}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update internship status');
    }
  };

  const handleDuplicate = async (courseId) => {
    if (!window.confirm('Duplicate this internship with all its content?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.post(`/admin/courses/${courseId}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate internship');
    }
  };

  const handleEdit = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEditingCourse(response.data.data.course);
        
        // Load existing modules/weeks or initialize empty structure
        const modules = response.data.data.modules || [];
        if (modules.length > 0) {
          const weeksData = modules.map(module => ({
            id: module._id,
            weekNumber: module.order || 1,
            title: module.title,
            videos: module.videos?.map((video, idx) => ({
              id: video._id || `vid-${idx}`,
              day: idx + 1,
              title: video.title,
              videoUrl: video.videoUrl,
              duration: video.duration || 0,
              description: video.description || ''
            })) || []
          }));
          setWeeks(weeksData);
        } else {
          // Initialize with one empty week
          setWeeks([{
            id: `week-${Date.now()}`,
            weekNumber: 1,
            title: '',
            videos: []
          }]);
        }
        
        setShowEditModal(true);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      alert(err.response?.data?.message || 'Failed to load internship details');
    }
  };

  const addWeek = () => {
    const newWeek = {
      id: `week-${Date.now()}`,
      weekNumber: weeks.length + 1,
      title: '',
      videos: []
    };
    setWeeks([...weeks, newWeek]);
  };

  const removeWeek = (weekId) => {
    if (!window.confirm('Remove this week and all its videos?')) return;
    setWeeks(weeks.filter(w => w.id !== weekId));
  };

  const updateWeek = (weekId, field, value) => {
    setWeeks(weeks.map(w => 
      w.id === weekId ? { ...w, [field]: value } : w
    ));
  };

  const addVideo = (weekId) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w,
          videos: [...w.videos, {
            id: `vid-${Date.now()}`,
            day: w.videos.length + 1,
            title: '',
            videoUrl: '',
            duration: 0,
            description: ''
          }]
        };
      }
      return w;
    }));
  };

  const removeVideo = (weekId, videoId) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w,
          videos: w.videos.filter(v => v.id !== videoId)
        };
      }
      return w;
    }));
  };

  const updateVideo = (weekId, videoId, field, value) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w,
          videos: w.videos.map(v => 
            v.id === videoId ? { ...v, [field]: value } : v
          )
        };
      }
      return w;
    }));
  };

  const handleSaveCurriculum = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Prepare modules data
      const modulesData = weeks.map((week, idx) => ({
        moduleNumber: idx + 1,
        title: week.title || `Week ${week.weekNumber}`,
        description: `Week ${week.weekNumber} content`,
        order: idx + 1,
        videos: week.videos.map(video => ({
          title: video.title,
          videoUrl: video.videoUrl,
          duration: parseInt(video.duration) || 0,
          description: video.description
        }))
      }));
      
      // Update course modules
      await api.put(`/admin/courses/${editingCourse._id}/modules`, 
        { modules: modulesData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Curriculum updated successfully!');
      setShowEditModal(false);
      fetchCourses();
    } catch (err) {
      console.error('Error saving curriculum:', err);
      alert(err.response?.data?.message || 'Failed to save curriculum');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      
      // Parse arrays from comma/newline separated strings
      const formData = {
        ...createData,
        skills: createData.skills.split(',').map(s => s.trim()).filter(Boolean),
        learningOutcomes: createData.learningOutcomes.split('\n').map(s => s.trim()).filter(Boolean),
        prerequisites: createData.prerequisites.split('\n').map(s => s.trim()).filter(Boolean),
        duration: parseInt(createData.duration),
        price: parseFloat(createData.price),
        totalModules: 0,
        totalTasks: 0,
        isActive: true
      };
      
      await api.post('/admin/courses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowCreateModal(false);
      setCreateData({
        title: '',
        slug: '',
        description: '',
        shortDescription: '',
        category: 'technology',
        difficulty: 'beginner',
        duration: 8,
        thumbnail: '',
        price: 0,
        skills: '',
        learningOutcomes: '',
        prerequisites: ''
      });
      fetchCourses();
    } catch (err) {
      console.error('Error creating internship:', err);
      alert(err.response?.data?.message || 'Failed to create internship');
    } finally {
      setCreating(false);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading internships...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-courses">
        <div className="courses-header">
          <div>
            <h1>Internship Management</h1>
            <p>Manage all internships, modules, and tasks</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="material-icons">add</span>
            Create Internship
          </button>
        </div>

        {/* Filters */}
        <div className="courses-filters">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search internships..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="data-science">Data Science</option>
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({...filters, level: e.target.value})}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
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

        {/* Courses Table */}
        {error ? (
          <div className="error-message">
            <span className="material-icons">error_outline</span>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="courses-table">
              <table>
                <thead>
                  <tr>
                    <th>Internship</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Enrollments</th>
                    <th>Modules</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses && courses.length > 0 ? courses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <div className="course-info">
                          <img 
                            src={course.thumbnail || 'https://via.placeholder.com/80x60?text=No+Image'} 
                            alt={course.title}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/80x60?text=No+Image'}
                          />
                          <div>
                            <div className="course-title">{course.title}</div>
                            <div className="course-price">₹{course.price || 0}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {course.category?.charAt(0).toUpperCase() + course.category?.slice(1).replace('-', ' ') || 'N/A'}
                      </td>
                      <td>
                        <span className={`level-badge level-${(course.difficulty || course.level || 'beginner').toLowerCase()}`}>
                          {(course.difficulty || course.level || 'Beginner').charAt(0).toUpperCase() + 
                           (course.difficulty || course.level || 'Beginner').slice(1)}
                        </span>
                      </td>
                      <td>{course.enrollmentCount || 0}</td>
                      <td>{course.totalModules || 0}</td>
                      <td>
                        <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => handleEdit(course._id)}
                            title="Edit"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDuplicate(course._id)}
                            title="Duplicate"
                          >
                            <span className="material-icons">content_copy</span>
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleToggleStatus(course._id, course.isActive)}
                            title={course.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <span className="material-icons">
                              {course.isActive ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDelete(course._id)}
                            title="Delete"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : null}
                </tbody>
              </table>

              {(!courses || courses.length === 0) && !loading && (
                <div className="empty-state">
                  <span className="material-icons">school</span>
                  <p>No internships found</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Your First Internship
                  </button>
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
      </div>

      {/* Create Internship Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Internship</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="create-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={createData.title}
                    onChange={(e) => setCreateData({...createData, title: e.target.value})}
                    placeholder="e.g., Full Stack Web Development"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Slug *</label>
                  <input
                    type="text"
                    value={createData.slug}
                    onChange={(e) => setCreateData({...createData, slug: e.target.value})}
                    placeholder="e.g., full-stack-web-development"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Short Description *</label>
                <input
                  type="text"
                  value={createData.shortDescription}
                  onChange={(e) => setCreateData({...createData, shortDescription: e.target.value})}
                  placeholder="Brief overview of the internship"
                  required
                />
              </div>

              <div className="form-group">
                <label>Full Description *</label>
                <textarea
                  value={createData.description}
                  onChange={(e) => setCreateData({...createData, description: e.target.value})}
                  placeholder="Detailed description of the internship program"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={createData.category}
                    onChange={(e) => setCreateData({...createData, category: e.target.value})}
                    required
                  >
                    <option value="technology">Technology</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="data-science">Data Science</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty *</label>
                  <select
                    value={createData.difficulty}
                    onChange={(e) => setCreateData({...createData, difficulty: e.target.value})}
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (weeks) *</label>
                  <input
                    type="number"
                    value={createData.duration}
                    onChange={(e) => setCreateData({...createData, duration: e.target.value})}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={createData.price}
                    onChange={(e) => setCreateData({...createData, price: e.target.value})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Thumbnail URL *</label>
                <input
                  type="url"
                  value={createData.thumbnail}
                  onChange={(e) => setCreateData({...createData, thumbnail: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="form-group">
                <label>Skills (comma-separated) *</label>
                <input
                  type="text"
                  value={createData.skills}
                  onChange={(e) => setCreateData({...createData, skills: e.target.value})}
                  placeholder="React, Node.js, MongoDB, Express"
                  required
                />
              </div>

              <div className="form-group">
                <label>Learning Outcomes (one per line) *</label>
                <textarea
                  value={createData.learningOutcomes}
                  onChange={(e) => setCreateData({...createData, learningOutcomes: e.target.value})}
                  placeholder="Build full-stack applications&#10;Master React and Node.js&#10;Deploy to production"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Prerequisites (one per line)</label>
                <textarea
                  value={createData.prerequisites}
                  onChange={(e) => setCreateData({...createData, prerequisites: e.target.value})}
                  placeholder="Basic HTML/CSS knowledge&#10;JavaScript fundamentals"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Curriculum Modal */}
      {showEditModal && editingCourse && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Edit Curriculum</h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '5px 0 0' }}>
                  {editingCourse.title}
                </p>
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="curriculum-editor">
              <div className="editor-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-icons" style={{ color: '#3b82f6' }}>info</span>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Organize content by weeks. Add videos for each day within a week.
                  </span>
                </div>
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={addWeek}
                >
                  <span className="material-icons">add</span>
                  Add Week
                </button>
              </div>

              <div className="weeks-container">
                {weeks.map((week, weekIdx) => (
                  <div key={week.id} className="week-card">
                    <div className="week-header">
                      <div className="week-title-section">
                        <span className="week-badge">Week {weekIdx + 1}</span>
                        <input
                          type="text"
                          value={week.title}
                          onChange={(e) => updateWeek(week.id, 'title', e.target.value)}
                          placeholder="Enter week title"
                          className="week-title-input"
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-icon delete"
                        onClick={() => removeWeek(week.id)}
                        title="Remove Week"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>

                    <div className="videos-section">
                      <div className="videos-header">
                        <h4>Videos</h4>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => addVideo(week.id)}
                        >
                          <span className="material-icons">add</span>
                          Add Video
                        </button>
                      </div>

                      {week.videos.length === 0 ? (
                        <div className="empty-videos">
                          <span className="material-icons">videocam_off</span>
                          <p>No videos added yet</p>
                        </div>
                      ) : (
                        <div className="videos-list">
                          {week.videos.map((video, videoIdx) => (
                            <div key={video.id} className="video-item">
                              <div className="video-day-badge">
                                Day {videoIdx + 1}
                              </div>
                              <div className="video-fields">
                                <div className="form-row">
                                  <div className="form-group">
                                    <label>Video Title *</label>
                                    <input
                                      type="text"
                                      value={video.title}
                                      onChange={(e) => updateVideo(week.id, video.id, 'title', e.target.value)}
                                      placeholder="e.g., Introduction to React"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input
                                      type="number"
                                      value={video.duration}
                                      onChange={(e) => updateVideo(week.id, video.id, 'duration', e.target.value)}
                                      placeholder="30"
                                      min="0"
                                    />
                                  </div>
                                </div>
                                <div className="form-group">
                                  <label>Video URL *</label>
                                  <input
                                    type="url"
                                    value={video.videoUrl}
                                    onChange={(e) => updateVideo(week.id, video.id, 'videoUrl', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Description</label>
                                  <textarea
                                    value={video.description}
                                    onChange={(e) => updateVideo(week.id, video.id, 'description', e.target.value)}
                                    placeholder="Brief description of the video content"
                                    rows="2"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn-icon delete video-remove"
                                onClick={() => removeVideo(week.id, video.id)}
                                title="Remove Video"
                              >
                                <span className="material-icons">delete</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {weeks.length === 0 && (
                  <div className="empty-state">
                    <span className="material-icons">calendar_today</span>
                    <p>No weeks added yet. Click "Add Week" to get started.</p>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleSaveCurriculum}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Curriculum'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCourses;
