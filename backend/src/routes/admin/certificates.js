const express = require('express');
const router = express.Router();
const {
    getCertificates,
    getCertificate,
    manualIssueCertificate,
    revokeCertificate,
    restoreCertificate,
    getCertificateStats
} = require('../../controllers/admin/adminCertificateController');
const { protect, authorize } = require('../../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Statistics
router.get('/stats', getCertificateStats);

// Manual issuance
router.post('/manual', manualIssueCertificate);

// Certificate routes
router.get('/', getCertificates);
router.get('/:id', getCertificate);
router.put('/:id/revoke', revokeCertificate);
router.put('/:id/restore', restoreCertificate);

module.exports = router;