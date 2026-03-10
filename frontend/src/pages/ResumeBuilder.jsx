import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/ResumeBuilder.css';

const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const ResumeBuilder = () => {
    const { token } = useAuth();
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    const headers = { Authorization: `Bearer ${token}` };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchPreview(); }, []);

    const fetchPreview = async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axios.get(`${API}/api/resume/preview`, { headers });
            if (data.success) setPreview(data.data);
        } catch (err) {
            setError('Could not generate resume preview. Make sure you have at least one enrollment.');
        } finally { setLoading(false); }
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await axios.get(`${API}/api/resume/download`, {
                headers, responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `SkillBridge_Resume_${preview?.student?.name?.replace(/\s/g, '_') || 'Resume'}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Download failed. Please try again.');
        } finally { setDownloading(false); }
    };

    return (
        <>
        <Navbar />
        <div className="rb-page">
            <div className="rb-hero">
                <div className="rb-hero-content">
                    <span className="rb-badge">🤖 AI-Powered</span>
                    <h1>Resume Builder</h1>
                    <p>Your SkillBridge achievements, internship experience, and skills automatically crafted into a professional resume PDF by AI.</p>
                </div>
            </div>

            <div className="rb-container">
                {loading && (
                    <div className="rb-loading">
                        <div className="rb-spinner" />
                        <p>🤖 AI is analysing your profile and crafting your resume...</p>
                    </div>
                )}

                {error && (
                    <div className="rb-error">
                        <span>⚠️</span> {error}
                        <button onClick={fetchPreview}>Retry</button>
                    </div>
                )}

                {preview && !loading && (
                    <div className="rb-content">
                        {/* Header Card */}
                        <div className="rb-profile-card">
                            <div className="rb-avatar">{preview.student?.name?.charAt(0).toUpperCase()}</div>
                            <div>
                                <h2>{preview.student?.name}</h2>
                                <p>{preview.student?.email}</p>
                                <div className="rb-stats">
                                    <span>🎓 {preview.certificates} Certificate{preview.certificates !== 1 ? 's' : ''}</span>
                                    <span>⚡ {preview.skills?.length} Skills</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Content Preview */}
                        <div className="rb-section">
                            <h3>📝 Professional Summary</h3>
                            <p className="rb-objective">{preview.aiContent?.objective}</p>
                        </div>

                        {preview.aiContent?.highlights?.length > 0 && (
                            <div className="rb-section">
                                <h3>⭐ Key Highlights</h3>
                                <ul className="rb-highlights">
                                    {preview.aiContent.highlights.map((h, i) => (
                                        <li key={i}>{h}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {preview.aiContent?.internships?.length > 0 && (
                            <div className="rb-section">
                                <h3>💼 Internship Experience</h3>
                                {preview.aiContent.internships.map((intern, i) => (
                                    <div key={i} className="rb-internship">
                                        <h4>{intern.title}</h4>
                                        <p>{intern.description}</p>
                                        {intern.skills?.length > 0 && (
                                            <div className="rb-tags">
                                                {intern.skills.slice(0, 5).map(s => (
                                                    <span key={s} className="rb-tag">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {preview.skills?.length > 0 && (
                            <div className="rb-section">
                                <h3>🔧 Skills</h3>
                                <div className="rb-tags">
                                    {preview.skills.map(s => (
                                        <span key={s} className="rb-tag">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Download CTA */}
                        <div className="rb-cta">
                            <div className="rb-cta-info">
                                <h3>📄 Download Your Resume</h3>
                                <p>Get a beautifully formatted PDF resume with all your achievements.</p>
                            </div>
                            <div className="rb-cta-buttons">
                                <button className="rb-btn-secondary" onClick={fetchPreview}>
                                    🔄 Regenerate
                                </button>
                                <button className="rb-btn-primary" onClick={handleDownload} disabled={downloading}>
                                    {downloading ? '⏳ Generating...' : '⬇️ Download PDF'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default ResumeBuilder;
