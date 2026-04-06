const express = require('express');
const router = express.Router();
const {
    getAllInternships,
    getInternshipById,
    getInternshipCurriculum,
    enrollInternship,
    getEnrolledInternships
} = require('../controllers/internshipController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllInternships);

// Protected routes - MUST be defined before /:id to avoid route conflicts
router.get('/user/enrolled', protect, getEnrolledInternships);

// Dynamic ID routes - MUST be defined after specific routes
router.get('/:id', getInternshipById);
router.get('/:id/curriculum', protect, getInternshipCurriculum);
router.post('/:id/enroll', protect, enrollInternship);

module.exports = router;