const express = require('express');
const router = express.Router();
const {
    createMilestones,
    getInternshipMilestones,
    getEnrollmentProgress,
    updateMilestoneProgress,
    recalculateMilestones,
    getLearningRoadmap
} = require('../controllers/milestoneController');
const { protect, authorize } = require('../middleware/auth');

// Admin routes
router.post('/internship/:internshipId', protect, authorize('admin'), createMilestones);
router.post('/:enrollmentId/recalculate', protect, authorize('admin'), recalculateMilestones);

// Student/Public routes
router.get('/internship/:internshipId', protect, getInternshipMilestones);
router.get('/enrollment/:enrollmentId/progress', protect, getEnrollmentProgress);
router.put('/:milestoneId/progress', protect, updateMilestoneProgress);
router.get('/roadmap/:internshipId', protect, getLearningRoadmap);

module.exports = router;