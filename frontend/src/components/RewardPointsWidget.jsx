import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Gamification.css';

const RewardPointsWidget = ({ userId }) => {
    const [rewardData, setRewardData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!userId) return;

        const fetchRewards = async () => {
            try {
                const [summaryRes, historyRes] = await Promise.all([
                    axios.get(
                        `http://localhost:5000/api/rewards/${userId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    axios.get(
                        `http://localhost:5000/api/rewards/history/${userId}?limit=10`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);

                setRewardData(summaryRes.data.data);
                setHistory(historyRes.data.data);
            } catch (error) {
                console.error('Error fetching rewards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();
    }, [userId, token]);

    if (loading) return <div className="loading-small">Loading rewards...</div>;
    if (!rewardData) return null;

    const getTierColor = (tier) => {
        const colors = {
            bronze: '#CD7F32',
            silver: '#C0C0C0',
            gold: '#FFD700',
            platinum: '#E5E4E2',
            diamond: '#00D9FF'
        };
        return colors[tier] || '#999';
    };

    return (
        <div className="reward-points-widget">
            <div className="widget-header">
                <h4>Reward Points</h4>
                <span className="tier-badge" style={{ backgroundColor: getTierColor(rewardData.tier) }}>
                    {rewardData.tier.toUpperCase()}
                </span>
            </div>

            <div className="points-display">
                <div className="points-main">
                    <div className="points-value">{rewardData.totalPoints}</div>
                    <div className="points-label">Total Points</div>
                </div>
                <div className="divider"></div>
                <div className="points-available">
                    <div className="points-value">{rewardData.availablePoints}</div>
                    <div className="points-label">Available</div>
                </div>
            </div>

            <div className="tier-discount">
                <span>{rewardData.tierDiscount}% Discount</span>
                <span className="next-tier">
                    {rewardData.pointsToNextTier > 0 && `${rewardData.pointsToNextTier} pts to next tier`}
                </span>
            </div>

            <div className="achievements-mini">
                <span className="achievement">🎖️ {rewardData.badgeCount} Badges</span>
            </div>

            <button 
                className="btn-history"
                onClick={() => setShowHistory(!showHistory)}
            >
                {showHistory ? 'Hide' : 'Show'} History
            </button>

            {showHistory && history.length > 0 && (
                <div className="history-dropdown">
                    <h5>Recent Earnings</h5>
                    {history.map((item, index) => (
                        <div key={index} className="history-item">
                            <div className="history-icon">{getSourceIcon(item.source)}</div>
                            <div className="history-info">
                                <div className="history-description">{item.description}</div>
                                <div className="history-date">
                                    {new Date(item.earnedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="history-amount">+{item.amount}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getSourceIcon = (source) => {
    const icons = {
        'task-completion': '✓',
        'assessment-pass': '🎯',
        'badge-earned': '🏅',
        'streak-bonus': '🔥',
        'milestone-achieved': '🎖️',
        'referral': '👥',
        'manual-award': '⭐',
        'redemption': '🎁'
    };
    return icons[source] || '⭐';
};

export default RewardPointsWidget;
