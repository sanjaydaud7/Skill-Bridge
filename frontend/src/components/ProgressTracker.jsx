import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgressTracking.css';

const ProgressTracker = ({ enrollmentId }) => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!enrollmentId) return;

        const fetchProgress = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/milestones/enrollment/${enrollmentId}/progress`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProgress(response.data.data);
            } catch (error) {
                console.error('Error fetching progress:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [enrollmentId, token]);

    if (loading) return <div className="loading">Loading progress...</div>;
    if (!progress) return <p className="no-data">No progress data available</p>;

    return (
        <div className="progress-tracker">
            <div className="progress-summary">
                <div className="progress-stat">
                    <div className="stat-label">Overall Progress</div>
                    <div className="stat-value">{progress.completionPercentage}%</div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress.completionPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="milestone-stats">
                    <div className="stat-card">
                        <span className="stat-icon">✓</span>
                        <div>
                            <div className="stat-label">Completed</div>
                            <div className="stat-value">{progress.completedMilestones}/{progress.totalMilestones}</div>
                        </div>
                    </div>

                    {progress.nextMilestone && (
                        <div className="stat-card next-milestone">
                            <span className="stat-icon">→</span>
                            <div>
                                <div className="stat-label">Next Milestone</div>
                                <div className="stat-value">{progress.nextMilestone.title}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="milestones-detailed">
                <h4>Milestone Details</h4>
                {progress.milestones.map((milestone, index) => (
                    <div 
                        key={milestone._id} 
                        className={`milestone-item ${milestone.isCompleted ? 'completed' : 'pending'}`}
                    >
                        <div className="milestone-check">
                            {milestone.isCompleted ? '✓' : index + 1}
                        </div>
                        <div className="milestone-info">
                            <h5>{milestone.title}</h5>
                            <p>{milestone.description}</p>
                            <div className="milestone-badges">
                                <span className="badge type">{milestone.type}</span>
                                {milestone.isCompleted && (
                                    <span className="badge reward">+{milestone.rewardPoints} pts</span>
                                )}
                            </div>
                        </div>
                        {milestone.isCompleted && (
                            <span className="completed-date">
                                {new Date(milestone.completedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressTracker;
