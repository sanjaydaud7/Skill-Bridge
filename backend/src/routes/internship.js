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
router.get('/:id', getInternshipById);

// Protected routes
router.get('/:id/curriculum', protect, getInternshipCurriculum);
router.post('/:id/enroll', protect, enrollInternship);
router.get('/user/enrolled', protect, getEnrolledInternships);

module.exports = router;