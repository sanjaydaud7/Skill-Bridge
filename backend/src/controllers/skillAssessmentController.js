const SkillAssessment = require('../../models/SkillAssessment');
const StudentBadge = require('../../models/StudentBadge');
const Badge = require('../../models/Badge');
const RewardPoints = require('../../models/RewardPoints');
const Enrollment = require('../../models/Enrollment');

// @desc    Create a new skill assessment
// @route   POST /api/assessments
// @access  Private/Admin
exports.createAssessment = async(req, res) => {
    try {
        const { title, description, skillCategory, difficulty, questions, passingScore, timeLimit, internshipId } = req.body;

        const assessment = new SkillAssessment({
            title,
            description,
            skillCategory,
            difficulty,
            questions,
            passingScore,
            timeLimit,
            internshipId,
            totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0)
        });

        await assessment.save();

        res.status(201).json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating assessment',
            error: error.message
        });
    }
};

// @desc    Get all assessments for an internship
// @route   GET /api/assessments/internship/:internshipId
// @access  Private
exports.getInternshipAssessments = async(req, res) => {
    try {
        const { internshipId } = req.params;

        const assessments = await SkillAssessment.find({
            internshipId,
            isActive: true
        }).sort({ order: 1 });

        res.json({
            success: true,
            data: assessments
        });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assessments',
            error: error.message
        });
    }
};

// @desc    Get assessment by skill category
// @route   GET /api/assessments/skill/:skillCategory
// @access  Private
exports.getAssessmentsBySkill = async(req, res) => {
    try {
        const { skillCategory } = req.params;
        const { difficulty } = req.query;

        const query = { skillCategory, isActive: true };
        if (difficulty) query.difficulty = difficulty;

        const assessments = await SkillAssessment.find(query).sort({ difficulty: 1 });

        res.json({
            success: true,
            data: assessments
        });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assessments',
            error: error.message
        });
    }
};

// @desc    Submit assessment answers
// @route   POST /api/assessments/:assessmentId/submit
// @access  Private
exports.submitAssessment = async(req, res) => {
    try {
        const { assessmentId } = req.params;
        const { userId } = req.user;
        const { answers } = req.body;

        const assessment = await SkillAssessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }

        // Calculate score
        let score = 0;
        let correctAnswers = 0;

        assessment.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = question.options ? .some(opt => opt.isCorrect && opt.text === userAnswer) ||
                question.correctAnswer === userAnswer;

            if (isCorrect) {
                correctAnswers++;
                score += question.points || 1;
            }
        });

        const totalScore = Math.round((score / assessment.totalPoints) * 100);
        const passed = totalScore >= assessment.passingScore;

        // Award points and badges if passed
        if (passed) {
            // Add reward points
            let rewardPoints = await RewardPoints.findOne({ userId });
            if (!rewardPoints) {
                rewardPoints = new RewardPoints({ userId });
            }
            rewardPoints.totalPoints += 50;
            rewardPoints.availablePoints += 50;
            rewardPoints.pointsHistory.push({
                amount: 50,
                source: 'assessment-pass',
                sourceId: assessmentId,
                description: `Passed ${assessment.title}`
            });
            await rewardPoints.save();

            // Check for badge reward
            const skillBadge = await Badge.findOne({
                condition: 'assessment-pass',
                relatedSkill: assessment.skillCategory
            });

            if (skillBadge) {
                try {
                    const studentBadge = new StudentBadge({
                        userId,
                        badgeId: skillBadge._id,
                        earnedFrom: 'assessment',
                        earnedFromId: assessmentId
                    });
                    await studentBadge.save();
                } catch (err) {
                    // Badge might already be earned
                    if (err.code !== 11000) throw err;
                }
            }
        }

        res.json({
            success: true,
            data: {
                totalScore,
                scoredPoints: score,
                totalPoints: assessment.totalPoints,
                correctAnswers,
                totalQuestions: assessment.questions.length,
                passed,
                passingScore: assessment.passingScore,
                pointsEarned: passed ? 50 : 0
            }
        });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting assessment',
            error: error.message
        });
    }
};

// @desc    Get assessment result
// @route   GET /api/assessments/:assessmentId/result/:userId
// @access  Private
exports.getAssessmentResult = async(req, res) => {
    try {
        const { assessmentId, userId } = req.params;

        // This would require a separate model to store results
        // For now, returning a placeholder
        res.json({
            success: true,
            data: {
                message: 'Assessment result endpoint - needs AssessmentResult model'
            }
        });
    } catch (error) {
        console.error('Error fetching assessment result:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assessment result',
            error: error.message
        });
    }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:assessmentId
// @access  Private/Admin
exports.updateAssessment = async(req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await SkillAssessment.findByIdAndUpdate(
            assessmentId,
            req.body, { new: true, runValidators: true }
        );

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Error updating assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating assessment',
            error: error.message
        });
    }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:assessmentId
// @access  Private/Admin
exports.deleteAssessment = async(req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await SkillAssessment.findById(assessmentId);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }

        assessment.isActive = false;
        await assessment.save();

        res.json({
            success: true,
            message: 'Assessment deactivated'
        });
    } catch (error) {
        console.error('Error deleting assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting assessment',
            error: error.message
        });
    }
};