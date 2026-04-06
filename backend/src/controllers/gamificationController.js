const RewardPoints = require('../../models/RewardPoints');
const Streak = require('../../models/Streak');
const StudentBadge = require('../../models/StudentBadge');
const Enrollment = require('../../models/Enrollment');

// @desc    Get user's reward points summary
// @route   GET /api/rewards/:userId
// @access  Private
exports.getRewardPointsSummary = async(req, res) => {
    try {
        const { userId } = req.params;

        let rewardPoints = await RewardPoints.findOne({ userId });

        if (!rewardPoints) {
            rewardPoints = new RewardPoints({ userId });
            await rewardPoints.save();
        }

        // Get recent earnings
        const recentEarnings = rewardPoints.pointsHistory.slice(-10).reverse();

        // Get badges count
        const badgeCount = await StudentBadge.countDocuments({ userId });

        res.json({
            success: true,
            data: {
                totalPoints: rewardPoints.totalPoints,
                availablePoints: rewardPoints.availablePoints,
                tier: rewardPoints.tier,
                tierDiscount: rewardPoints.tierProgression?.[rewardPoints.tier]?.discount || 0,
                badgeCount,
                recentEarnings,
                pointsToNextTier: rewardPoints.tier === 'diamond' ? 0 : calculatePointsToNextTier(rewardPoints.totalPoints)
            }
        });
    } catch (error) {
        console.error('Error fetching reward points:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reward points',
            error: error.message
        });
    }
};

// @desc    Get gamification dashboard
// @route   GET /api/rewards/dashboard/:userId
// @access  Private
exports.getGamificationDashboard = async(req, res) => {
    try {
        const { userId } = req.params;

        // Get reward points
        let rewardPoints = await RewardPoints.findOne({ userId });
        if (!rewardPoints) {
            rewardPoints = new RewardPoints({ userId });
            await rewardPoints.save();
        }

        // Get streaks
        const enrollments = await Enrollment.find({ userId }).select('_id');
        const streaks = await Streak.find({ enrollmentId: { $in: enrollments.map(e => e._id) } });

        // Get active streak (highest current streak)
        const activeStreak = streaks.reduce((max, s) => s.currentStreak > max.currentStreak ? s : max, { currentStreak: 0 });

        // Get badges
        const badges = await StudentBadge.find({ userId })
            .populate('badgeId')
            .limit(5)
            .sort({ earnedAt: -1 });

        // Calculate achievements
        const achievements = {
            badges: await StudentBadge.countDocuments({ userId }),
            streaks: streaks.filter(s => s.currentStreak > 0).length,
            levelReached: getLevelFromPoints(rewardPoints.totalPoints)
        };

        res.json({
            success: true,
            data: {
                points: {
                    total: rewardPoints.totalPoints,
                    available: rewardPoints.availablePoints,
                    tier: rewardPoints.tier
                },
                streaks: {
                    active: activeStreak.currentStreak,
                    longest: activeStreak.longestStreak,
                    count: streaks.length
                },
                badges: badges,
                achievements,
                nextMilestone: {
                    pointsNeeded: calculatePointsToNextTier(rewardPoints.totalPoints),
                    nextTier: getNextTier(rewardPoints.tier)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching gamification dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching gamification dashboard',
            error: error.message
        });
    }
};

// @desc    Get leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Private
exports.getLeaderboard = async(req, res) => {
    try {
        const { limit = 20, timeframe = 'all' } = req.query;

        let dateFilter = {};
        if (timeframe === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            dateFilter = { createdAt: { $gte: monthAgo } };
        } else if (timeframe === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = { createdAt: { $gte: weekAgo } };
        }

        const leaderboard = await RewardPoints.find(dateFilter)
            .sort({ totalPoints: -1 })
            .limit(parseInt(limit))
            .populate('userId', 'name profilePicture');

        res.json({
            success: true,
            data: leaderboard.map((rp, index) => ({
                rank: index + 1,
                user: rp.userId,
                points: rp.totalPoints,
                tier: rp.tier
            }))
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

// @desc    Redeem reward points
// @route   POST /api/rewards/redeem
// @access  Private
exports.redeemPoints = async(req, res) => {
    try {
        const { userId } = req.user;
        const { pointsToSpend, rewardType } = req.body;

        let rewardPoints = await RewardPoints.findOne({ userId });
        if (!rewardPoints) {
            return res.status(404).json({
                success: false,
                message: 'Reward account not found'
            });
        }

        if (rewardPoints.availablePoints < pointsToSpend) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient reward points'
            });
        }

        rewardPoints.availablePoints -= pointsToSpend;
        rewardPoints.rewardsRedeemed.push({
            rewardId: null,
            pointsSpent: pointsToSpend,
            redeemedAt: new Date(),
            reward: rewardType
        });

        await rewardPoints.save();

        res.json({
            success: true,
            message: 'Points redeemed successfully',
            data: {
                pointsSpent: pointsToSpend,
                rewardType,
                remainingPoints: rewardPoints.availablePoints
            }
        });
    } catch (error) {
        console.error('Error redeeming points:', error);
        res.status(500).json({
            success: false,
            message: 'Error redeeming points',
            error: error.message
        });
    }
};

// @desc    Get achievement unlocked history
// @route   GET /api/rewards/history/:userId
// @access  Private
exports.getAchievementHistory = async(req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;

        let rewardPoints = await RewardPoints.findOne({ userId });
        if (!rewardPoints) {
            rewardPoints = new RewardPoints({ userId });
            await rewardPoints.save();
        }

        const history = rewardPoints.pointsHistory.slice(-parseInt(limit)).reverse();

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Error fetching achievement history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching achievement history',
            error: error.message
        });
    }
};

// @desc    Update tier based on points
// @route   POST /api/rewards/update-tier/:userId
// @access  Private/Admin
exports.updateTier = async(req, res) => {
    try {
        const { userId } = req.params;

        let rewardPoints = await RewardPoints.findOne({ userId });
        if (!rewardPoints) {
            return res.status(404).json({
                success: false,
                message: 'Reward account not found'
            });
        }

        const points = rewardPoints.totalPoints;
        let newTier = 'bronze';

        if (points >= 5000) newTier = 'diamond';
        else if (points >= 3000) newTier = 'platinum';
        else if (points >= 1500) newTier = 'gold';
        else if (points >= 500) newTier = 'silver';

        const oldTier = rewardPoints.tier;
        rewardPoints.tier = newTier;

        await rewardPoints.save();

        res.json({
            success: true,
            data: {
                oldTier,
                newTier,
                totalPoints: rewardPoints.totalPoints,
                tierChanged: oldTier !== newTier
            }
        });
    } catch (error) {
        console.error('Error updating tier:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating tier',
            error: error.message
        });
    }
};

// Helper functions
const calculatePointsToNextTier = (currentPoints) => {
    if (currentPoints >= 5000) return 0;
    if (currentPoints >= 3000) return 5000 - currentPoints;
    if (currentPoints >= 1500) return 3000 - currentPoints;
    if (currentPoints >= 500) return 1500 - currentPoints;
    return 500 - currentPoints;
};

const getNextTier = (currentTier) => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const index = tiers.indexOf(currentTier);
    return index < tiers.length - 1 ? tiers[index + 1] : 'diamond';
};

const getLevelFromPoints = (points) => {
    if (points >= 5000) return 'Diamond';
    if (points >= 3000) return 'Platinum';
    if (points >= 1500) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
};