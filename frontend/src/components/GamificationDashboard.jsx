import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Gamification.css';

const GamificationDashboard = ({ userId }) => {
    const [gamificationData, setGamificationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/rewards/dashboard/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setGamificationData(response.data.data);
            } catch (error) {
                console.error('Error fetching gamification data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, token]);

    if (loading) return <div className="loading">Loading gamification data...</div>;
    if (!gamificationData) return null;

    const { points, streaks, badges, achievements, nextMilestone } = gamificationData;

    return (
        <div className="gamification-dashboard">
            <h2>Your Gamification Stats</h2>

            {/* Points and Tier Section */}
            <div className="stats-grid">
                <div className="stat-box points-box">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-details">
                        <div className="stat-label">Total Points</div>
                        <div className="stat-value">{points.total}</div>
                        <div className="stat-sub">{points.available} available</div>
                    </div>
                </div>

                <div className="stat-box tier-box">
                    <div className="stat-icon">🏅</div>
                    <div className="stat-details">
                        <div className="stat-label">Current Tier</div>
                        <div className="stat-value">{points.tier}</div>
                        <div className="tier-progress">
                            <span>{nextMilestone.pointsNeeded} pts to {nextMilestone.nextTier}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-box achievement-box">
                    <div className="stat-icon">🎖️</div>
                    <div className="stat-details">
                        <div className="stat-label">Achievements</div>
                        <div className="stat-value">{achievements.badges}</div>
                        <div className="stat-sub">Badges earned</div>
                    </div>
                </div>

                <div className="stat-box streak-box">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-details">
                        <div className="stat-label">Active Streaks</div>
                        <div className="stat-value">{streaks.active}</div>
                        <div className="stat-sub">Best: {streaks.longest} days</div>
                    </div>
                </div>
            </div>

            {/* Recent Badges */}
            {badges && badges.length > 0 && (
                <div className="recent-badges">
                    <h3>Recently Earned Badges</h3>
                    <div className="badges-carousel">
                        {badges.map((badge) => (
                            <div key={badge._id} className="badge-mini">
                                <img src={badge.badgeId?.icon} alt={badge.badgeId?.name} />
                                <div className="badge-tooltip">{badge.badgeId?.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Level Progress */}
            <div className="level-progress">
                <h3>Level Progress</h3>
                <div className="tiers-display">
                    {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map((tier) => (
                        <div 
                            key={tier} 
                            className={`tier ${points.tier === tier ? 'active' : ''} ${['bronze', 'silver', 'gold', 'platinum', 'diamond'].indexOf(tier) <= ['bronze', 'silver', 'gold', 'platinum', 'diamond'].indexOf(points.tier) ? 'completed' : ''}`}
                        >
                            {tier}
                        </div>
                    ))}
                </div>
            </div>

            {/* Next Milestone */}
            <div className="next-milestone-card">
                <h3>Next Milestone</h3>
                <div className="milestone-progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min((points.total / (points.total + nextMilestone.pointsNeeded)) * 100, 100)}%` }}></div>
                </div>
                <p>Earn <strong>{nextMilestone.pointsNeeded}</strong> more points to reach <strong>{nextMilestone.nextTier}</strong> tier</p>
            </div>
        </div>
    );
};

export default GamificationDashboard;
