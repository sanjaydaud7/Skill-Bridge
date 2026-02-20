const express = require('express');
const router = express.Router();
const {
    getTaskSubmissions,
    getTaskSubmission,
    reviewTaskSubmission,
    getProjectSubmissions,
    getProjectSubmission,
    reviewProjectSubmission,
    getPendingCount
} = require('../../controllers/admin/adminSubmissionController');
const { protect, authorize } = require('../../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Get pending count
router.get('/pending-count', getPendingCount);

// Task submission routes
router.get('/tasks', getTaskSubmissions);
router.get('/tasks/:id', getTaskSubmission);
router.put('/tasks/:id/review', reviewTaskSubmission);

// Project submission routes
router.get('/projects', getProjectSubmissions);
router.get('/projects/:id', getProjectSubmission);
router.put('/projects/:id/review', reviewProjectSubmission);

module.exports = router;