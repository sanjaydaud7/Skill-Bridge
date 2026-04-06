const express = require('express');
const router = express.Router();
const {
    createBadge,
    getAllBadges,
    getInternshipBadges,
    getStudentBadges,
    awardBadge,
    getSkillBadges,
    updateSkillProficiency,
    endorseSkill,
    getBadgeStats
} = require('../controllers/badgeController');
const { protect, authorize } = require('../middleware/auth');

// Admin routes
router.post('/', protect, authorize('admin'), createBadge);
router.post('/award', protect, authorize('admin'), awardBadge);
router.put('/skill/:skillBadgeId', protect, authorize('admin'), updateSkillProficiency);

// Badge info
router.get('/', protect, getAllBadges);
router.get('/internship/:internshipId', protect, getInternshipBadges);
router.get('/:badgeId/stats', protect, getBadgeStats);

// Student badges and skills
router.get('/student/:userId', protect, getStudentBadges);
router.get('/skill/:userId', protect, getSkillBadges);
router.post('/skill/:skillBadgeId/endorse', protect, endorseSkill);

module.exports = router;