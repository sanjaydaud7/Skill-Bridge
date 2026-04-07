const express = require('express');
const router = express.Router();
const {
    getCourseProgress,
    markVideoCompleted,
    getUserStats,
    bypassCompleteAll,
    bypassCurriculum,
    bypassTasks,
    bypassProject
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/stats', getUserStats);
router.post('/:courseId/bypass-complete', bypassCompleteAll);
router.post('/:courseId/bypass-curriculum', bypassCurriculum);
router.post('/:courseId/bypass-tasks', bypassTasks);
router.post('/:courseId/bypass-project', bypassProject);
router.post('/:courseId/video/:moduleId', markVideoCompleted);
router.get('/:courseId', getCourseProgress);

module.exports = router;