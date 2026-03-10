import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Portfolio.css';

const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const categoryColors = {
    technology:   '#3b82f6',
    design:       '#a855f7',
    marketing:    '#f59e0b',
    business:     '#10b981',
    'data-science': '#ef4444'
};

const Portfolio = () => {
    const { username } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const isOwnPortfolio = !username || username === 'me';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    useEffect(() => {
        fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    const fetchPortfolio = async () => {
        setLoading(true); setError('');
        try {
            const url = isOwnPortfolio
                ? `${API}/api/portfolio/me`
                : `${API}/api/portfolio/${username}`;
            const { data } = await axios.get(url, { headers });
            if (data.success) setPortfolio(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Portfolio not found');
        } finally { setLoading(false); }
    };

    const handleShare = () => {
        const shareUrl = portfolio?.shareUrl || window.location.href;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="pf-loading">
                <div className="pf-spinner" />
                <p>Loading portfolio...</p>
            </div>
        </>
    );

    if (error) return (
        <>
            <Navbar />
            <div className="pf-error">
                <span>😕</span>
                <h2>Portfolio not found</h2>
                <p style={{fontSize:'0.9rem', color:'#64748b', marginBottom:'16px'}}>{error}</p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        </>
    );

    const { student, stats, skills, internships, certificates } = portfolio;

    return (
        <>
        <Navbar />
        <div className="pf-page">
            {/* Hero */}
            <div className="pf-hero">
                <div className="pf-hero-inner">
                    <div className="pf-avatar">{student.name.charAt(0).toUpperCase()}</div>
                    <div className="pf-hero-info">
                        <h1>{student.name}</h1>
                        <p className="pf-tagline">SkillBridge Intern · Building the Future</p>
                        <p className="pf-since">Member since {new Date(student.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                    </div>
                    {isOwnPortfolio && (
                        <button className="pf-share-btn" onClick={handleShare}>
                            {copied ? '✅ Copied!' : '🔗 Share Portfolio'}
                        </button>
                    )}
                </div>

                {/* Stats row */}
                <div className="pf-stats">
                    <div className="pf-stat"><span>{stats.completedInternships}</span><label>Completed</label></div>
                    <div className="pf-stat"><span>{stats.inProgressInternships}</span><label>In Progress</label></div>
                    <div className="pf-stat"><span>{stats.certificates}</span><label>Certificates</label></div>
                    <div className="pf-stat"><span>{stats.skills}</span><label>Skills</label></div>
                </div>
            </div>

            <div className="pf-container">
                {/* Skills */}
                {skills.length > 0 && (
                    <section className="pf-section">
                        <h2>🔧 Skills & Technologies</h2>
                        <div className="pf-skills">
                            {skills.map(s => <span key={s} className="pf-skill-tag">{s}</span>)}
                        </div>
                    </section>
                )}

                {/* Internships */}
                {internships.length > 0 && (
                    <section className="pf-section">
                        <h2>💼 Internship Experience</h2>
                        <div className="pf-internships">
                            {internships.map((intern, i) => (
                                <div key={i} className="pf-internship-card">
                                    {intern.thumbnail && (
                                        <img src={intern.thumbnail} alt={intern.title} className="pf-internship-thumb" />
                                    )}
                                    <div className="pf-internship-body">
                                        <div className="pf-internship-header">
                                            <h3>{intern.title}</h3>
                                            <span className={`pf-status ${intern.status}`}>{intern.status.replace('-', ' ')}</span>
                                        </div>
                                        <div className="pf-internship-meta">
                                            <span style={{ color: categoryColors[intern.category] || '#64748b' }}>
                                                ● {intern.category}
                                            </span>
                                            <span>⏱ {intern.duration} weeks</span>
                                            <span>📊 {intern.difficulty}</span>
                                        </div>
                                        {intern.status !== 'enrolled' && (
                                            <div className="pf-progress-bar">
                                                <div className="pf-progress-fill" style={{ width: `${intern.progress}%` }} />
                                                <span>{intern.progress}%</span>
                                            </div>
                                        )}
                                        {intern.skills?.length > 0 && (
                                            <div className="pf-tags">
                                                {intern.skills.slice(0, 4).map(s => <span key={s} className="pf-tag">{s}</span>)}
                                            </div>
                                        )}
                                        {intern.completedAt && (
                                            <p className="pf-completed-date">
                                                ✅ Completed {new Date(intern.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certificates */}
                {certificates.length > 0 && (
                    <section className="pf-section">
                        <h2>🏆 Certificates</h2>
                        <div className="pf-certs">
                            {certificates.map((cert, i) => (
                                <div key={i} className="pf-cert-card">
                                    <div className="pf-cert-seal">🏆</div>
                                    <div className="pf-cert-info">
                                        <h4>{cert.internshipTitle}</h4>
                                        <p>{cert.category}</p>
                                        <div className="pf-cert-meta">
                                            <span className="pf-grade">Grade: {cert.grade}</span>
                                            <span>{new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <p className="pf-cert-number">#{cert.certificateNumber}</p>
                                        <a
                                            href={`/verify/${cert.verificationCode}`}
                                            className="pf-verify-link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            🔍 Verify
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {internships.length === 0 && certificates.length === 0 && (
                    <div className="pf-empty">
                        <span>🚀</span>
                        <h3>The journey is just beginning!</h3>
                        <p>Enroll in internships to start building your portfolio.</p>
                        <button onClick={() => navigate('/internships')}>Explore Internships</button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default Portfolio;
