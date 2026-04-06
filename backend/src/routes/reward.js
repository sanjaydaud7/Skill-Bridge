const express = require('express');
const router = express.Router();
const {
    getRewardPointsSummary,
    getGamificationDashboard,
    getLeaderboard,
    redeemPoints,
    getAchievementHistory,
    updateTier
} = require('../controllers/gamificationController');
const { protect, authorize } = require('../middleware/auth');

// Reward points
router.get('/:userId', protect, getRewardPointsSummary);
router.post('/redeem', protect, redeemPoints);

// Gamification dashboard
router.get('/dashboard/:userId', protect, getGamificationDashboard);

// Leaderboards
router.get('/leaderboard', protect, getLeaderboard);

// History
router.get('/history/:userId', protect, getAchievementHistory);

// Admin
router.post('/update-tier/:userId', protect, authorize('admin'), updateTier);

module.exports = router;