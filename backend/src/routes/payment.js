const express = require('express');
const router = express.Router();
const {
    createCheckoutSession,
    handleWebhook,
    bypassPayment,
    unlockCertificatePayment,
    getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook route (before JSON parsing middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-checkout', createCheckoutSession);
router.post('/bypass/:courseId', bypassPayment);
router.post('/:courseId/unlock-certificate', unlockCertificatePayment);
router.get('/history', getPaymentHistory);

module.exports = router;