import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgressTracking.css';

const SkillAssessmentView = ({ internshipId }) => {
    const [assessments, setAssessments] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!internshipId) return;
        
        const fetchAssessments = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/assessments/internship/${internshipId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setAssessments(response.data.data || []);
            } catch (error) {
                console.error('Error fetching assessments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssessments();
    }, [internshipId, token]);

    const handleAssessmentSelect = (assessment) => {
        setSelectedAssessment(assessment);
        setAnswers({});
        setResult(null);
    };

    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers({
            ...answers,
            [questionIndex]: answer
        });
    };

    const handleSubmit = async () => {
        if (!selectedAssessment) return;

        setSubmitting(true);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/assessments/${selectedAssessment._id}/submit`,
                { answers: Object.values(answers) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResult(response.data.data);
        } catch (error) {
            console.error('Error submitting assessment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading assessments...</div>;

    if (result) {
        return (
            <div className="assessment-result">
                <div className={`result-card ${result.passed ? 'passed' : 'failed'}`}>
                    <div className="result-header">
                        <span className="result-icon">{result.passed ? '✓' : '✗'}</span>
                        <h2>{result.passed ? 'Assessment Passed!' : 'Assessment Failed'}</h2>
                    </div>
                    <div className="result-details">
                        <div className="detail-row">
                            <span>Score:</span>
                            <strong>{result.totalScore}%</strong>
                        </div>
                        <div className="detail-row">
                            <span>Correct Answers:</span>
                            <strong>{result.correctAnswers} / {result.totalQuestions}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Points Earned:</span>
                            <strong className="points">+{result.pointsEarned}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Passing Score:</span>
                            <strong>{result.passingScore}%</strong>
                        </div>
                    </div>
                    <button 
                        className="btn-primary"
                        onClick={() => setResult(null)}
                    >
                        Take Another Assessment
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedAssessment) {
        return (
            <div className="assessments-list">
                <h3>Skill Assessments</h3>
                {assessments.length === 0 ? (
                    <p className="no-assessments">No assessments available</p>
                ) : (
                    <div className="assessment-cards">
                        {assessments.map((assessment) => (
                            <div key={assessment._id} className="assessment-card">
                                <div className="assessment-header">
                                    <h4>{assessment.title}</h4>
                                    <span className={`difficulty ${assessment.difficulty}`}>
                                        {assessment.difficulty}
                                    </span>
                                </div>
                                <p className="assessment-description">{assessment.description}</p>
                                <div className="assessment-meta">
                                    <span className="skill-tag">{assessment.skillCategory}</span>
                                    <span className="time-tag">⏱ {assessment.timeLimit} min</span>
                                </div>
                                <div className="assessment-footer">
                                    <span className="points">{assessment.totalPoints} points</span>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => handleAssessmentSelect(assessment)}
                                    >
                                        Start Assessment
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="assessment-exam">
            <div className="exam-header">
                <h3>{selectedAssessment.title}</h3>
                <button 
                    className="btn-back"
                    onClick={() => setSelectedAssessment(null)}
                >
                    ← Back
                </button>
            </div>
            <p className="exam-description">{selectedAssessment.description}</p>

            <div className="questions-container">
                {selectedAssessment.questions.map((question, index) => (
                    <div key={index} className="question-card">
                        <div className="question-header">
                            <h4>Question {index + 1}</h4>
                            <span className="points-label">[{question.points} pts]</span>
                        </div>
                        <p className="question-text">{question.questionText}</p>

                        {question.questionType === 'multiple-choice' && (
                            <div className="options">
                                {question.options.map((option, optionIndex) => (
                                    <label key={optionIndex} className="option">
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={option.text}
                                            checked={answers[index] === option.text}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        />
                                        <span>{option.text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {question.questionType === 'true-false' && (
                            <div className="options">
                                {['True', 'False'].map((option) => (
                                    <label key={option} className="option">
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={option}
                                            checked={answers[index] === option}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {question.questionType === 'short-answer' && (
                            <input
                                type="text"
                                placeholder="Enter your answer"
                                value={answers[index] || ''}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                className="short-answer-input"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="exam-footer">
                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(answers).length < selectedAssessment.questions.length}
                >
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
            </div>
        </div>
    );
};

export default SkillAssessmentView;
