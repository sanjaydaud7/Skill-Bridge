const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    getCourseCurriculum,
    enrollCourse,
    getEnrolledCourses
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.get('/:id/curriculum', protect, getCourseCurriculum);
router.post('/:id/enroll', protect, enrollCourse);
router.get('/user/enrolled', protect, getEnrolledCourses);

module.exports = router;