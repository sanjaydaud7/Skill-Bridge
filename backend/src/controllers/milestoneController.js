const Milestone = require('../../models/Milestone');
const Enrollment = require('../../models/Enrollment');
const Badge = require('../../models/Badge');
const StudentBadge = require('../../models/StudentBadge');
const RewardPoints = require('../../models/RewardPoints');
const TaskSubmission = require('../../models/TaskSubmission');

// @desc    Create milestone roadmap for an internship
// @route   POST /api/milestones/internship/:internshipId
// @access  Private/Admin
exports.createMilestones = async(req, res) => {
    try {
        const { internshipId } = req.params;
        const { milestones } = req.body;

        const createdMilestones = await Milestone.insertMany(
            milestones.map((m, index) => ({
                ...m,
                internshipId,
                roadmapOrder: index + 1
            }))
        );

        res.status(201).json({
            success: true,
            data: createdMilestones
        });
    } catch (error) {
        console.error('Error creating milestones:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating milestones',
            error: error.message
        });
    }
};

// @desc    Get milestones for internship
// @route   GET /api/milestones/internship/:internshipId
// @access  Private
exports.getInternshipMilestones = async(req, res) => {
    try {
        const { internshipId } = req.params;

        const milestones = await Milestone.find({ internshipId })
            .populate('badgeReward')
            .sort({ roadmapOrder: 1 });

        res.json({
            success: true,
            data: milestones
        });
    } catch (error) {
        console.error('Error fetching milestones:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching milestones',
            error: error.message
        });
    }
};

// @desc    Get student's milestone progress
// @route   GET /api/milestones/enrollment/:enrollmentId/progress
// @access  Private
exports.getEnrollmentProgress = async(req, res) => {
    try {
        const { enrollmentId } = req.params;

        const milestones = await Milestone.find({ enrollmentId })
            .populate('badgeReward')
            .sort({ roadmapOrder: 1 });

        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(m => m.isCompleted).length;
        const completionPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

        res.json({
            success: true,
            data: {
                milestones,
                totalMilestones,
                completedMilestones,
                completionPercentage,
                nextMilestone: milestones.find(m => !m.isCompleted)
            }
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progress',
            error: error.message
        });
    }
};

// @desc    Update milestone progress
// @route   PUT /api/milestones/:milestoneId/progress
// @access  Private
exports.updateMilestoneProgress = async(req, res) => {
    try {
        const { milestoneId } = req.params;
        const { progress, isCompleted } = req.body;

        const milestone = await Milestone.findByIdAndUpdate(
            milestoneId, {
                progress: progress || milestone ? .progress,
                isCompleted: isCompleted || false,
                completedAt: isCompleted ? new Date() : null
            }, { new: true, runValidators: true }
        );

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: 'Milestone not found'
            });
        }

        // If milestone is completed, award points and badge
        if (isCompleted && milestone.badgeReward) {
            const enrollment = await Enrollment.findById(milestone.enrollmentId);

            // Award points
            let rewardPoints = await RewardPoints.findOne({ userId: enrollment.userId });
            if (!rewardPoints) {
                rewardPoints = new RewardPoints({ userId: enrollment.userId });
            }
            rewardPoints.totalPoints += milestone.rewardPoints;
            rewardPoints.availablePoints += milestone.rewardPoints;
            rewardPoints.pointsHistory.push({
                amount: milestone.rewardPoints,
                source: 'milestone-achieved',
                sourceId: milestoneId,
                description: `Completed milestone: ${milestone.title}`
            });
            await rewardPoints.save();

            // Award badge
            try {
                const studentBadge = new StudentBadge({
                    userId: enrollment.userId,
                    badgeId: milestone.badgeReward,
                    enrollmentId: milestone.enrollmentId,
                    earnedFrom: 'engagement',
                    earnedFromId: milestoneId
                });
                await studentBadge.save();
            } catch (err) {
                if (err.code !== 11000) console.error('Error awarding badge:', err);
            }
        }

        res.json({
            success: true,
            data: milestone
        });
    } catch (error) {
        console.error('Error updating milestone progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating milestone progress',
            error: error.message
        });
    }
};

// @desc    Calculate milestone progress based on tasks
// @route   POST /api/milestones/:enrollmentId/recalculate
// @access  Private
exports.recalculateMilestones = async(req, res) => {
    try {
        const { enrollmentId } = req.params;

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        const milestones = await Milestone.find({ enrollmentId });

        for (const milestone of milestones) {
            // Count completed tasks for this milestone
            const completedTasks = await TaskSubmission.countDocuments({
                enrollmentId,
                status: 'approved'
            });

            let progress = 0;
            if (milestone.type === 'task-completion' && milestone.requirements ? .tasksToComplete) {
                progress = Math.round((completedTasks / milestone.requirements.tasksToComplete) * 100);
            }

            milestone.progress = Math.min(progress, 100);
            if (progress >= 100 && !milestone.isCompleted) {
                milestone.isCompleted = true;
                milestone.completedAt = new Date();
            }
            await milestone.save();
        }

        res.json({
            success: true,
            message: 'Milestones recalculated',
            data: milestones
        });
    } catch (error) {
        console.error('Error recalculating milestones:', error);
        res.status(500).json({
            success: false,
            message: 'Error recalculating milestones',
            error: error.message
        });
    }
};

// @desc    Get learning roadmap visual data
// @route   GET /api/milestones/roadmap/:internshipId
// @access  Private
exports.getLearningRoadmap = async(req, res) => {
    try {
        const { internshipId } = req.params;

        const milestones = await Milestone.find({ internshipId })
            .populate('badgeReward')
            .sort({ roadmapOrder: 1 });

        const roadmap = {
            internshipId,
            totalSteps: milestones.length,
            milestones: milestones.map(m => ({
                id: m._id,
                title: m.title,
                description: m.description,
                order: m.roadmapOrder,
                type: m.type,
                requirements: m.requirements,
                rewardPoints: m.rewardPoints,
                badge: m.badgeReward,
                progress: 0
            }))
        };

        res.json({
            success: true,
            data: roadmap
        });
    } catch (error) {
        console.error('Error fetching roadmap:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roadmap',
            error: error.message
        });
    }
};