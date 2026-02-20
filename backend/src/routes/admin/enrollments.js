const express = require('express');
const router = express.Router();
const {
    getEnrollments,
    getEnrollment,
    updateEnrollmentStatus,
    manualEnrollment,
    unenrollStudent,
    resetEnrollmentProgress,
    getEnrollmentStats
} = require('../../controllers/admin/adminEnrollmentController');
const { protect, authorize } = require('../../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Stats route
router.get('/stats', getEnrollmentStats);

// Manual enrollment
router.post('/manual', manualEnrollment);

// Enrollment routes
router.get('/', getEnrollments);
router.get('/:id', getEnrollment);
router.put('/:id/status', updateEnrollmentStatus);
router.put('/:id/reset', resetEnrollmentProgress);
router.delete('/:id', unenrollStudent);

module.exports = router;