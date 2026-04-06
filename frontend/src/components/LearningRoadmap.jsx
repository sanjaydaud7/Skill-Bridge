import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgressTracking.css';

const LearningRoadmap = ({ enrollmentId, internshipId }) => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!internshipId) return;

        const fetchRoadmap = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/milestones/roadmap/${internshipId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMilestones(response.data.data?.milestones || []);
            } catch (error) {
                console.error('Error fetching roadmap:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [internshipId, token]);

    if (loading) return <div className="loading">Loading learning roadmap...</div>;

    return (
        <div className="learning-roadmap">
            <h3>Learning Roadmap</h3>
            <div className="roadmap-container">
                {milestones.length === 0 ? (
                    <p className="no-data">No milestones available</p>
                ) : (
                    <div className="roadmap-steps">
                        {milestones.map((milestone, index) => (
                            <div 
                                key={milestone.id} 
                                className={`roadmap-step ${milestone.progress >= 100 ? 'completed' : milestone.progress > 0 ? 'in-progress' : 'pending'}`}
                            >
                                <div className="step-number">{index + 1}</div>
                                <div className="step-content">
                                    <h5>{milestone.title}</h5>
                                    <p>{milestone.description}</p>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${milestone.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="milestone-meta">
                                        <span className="type-badge">{milestone.type.replace('-', ' ')}</span>
                                        <span className="reward-points">+{milestone.rewardPoints} pts</span>
                                    </div>
                                </div>
                                {index < milestones.length - 1 && <div className="roadmap-connector"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningRoadmap;
