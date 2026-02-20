const express = require('express');
const router = express.Router();
const {
    getCourseProgress,
    markVideoCompleted,
    getUserStats
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/stats', getUserStats);
router.get('/:courseId', getCourseProgress);
router.post('/:courseId/video/:moduleId', markVideoCompleted);

module.exports = router;