import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Profile.css';

const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const API  = `${BASE}/api`;

const Profile = () => {
    const { token, user: authUser, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // ── form state ──────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        name: '', email: '', phone: '', bio: '',
        location: '', website: '', linkedin: '', github: ''
    });
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarFile, setAvatarFile]       = useState(null);

    // ── password state ───────────────────────────────────────────────────────
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwVisible, setPwVisible] = useState({ cur: false, nw: false, con: false });

    // ── UI state ─────────────────────────────────────────────────────────────
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [uploading,  setUploading]  = useState(false);
    const [pwSaving,   setPwSaving]   = useState(false);
    const [toast,      setToast]      = useState(null); // { type: 'success'|'error', msg }
    const [activeTab,  setActiveTab]  = useState('details'); // 'details' | 'password'

    const headers = { Authorization: `Bearer ${token}` };

    // ── load profile ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        (async () => {
            try {
                const { data } = await axios.get(`${API}/profile`, { headers });
                if (data.success) populate(data.user);
            } catch {
                showToast('error', 'Failed to load profile');
            } finally { setLoading(false); }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const populate = (u) => {
        setForm({
            name:     u.name     || '',
            email:    u.email    || '',
            phone:    u.phone    || '',
            bio:      u.bio      || '',
            location: u.location || '',
            website:  u.website  || '',
            linkedin: u.linkedin || '',
            github:   u.github   || '',
        });
        setAvatarPreview(u.profilePicture || '');
    };

    // ── helpers ───────────────────────────────────────────────────────────────
    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    const handlePwChange = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

    // ── avatar picker ─────────────────────────────────────────────────────────
    const onAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('error', 'Image must be under 5 MB'); return; }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const uploadAvatar = async () => {
        if (!avatarFile) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('profilePicture', avatarFile);
            const { data } = await axios.post(`${API}/profile/picture`, fd, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                setAvatarPreview(data.profilePicture);
                setAvatarFile(null);
                updateUser({ profilePicture: data.profilePicture });
                showToast('success', 'Profile picture updated!');
            }
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    };

    // ── save profile details ─────────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await axios.put(`${API}/profile`, form, { headers });
            if (data.success) {
                populate(data.user);
                updateUser(data.user);
                showToast('success', 'Profile saved successfully!');
            }
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    // ── change password ───────────────────────────────────────────────────────
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            showToast('error', 'New passwords do not match'); return;
        }
        if (pwForm.newPassword.length < 6) {
            showToast('error', 'Password must be at least 6 characters'); return;
        }
        setPwSaving(true);
        try {
            const { data } = await axios.put(`${API}/profile/password`, {
                currentPassword: pwForm.currentPassword,
                newPassword:     pwForm.newPassword
            }, { headers });
            if (data.success) {
                setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                showToast('success', 'Password changed successfully!');
            }
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Password change failed');
        } finally { setPwSaving(false); }
    };

    // ── initials fallback ────────────────────────────────────────────────────
    const initials = (form.name || authUser?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    if (loading) return (
        <>
            <Navbar />
            <div className="prof-loading">
                <div className="prof-spinner" />
                <p>Loading profile…</p>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="prof-page">
                {/* Toast */}
                {toast && (
                    <div className={`prof-toast prof-toast--${toast.type}`}>
                        {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
                    </div>
                )}

                <div className="prof-layout">
                    {/* ── Left sidebar — avatar + nav ── */}
                    <aside className="prof-sidebar">
                        {/* Avatar */}
                        <div className="prof-avatar-wrap">
                            <div className="prof-avatar" onClick={() => fileInputRef.current.click()}>
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="avatar" />
                                    : <span>{initials}</span>}
                                <div className="prof-avatar-overlay">
                                    <span>📷</span>
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={onAvatarChange}
                            />
                            {avatarFile && (
                                <button
                                    className="prof-upload-btn"
                                    onClick={uploadAvatar}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading…' : '⬆ Upload Photo'}
                                </button>
                            )}
                            <p className="prof-avatar-hint">Click photo to change<br />(max 5 MB)</p>
                        </div>

                        {/* name + email preview */}
                        <div className="prof-sidebar-info">
                            <strong>{form.name || 'Your Name'}</strong>
                            <span>{form.email}</span>
                        </div>

                        {/* sidebar nav */}
                        <nav className="prof-sidenav">
                            <button
                                className={activeTab === 'details' ? 'active' : ''}
                                onClick={() => setActiveTab('details')}
                            >
                                👤 Profile Details
                            </button>
                            <button
                                className={activeTab === 'password' ? 'active' : ''}
                                onClick={() => setActiveTab('password')}
                            >
                                🔒 Change Password
                            </button>
                        </nav>
                    </aside>

                    {/* ── Main content ── */}
                    <main className="prof-main">
                        {activeTab === 'details' && (
                            <form className="prof-form" onSubmit={handleSave}>
                                <h2>Profile Details</h2>
                                <p className="prof-subtitle">Your personal information visible on your portfolio</p>

                                <div className="prof-grid">
                                    <div className="prof-field">
                                        <label>Full Name <span>*</span></label>
                                        <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" />
                                    </div>
                                    <div className="prof-field">
                                        <label>Email Address <span>*</span></label>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
                                    </div>
                                    <div className="prof-field">
                                        <label>Phone Number</label>
                                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                                    </div>
                                    <div className="prof-field">
                                        <label>Location</label>
                                        <input name="location" value={form.location} onChange={handleChange} placeholder="City, Country" />
                                    </div>
                                </div>

                                <div className="prof-field prof-field--full">
                                    <label>Bio</label>
                                    <textarea
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        maxLength={500}
                                        placeholder="Tell others about yourself…"
                                    />
                                    <span className="prof-char-count">{form.bio.length}/500</span>
                                </div>

                                <div className="prof-section-divider">Social & Web Links</div>

                                <div className="prof-grid">
                                    <div className="prof-field">
                                        <label>Website</label>
                                        <div className="prof-input-icon">
                                            <span>🌐</span>
                                            <input name="website" value={form.website} onChange={handleChange} placeholder="https://yoursite.com" />
                                        </div>
                                    </div>
                                    <div className="prof-field">
                                        <label>LinkedIn</label>
                                        <div className="prof-input-icon">
                                            <span>💼</span>
                                            <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                                        </div>
                                    </div>
                                    <div className="prof-field">
                                        <label>GitHub</label>
                                        <div className="prof-input-icon">
                                            <span>🐙</span>
                                            <input name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="prof-actions">
                                    <button type="submit" className="prof-save-btn" disabled={saving}>
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'password' && (
                            <form className="prof-form" onSubmit={handlePasswordChange}>
                                <h2>Change Password</h2>
                                <p className="prof-subtitle">Update your password to keep your account secure</p>

                                <div className="prof-pw-fields">
                                    {[
                                        { key: 'currentPassword', label: 'Current Password',  vis: 'cur' },
                                        { key: 'newPassword',     label: 'New Password',       vis: 'nw'  },
                                        { key: 'confirmPassword', label: 'Confirm New Password', vis: 'con' }
                                    ].map(({ key, label, vis }) => (
                                        <div className="prof-field" key={key}>
                                            <label>{label}</label>
                                            <div className="prof-pw-wrap">
                                                <input
                                                    type={pwVisible[vis] ? 'text' : 'password'}
                                                    name={key}
                                                    value={pwForm[key]}
                                                    onChange={handlePwChange}
                                                    required
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="prof-pw-toggle"
                                                    onClick={() => setPwVisible(v => ({ ...v, [vis]: !v[vis] }))}
                                                >
                                                    {pwVisible[vis] ? '🙈' : '👁'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <ul className="prof-pw-rules">
                                    <li className={pwForm.newPassword.length >= 6 ? 'ok' : ''}>At least 6 characters</li>
                                    <li className={pwForm.newPassword === pwForm.confirmPassword && pwForm.newPassword ? 'ok' : ''}>Passwords match</li>
                                </ul>

                                <div className="prof-actions">
                                    <button type="submit" className="prof-save-btn" disabled={pwSaving}>
                                        {pwSaving ? 'Updating…' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default Profile;
