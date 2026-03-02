const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getEnrollmentTrends,
    getRevenueAnalytics,
    getCourseAnalytics,
    getStudentAnalytics,
    getSubmissionAnalytics
} = require('../../controllers/admin/adminAnalyticsController');
const { protect, authorize } = require('../../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Analytics routes
router.get('/dashboard', getDashboardStats);
router.get('/enrollment-trends', getEnrollmentTrends);
router.get('/revenue', getRevenueAnalytics);
router.get('/internships', getCourseAnalytics);
router.get('/students', getStudentAnalytics);
router.get('/submissions', getSubmissionAnalytics);

module.exports = router;