const express = require('express');
const router = express.Router();
const {
    createAssessment,
    getInternshipAssessments,
    getAssessmentsBySkill,
    submitAssessment,
    getAssessmentResult,
    updateAssessment,
    deleteAssessment
} = require('../controllers/skillAssessmentController');
const { protect, authorize } = require('../middleware/auth');

// Admin routes
router.post('/', protect, authorize('admin'), createAssessment);
router.put('/:assessmentId', protect, authorize('admin'), updateAssessment);
router.delete('/:assessmentId', protect, authorize('admin'), deleteAssessment);

// Student/Public routes
router.get('/internship/:internshipId', protect, getInternshipAssessments);
router.get('/skill/:skillCategory', protect, getAssessmentsBySkill);
router.post('/:assessmentId/submit', protect, submitAssessment);
router.get('/:assessmentId/result/:userId', protect, getAssessmentResult);

module.exports = router;