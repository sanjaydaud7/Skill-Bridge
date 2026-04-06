import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Gamification.css';

const LeaderboardView = ({ internshipId, timeframe = 'all' }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [streakLeaderboard, setStreakLeaderboard] = useState([]);
    const [activeView, setActiveView] = useState('points');
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const [pointsRes, streaksRes] = await Promise.all([
                    axios.get(
                        `http://localhost:5000/api/rewards/leaderboard?limit=20&timeframe=${timeframe}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    axios.get(
                        `http://localhost:5000/api/streaks/leaderboard?limit=20&internshipId=${internshipId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);

                setLeaderboard(pointsRes.data.data || []);
                setStreakLeaderboard(streaksRes.data.data || []);
            } catch (error) {
                console.error('Error fetching leaderboards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboards();
    }, [internshipId, timeframe, token]);

    if (loading) return <div className="loading">Loading leaderboard...</div>;

    return (
        <div className="leaderboard-view">
            <h3>Leaderboards</h3>

            <div className="leaderboard-tabs">
                <button 
                    className={`tab ${activeView === 'points' ? 'active' : ''}`}
                    onClick={() => setActiveView('points')}
                >
                    🏆 Points
                </button>
                <button 
                    className={`tab ${activeView === 'streaks' ? 'active' : ''}`}
                    onClick={() => setActiveView('streaks')}
                >
                    🔥 Streaks
                </button>
            </div>

            {activeView === 'points' && (
                <div className="leaderboard-list">
                    {leaderboard.length === 0 ? (
                        <p className="no-data">No leaderboard data available</p>
                    ) : (
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th>Points</th>
                                    <th>Tier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, index) => (
                                    <tr key={index} className={`rank-${entry.rank}`}>
                                        <td className="rank">
                                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                                        </td>
                                        <td className="name">
                                            <div className="user-info">
                                                {entry.user?.profilePicture && (
                                                    <img src={entry.user.profilePicture} alt={entry.user.name} />
                                                )}
                                                <span>{entry.user?.name}</span>
                                            </div>
                                        </td>
                                        <td className="points">{entry.points.toLocaleString()}</td>
                                        <td className={`tier tier-${entry.tier}`}>{entry.tier}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeView === 'streaks' && (
                <div className="leaderboard-list">
                    {streakLeaderboard.length === 0 ? (
                        <p className="no-data">No streak data available</p>
                    ) : (
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th>Current Streak</th>
                                    <th>Longest Streak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {streakLeaderboard.map((entry, index) => (
                                    <tr key={index} className={`rank-${index + 1}`}>
                                        <td className="rank">
                                            {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                                        </td>
                                        <td className="name">
                                            <div className="user-info">
                                                {entry.userId?.profilePicture && (
                                                    <img src={entry.userId.profilePicture} alt={entry.userId.name} />
                                                )}
                                                <span>{entry.userId?.name}</span>
                                            </div>
                                        </td>
                                        <td className="current-streak">
                                            <span className="streak-badge">🔥 {entry.currentStreak}</span>
                                        </td>
                                        <td className="longest-streak">
                                            <span className="streak-badge">🏆 {entry.longestStreak}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeaderboardView;
