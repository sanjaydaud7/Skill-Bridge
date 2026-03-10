import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/AdminResources.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FILE_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf' },
    { value: 'image', label: 'Image', icon: 'image' },
    { value: 'document', label: 'Document', icon: 'description' },
    { value: 'video', label: 'Video', icon: 'videocam' },
    { value: 'link', label: 'External Link', icon: 'link' },
    { value: 'other', label: 'Other', icon: 'attach_file' }
];

const TYPE_ICONS = {
    pdf: 'picture_as_pdf', image: 'image', document: 'description',
    video: 'videocam', link: 'link', other: 'attach_file'
};

const TYPE_COLORS = {
    pdf: '#ef4444', image: '#8b5cf6', document: '#3b82f6',
    video: '#f59e0b', link: '#10b981', other: '#64748b'
};

const formatBytes = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AdminResources = () => {
    const { token } = useAuth();
    const authHeader = { Authorization: `Bearer ${token}` };

    const [resources, setResources] = useState([]);
    const [internships, setInternships] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [scopeFilter, setScopeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    // Upload form
    const [showUpload, setShowUpload] = useState(false);
    const [uploadType, setUploadType] = useState('pdf');
    const [uploadForm, setUploadForm] = useState({ title: '', description: '', internshipId: '', linkUrl: '' });
    const [uploadFile, setUploadFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Edit modal
    const [editResource, setEditResource] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', internshipId: '' });

    // Delete confirm
    const [deleteId, setDeleteId] = useState(null);

    const headers = { headers: authHeader };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (typeFilter) params.set('type', typeFilter);
            if (scopeFilter) params.set('scope', scopeFilter);
            params.set('page', page);
            params.set('limit', 15);

            const [resRes, internRes, statsRes] = await Promise.all([
                axios.get(`${API}/admin/resources?${params}`, { headers: authHeader }),
                axios.get(`${API}/admin/internships?limit=100`, { headers: authHeader }),
                axios.get(`${API}/admin/resources/stats`, { headers: authHeader })
            ]);

            setResources(resRes.data.data || []);
            setPagination(resRes.data.pagination || { total: 0, pages: 1 });
            setInternships(internRes.data.data || []);
            setStats(statsRes.data.data || null);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, typeFilter, scopeFilter, page, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Upload ───────────────────────────────────────────────────────────────
    const handleUpload = async (e) => {
        e.preventDefault();
        setUploadError('');
        if (!uploadForm.title.trim()) { setUploadError('Title is required'); return; }
        if (uploadType !== 'link' && !uploadFile) { setUploadError('Please select a file'); return; }
        if (uploadType === 'link' && !uploadForm.linkUrl.trim()) { setUploadError('Link URL is required'); return; }

        setUploading(true);
        setUploadProgress(0);
        try {
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            formData.append('description', uploadForm.description);
            formData.append('type', uploadType);
            if (uploadForm.internshipId) formData.append('internshipId', uploadForm.internshipId);
            if (uploadType === 'link') {
                formData.append('linkUrl', uploadForm.linkUrl);
            } else {
                formData.append('file', uploadFile);
            }

            await axios.post(`${API}/admin/resources`, formData, {
                headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
            });

            setShowUpload(false);
            setUploadForm({ title: '', description: '', internshipId: '', linkUrl: '' });
            setUploadFile(null);
            setUploadType('pdf');
            fetchData();
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // ─── Edit ─────────────────────────────────────────────────────────────────
    const openEdit = (resource) => {
        setEditResource(resource);
        setEditForm({
            title: resource.title,
            description: resource.description || '',
            internshipId: resource.internshipId?._id || ''
        });
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API}/admin/resources/${editResource._id}`, {
                title: editForm.title,
                description: editForm.description,
                internshipId: editForm.internshipId || null
            }, headers);
            setEditResource(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    // ─── Toggle ───────────────────────────────────────────────────────────────
    const handleToggle = async (id) => {
        try {
            await axios.put(`${API}/admin/resources/${id}/toggle`, {}, headers);
            setResources(prev => prev.map(r => r._id === id ? { ...r, isActive: !r.isActive } : r));
        } catch (err) { alert('Toggle failed'); }
    };

    // ─── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        try {
            await axios.delete(`${API}/admin/resources/${deleteId}`, headers);
            setDeleteId(null);
            fetchData();
        } catch (err) { alert('Delete failed'); }
    };

    // ─── Drag & Drop ─────────────────────────────────────────────────────────
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setUploadFile(file);
    };

    return (
        <AdminLayout>
            <div className="ar-page">
                {/* Header */}
                <div className="ar-header">
                    <div>
                        <h1 className="ar-title">Resources & Materials</h1>
                        <p className="ar-subtitle">Upload and manage learning materials for students</p>
                    </div>
                    <button className="ar-btn-primary" onClick={() => setShowUpload(true)}>
                        <span className="material-icons">upload</span>
                        Upload Resource
                    </button>
                </div>

                {/* Stats Row */}
                {stats && (
                    <div className="ar-stats">
                        <div className="ar-stat-card">
                            <span className="material-icons">folder_open</span>
                            <div><strong>{stats.total}</strong><span>Total</span></div>
                        </div>
                        <div className="ar-stat-card ar-stat-green">
                            <span className="material-icons">check_circle</span>
                            <div><strong>{stats.active}</strong><span>Active</span></div>
                        </div>
                        <div className="ar-stat-card ar-stat-blue">
                            <span className="material-icons">public</span>
                            <div><strong>{stats.globalCount}</strong><span>Global</span></div>
                        </div>
                        <div className="ar-stat-card ar-stat-purple">
                            <span className="material-icons">school</span>
                            <div><strong>{stats.internshipCount}</strong><span>Per Internship</span></div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="ar-filters">
                    <div className="ar-search-wrap">
                        <span className="material-icons">search</span>
                        <input
                            className="ar-search"
                            placeholder="Search resources…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <select className="ar-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
                        {FILE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <select className="ar-select" value={scopeFilter} onChange={e => { setScopeFilter(e.target.value); setPage(1); }}>
                        <option value="">All Scopes</option>
                        <option value="global">Global</option>
                        <option value="internship">Per Internship</option>
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="ar-loading"><div className="ar-spinner" /><p>Loading...</p></div>
                ) : resources.length === 0 ? (
                    <div className="ar-empty">
                        <span className="material-icons">folder_open</span>
                        <h3>No resources found</h3>
                        <p>Upload your first resource to get started</p>
                    </div>
                ) : (
                    <div className="ar-table-wrap">
                        <table className="ar-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Title</th>
                                    <th>Internship</th>
                                    <th>Size</th>
                                    <th>Downloads</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map(r => (
                                    <tr key={r._id} className={!r.isActive ? 'ar-row-inactive' : ''}>
                                        <td>
                                            <div className="ar-type-badge" style={{ color: TYPE_COLORS[r.type] }}>
                                                <span className="material-icons">{TYPE_ICONS[r.type] || 'attach_file'}</span>
                                                <span>{r.type}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ar-title-cell">
                                                <strong>{r.title}</strong>
                                                {r.description && <small>{r.description.slice(0, 60)}{r.description.length > 60 ? '…' : ''}</small>}
                                            </div>
                                        </td>
                                        <td>
                                            {r.internshipId
                                                ? <span className="ar-tag ar-tag-intern">{r.internshipId.title}</span>
                                                : <span className="ar-tag ar-tag-global">Global</span>}
                                        </td>
                                        <td className="ar-muted">{formatBytes(r.fileSize)}</td>
                                        <td className="ar-muted">{r.downloadCount}</td>
                                        <td>
                                            <button
                                                className={`ar-toggle ${r.isActive ? 'ar-toggle-on' : 'ar-toggle-off'}`}
                                                onClick={() => handleToggle(r._id)}
                                                title={r.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {r.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="ar-actions">
                                                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="ar-icon-btn ar-view" title="View/Open">
                                                    <span className="material-icons">open_in_new</span>
                                                </a>
                                                <button className="ar-icon-btn ar-edit" onClick={() => openEdit(r)} title="Edit">
                                                    <span className="material-icons">edit</span>
                                                </button>
                                                <button className="ar-icon-btn ar-del" onClick={() => setDeleteId(r._id)} title="Delete">
                                                    <span className="material-icons">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="ar-pagination">
                                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="ar-page-btn">Prev</button>
                                <span>Page {page} of {pagination.pages} ({pagination.total} total)</span>
                                <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="ar-page-btn">Next</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Upload Modal ──── */}
            {showUpload && (
                <div className="ar-modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="ar-modal" onClick={e => e.stopPropagation()}>
                        <div className="ar-modal-header">
                            <h2>Upload Resource</h2>
                            <button className="ar-modal-close" onClick={() => setShowUpload(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="ar-modal-body">
                            {/* Type selector */}
                            <div className="ar-form-group ar-type-selector">
                                {FILE_TYPES.slice(1).map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        className={`ar-type-btn ${uploadType === t.value ? 'selected' : ''}`}
                                        onClick={() => setUploadType(t.value)}
                                    >
                                        <span className="material-icons">{t.icon}</span>
                                        <span>{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="ar-form-group">
                                <label>Title *</label>
                                <input
                                    className="ar-input"
                                    placeholder="e.g. React Hooks Cheatsheet"
                                    value={uploadForm.title}
                                    onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                                />
                            </div>

                            <div className="ar-form-group">
                                <label>Description</label>
                                <textarea
                                    className="ar-input ar-textarea"
                                    placeholder="Brief description of this resource…"
                                    value={uploadForm.description}
                                    onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                                />
                            </div>

                            <div className="ar-form-group">
                                <label>Internship (leave blank for global)</label>
                                <select
                                    className="ar-input"
                                    value={uploadForm.internshipId}
                                    onChange={e => setUploadForm(f => ({ ...f, internshipId: e.target.value }))}
                                >
                                    <option value="">Global — available to all students</option>
                                    {internships.map(i => (
                                        <option key={i._id} value={i._id}>{i.title}</option>
                                    ))}
                                </select>
                            </div>

                            {uploadType === 'link' ? (
                                <div className="ar-form-group">
                                    <label>Link URL *</label>
                                    <input
                                        className="ar-input"
                                        type="url"
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={uploadForm.linkUrl}
                                        onChange={e => setUploadForm(f => ({ ...f, linkUrl: e.target.value }))}
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`ar-dropzone ${dragOver ? 'drag-over' : ''} ${uploadFile ? 'has-file' : ''}`}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('ar-file-input').click()}
                                >
                                    <input
                                        id="ar-file-input"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={e => setUploadFile(e.target.files[0])}
                                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.mov,.webm,.txt,.zip"
                                    />
                                    {uploadFile ? (
                                        <div className="ar-file-chosen">
                                            <span className="material-icons">check_circle</span>
                                            <span>{uploadFile.name}</span>
                                            <small>{formatBytes(uploadFile.size)}</small>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="material-icons ar-drop-icon">cloud_upload</span>
                                            <p>Drag & drop or click to browse</p>
                                            <small>PDF, Images, Word, Excel, PPT, Video up to 100 MB</small>
                                        </>
                                    )}
                                </div>
                            )}

                            {uploading && (
                                <div className="ar-progress-wrap">
                                    <div className="ar-progress-bar" style={{ width: `${uploadProgress}%` }} />
                                    <span>{uploadProgress}%</span>
                                </div>
                            )}

                            {uploadError && <div className="ar-error">{uploadError}</div>}

                            <div className="ar-modal-footer">
                                <button type="button" className="ar-btn-secondary" onClick={() => setShowUpload(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="ar-btn-primary" disabled={uploading}>
                                    {uploading ? 'Uploading…' : 'Upload Resource'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Edit Modal ──── */}
            {editResource && (
                <div className="ar-modal-overlay" onClick={() => setEditResource(null)}>
                    <div className="ar-modal" onClick={e => e.stopPropagation()}>
                        <div className="ar-modal-header">
                            <h2>Edit Resource</h2>
                            <button className="ar-modal-close" onClick={() => setEditResource(null)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="ar-modal-body">
                            <div className="ar-form-group">
                                <label>Title</label>
                                <input className="ar-input" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div className="ar-form-group">
                                <label>Description</label>
                                <textarea className="ar-input ar-textarea" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className="ar-form-group">
                                <label>Internship (blank = global)</label>
                                <select className="ar-input" value={editForm.internshipId} onChange={e => setEditForm(f => ({ ...f, internshipId: e.target.value }))}>
                                    <option value="">Global</option>
                                    {internships.map(i => <option key={i._id} value={i._id}>{i.title}</option>)}
                                </select>
                            </div>
                            <div className="ar-file-url-preview">
                                <span className="material-icons">link</span>
                                <a href={editResource.fileUrl} target="_blank" rel="noreferrer">View current file</a>
                            </div>
                            <div className="ar-modal-footer">
                                <button type="button" className="ar-btn-secondary" onClick={() => setEditResource(null)}>Cancel</button>
                                <button type="submit" className="ar-btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirm ──── */}
            {deleteId && (
                <div className="ar-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="ar-modal ar-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="ar-modal-header">
                            <h2>Delete Resource?</h2>
                        </div>
                        <div className="ar-modal-body">
                            <p>This will permanently delete the resource and remove the file from Cloudinary. This cannot be undone.</p>
                            <div className="ar-modal-footer">
                                <button className="ar-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                                <button className="ar-btn-danger" onClick={handleDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminResources;
