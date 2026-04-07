const express = require('express');
const router = express.Router();
const {
    checkEligibility,
    generateCertificate,
    getUserCertificates,
    verifyCertificate,
    downloadCertificate,
    unlockCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/verify/:code', verifyCertificate);

// Protected routes
router.use(protect);

router.get('/', getUserCertificates);
router.get('/:courseId/eligibility', checkEligibility);
router.post('/:courseId/unlock', unlockCertificate);
router.post('/:courseId/generate', generateCertificate);
router.get('/:id/download', downloadCertificate);

module.exports = router;