const express = require('express');
const router = express.Router();
const {
    getPayments,
    getPayment,
    verifyPayment,
    refundPayment,
    createManualPayment,
    getPaymentStats
} = require('../../controllers/admin/adminPaymentController');
const { protect, authorize } = require('../../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Statistics
router.get('/stats', getPaymentStats);

// Manual payment
router.post('/manual', createManualPayment);

// Payment routes
router.get('/', getPayments);
router.get('/:id', getPayment);
router.put('/:id/verify', verifyPayment);
router.post('/:id/refund', refundPayment);

module.exports = router;