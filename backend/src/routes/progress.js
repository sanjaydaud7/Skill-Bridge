const express = require('express');
const router = express.Router();
const {
    getCourseProgress,
    markVideoCompleted,
    getUserStats,
    bypassCompleteAll
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/stats', getUserStats);
router.post('/:courseId/bypass-complete', bypassCompleteAll);
router.post('/:courseId/video/:moduleId', markVideoCompleted);
router.get('/:courseId', getCourseProgress);

module.exports = router;