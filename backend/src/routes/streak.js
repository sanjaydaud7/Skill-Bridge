const express = require('express');
const router = express.Router();
const {
    initializeStreak,
    getStreak,
    updateStreakActivity,
    getUserStreaks,
    getStreakLeaderboard,
    resetStreak
} = require('../controllers/streakController');
const { protect, authorize } = require('../middleware/auth');

// Initialize streak
router.post('/:enrollmentId/initialize', protect, initializeStreak);

// Get streak info
router.get('/:enrollmentId', protect, getStreak);
router.get('/user/:userId', protect, getUserStreaks);

// Update and manage streaks
router.post('/:enrollmentId/update-activity', protect, updateStreakActivity);
router.post('/:streakId/reset', protect, authorize('admin'), resetStreak);

// Leaderboard
router.get('/leaderboard', protect, getStreakLeaderboard);

module.exports = router;