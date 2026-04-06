import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Gamification.css';

const StreakTracker = ({ enrollmentId, userId }) => {
    const [streak, setStreak] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!enrollmentId) return;

        const fetchStreak = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/streaks/${enrollmentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setStreak(response.data.data);
            } catch (error) {
                console.error('Error fetching streak:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStreak();
    }, [enrollmentId, token]);

    const handleLogActivity = async () => {
        if (!streak) return;

        try {
            const response = await axios.post(
                `http://localhost:5000/api/streaks/${enrollmentId}/update-activity`,
                { 
                    activity: 'Task Completed', 
                    points: 10 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStreak(response.data.data);
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    };

    if (loading) return <div className="loading-small">Loading streak...</div>;
    if (!streak) return null;

    return (
        <div className="streak-tracker">
            <div className="streak-card">
                <div className="streak-icon">🔥</div>
                <div className="streak-content">
                    <h4>Current Streak</h4>
                    <div className="streak-number">{streak.currentStreak}</div>
                    <p className="streak-label">days</p>
                </div>
            </div>

            <div className="streak-card">
                <div className="streak-icon">🏆</div>
                <div className="streak-content">
                    <h4>Longest Streak</h4>
                    <div className="streak-number">{streak.longestStreak}</div>
                    <p className="streak-label">days</p>
                </div>
            </div>

            <div className="streak-milestones">
                <h5>Milestone Progress</h5>
                {streak.milestones.map((milestone, index) => (
                    <div 
                        key={index} 
                        className={`milestone ${milestone.achieved ? 'achieved' : ''}`}
                    >
                        <div className="milestone-label">
                            {milestone.daysCompleted} days
                        </div>
                        <div className="milestone-progress">
                            <div 
                                className="milestone-bar" 
                                style={{ width: `${Math.min(streak.currentStreak / milestone.daysCompleted * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="milestone-reward">
                            {milestone.achieved ? '✓' : '+' + milestone.rewardPoints}
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn-log-activity" onClick={handleLogActivity}>
                Log Activity Today
            </button>
        </div>
    );
};

export default StreakTracker;
