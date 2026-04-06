import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgressTracking.css';

const BadgesDisplay = ({ userId }) => {
    const [badges, setBadges] = useState([]);
    const [skillBadges, setSkillBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('earned');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!userId) return;

        const fetchBadges = async () => {
            try {
                const [earnedRes, skillRes] = await Promise.all([
                    axios.get(
                        `http://localhost:5000/api/badges/student/${userId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    axios.get(
                        `http://localhost:5000/api/badges/skill/${userId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);

                setBadges(earnedRes.data.data || []);
                setSkillBadges(skillRes.data.data || []);
            } catch (error) {
                console.error('Error fetching badges:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBadges();
    }, [userId, token]);

    if (loading) return <div className="loading">Loading badges...</div>;

    return (
        <div className="badges-display">
            <h3>Your Badges & Skills</h3>
            
            <div className="badge-tabs">
                <button 
                    className={`tab ${activeTab === 'earned' ? 'active' : ''}`}
                    onClick={() => setActiveTab('earned')}
                >
                    Earned Badges ({badges.length})
                </button>
                <button 
                    className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                >
                    Skills ({skillBadges.length})
                </button>
            </div>

            {activeTab === 'earned' && (
                <div className="badge-grid">
                    {badges.length === 0 ? (
                        <p className="no-badges">No badges earned yet</p>
                    ) : (
                        badges.map((badge) => (
                            <div key={badge._id} className={`badge-card rarity-${badge.rarity}`}>
                                <div className="badge-icon">
                                    <img src={badge.icon} alt={badge.name} />
                                </div>
                                <div className="badge-info">
                                    <h5>{badge.name}</h5>
                                    <p>{badge.description}</p>
                                    <div className="badge-meta">
                                        <span className="category">{badge.category}</span>
                                        <span className="points">+{badge.points}</span>
                                    </div>
                                    <span className="earned-date">
                                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'skills' && (
                <div className="skills-grid">
                    {skillBadges.length === 0 ? (
                        <p className="no-skills">No skill badges yet</p>
                    ) : (
                        skillBadges.map((skill) => (
                            <div key={skill._id} className={`skill-card level-${skill.level}`}>
                                <div className="skill-header">
                                    <h5>{skill.skill}</h5>
                                    <span className="level-badge">{skill.level}</span>
                                </div>
                                <div className="proficiency">
                                    <div className="proficiency-bar">
                                        <div 
                                            className="proficiency-fill" 
                                            style={{ width: `${skill.proficiencyScore}%` }}
                                        ></div>
                                    </div>
                                    <span className="score">{skill.proficiencyScore}%</span>
                                </div>
                                <div className="skill-stats">
                                    <div className="stat">
                                        <span className="label">Tasks</span>
                                        <span className="value">{skill.tasksCompleted}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Projects</span>
                                        <span className="value">{skill.projectsCompleted}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Endorsements</span>
                                        <span className="value">{skill.endorsements}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BadgesDisplay;
