const Streak = require('../../models/Streak');
const StudentBadge = require('../../models/StudentBadge');
const Badge = require('../../models/Badge');
const RewardPoints = require('../../models/RewardPoints');
const Enrollment = require('../../models/Enrollment');
const TaskSubmission = require('../../models/TaskSubmission');

// @desc    Initialize streak for enrollment
// @route   POST /api/streaks/:enrollmentId/initialize
// @access  Private
exports.initializeStreak = async(req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { streakType } = req.body;

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        let streak = await Streak.findOne({ enrollmentId, streakType });
        if (streak) {
            return res.status(400).json({
                success: false,
                message: 'Streak already exists for this enrollment'
            });
        }

        streak = new Streak({
            userId: enrollment.userId,
            enrollmentId,
            streakType,
            milestones: [
                { daysCompleted: 3, rewardPoints: 25, achieved: false },
                { daysCompleted: 7, rewardPoints: 50, achieved: false },
                { daysCompleted: 14, rewardPoints: 100, achieved: false },
                { daysCompleted: 30, rewardPoints: 250, achieved: false },
                { daysCompleted: 90, rewardPoints: 500, achieved: false }
            ]
        });

        await streak.save();

        res.status(201).json({
            success: true,
            data: streak
        });
    } catch (error) {
        console.error('Error initializing streak:', error);
        res.status(500).json({
            success: false,
            message: 'Error initializing streak',
            error: error.message
        });
    }
};

// @desc    Get current streak
// @route   GET /api/streaks/:enrollmentId
// @access  Private
exports.getStreak = async(req, res) => {
    try {
        const { enrollmentId } = req.params;

        const streak = await Streak.findOne({ enrollmentId });

        if (!streak) {
            return res.status(404).json({
                success: false,
                message: 'Streak not found'
            });
        }

        res.json({
            success: true,
            data: streak
        });
    } catch (error) {
        console.error('Error fetching streak:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching streak',
            error: error.message
        });
    }
};

// @desc    Update streak on activity
// @route   POST /api/streaks/:enrollmentId/update-activity
// @access  Private
exports.updateStreakActivity = async(req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { activity, points } = req.body;

        let streak = await Streak.findOne({ enrollmentId });

        if (!streak) {
            return res.status(404).json({
                success: false,
                message: 'Streak not found'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActivityDate = new Date(streak.lastActivityDate);
        lastActivityDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // Activity today already counted
            return res.json({
                success: true,
                message: 'Activity already logged today',
                data: streak
            });
        } else if (daysDiff === 1) {
            // Consecutive day
            streak.currentStreak++;
            streak.totalDaysActive++;
        } else {
            // Streak broken
            if (streak.currentStreak > streak.longestStreak) {
                streak.longestStreak = streak.currentStreak;
            }
            streak.currentStreak = 1;
            streak.totalDaysActive++;
        }

        // Log activity
        streak.activityLog.push({
            date: new Date(),
            activity,
            points: points || 10
        });

        streak.lastActivityDate = new Date();

        // Check for milestone achievements
        let pointsAwarded = points || 10;
        for (const milestone of streak.milestones) {
            if (streak.currentStreak >= milestone.daysCompleted && !milestone.achieved) {
                milestone.achieved = true;
                milestone.achievedAt = new Date();
                pointsAwarded += milestone.rewardPoints;
            }
        }

        await streak.save();

        // Award points
        let rewardPoints = await RewardPoints.findOne({ userId: streak.userId });
        if (!rewardPoints) {
            rewardPoints = new RewardPoints({ userId: streak.userId });
        }
        rewardPoints.totalPoints += pointsAwarded;
        rewardPoints.availablePoints += pointsAwarded;
        rewardPoints.pointsHistory.push({
            amount: pointsAwarded,
            source: 'streak-bonus',
            sourceId: enrollmentId,
            description: `Streak day ${streak.currentStreak} - ${activity}`
        });
        await rewardPoints.save();

        res.json({
            success: true,
            data: {
                streak,
                pointsAwarded
            }
        });
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating streak',
            error: error.message
        });
    }
};

// @desc    Get streaks for user
// @route   GET /api/streaks/user/:userId
// @access  Private
exports.getUserStreaks = async(req, res) => {
    try {
        const { userId } = req.params;

        const streaks = await Streak.find({ userId });

        res.json({
            success: true,
            data: streaks
        });
    } catch (error) {
        console.error('Error fetching user streaks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user streaks',
            error: error.message
        });
    }
};

// @desc    Get leaderboard by streaks
// @route   GET /api/streaks/leaderboard
// @access  Private
exports.getStreakLeaderboard = async(req, res) => {
    try {
        const { limit = 20, internshipId } = req.query;

        let query = {};
        if (internshipId) {
            query = { enrollmentId: { $in: [] } };
            // Get enrollments for this internship
            const enrollments = await Enrollment.find({ courseId: internshipId }).select('_id');
            query.enrollmentId = { $in: enrollments.map(e => e._id) };
        }

        const leaderboard = await Streak.find(query)
            .sort({ currentStreak: -1, longestStreak: -1 })
            .limit(parseInt(limit))
            .populate('userId', 'name profilePicture');

        res.json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message
        });
    }
};

// @desc    Reset streak (if broken)
// @route   POST /api/streaks/:streakId/reset
// @access  Private/Admin
exports.resetStreak = async(req, res) => {
    try {
        const { streakId } = req.params;

        const streak = await Streak.findById(streakId);
        if (!streak) {
            return res.status(404).json({
                success: false,
                message: 'Streak not found'
            });
        }

        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }

        streak.currentStreak = 0;
        streak.lastActivityDate = new Date();

        await streak.save();

        res.json({
            success: true,
            data: streak
        });
    } catch (error) {
        console.error('Error resetting streak:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting streak',
            error: error.message
        });
    }
};