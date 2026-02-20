const Payment = require('../../models/Payment');
const User = require('../../models/User');
const Course = require('../../models/Course');
const AdminLog = require('../../models/AdminLog');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getPayments = async(req, res) => {
    try {
        const { status, courseId, userId, startDate, endDate, page = 1, limit = 10 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (courseId) query.courseId = courseId;
        if (userId) query.userId = userId;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const payments = await Payment.find(query)
            .populate('userId', 'name email')
            .populate('courseId', 'title certificatePrice')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        res.json({
            success: true,
            data: payments,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error.message
        });
    }
};

// @desc    Get single payment details
// @route   GET /api/admin/payments/:id
// @access  Private/Admin
exports.getPayment = async(req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('userId', 'name email profilePicture')
            .populate('courseId', 'title certificatePrice');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Get Stripe payment details if available
        let stripeDetails = null;
        if (payment.stripePaymentIntentId && !payment.bypassedForTesting) {
            try {
                stripeDetails = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
            } catch (error) {
                console.error('Error fetching Stripe details:', error);
            }
        }

        res.json({
            success: true,
            data: {
                payment,
                stripeDetails
            }
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment',
            error: error.message
        });
    }
};

// @desc    Manually verify payment
// @route   PUT /api/admin/payments/:id/verify
// @access  Private/Admin
exports.verifyPayment = async(req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('userId', 'name')
            .populate('courseId', 'title');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Payment is already completed'
            });
        }

        payment.status = 'completed';
        payment.paidAt = Date.now();
        await payment.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'update',
            targetModel: 'Payment',
            targetId: payment._id,
            description: `Manually verified payment for ${payment.userId.name} - ${payment.courseId.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

// @desc    Process refund
// @route   POST /api/admin/payments/:id/refund
// @access  Private/Admin
exports.refundPayment = async(req, res) => {
    try {
        const { amount, reason } = req.body;

        const payment = await Payment.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('courseId', 'title');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only refund completed payments'
            });
        }

        if (payment.status === 'refunded') {
            return res.status(400).json({
                success: false,
                message: 'Payment is already refunded'
            });
        }

        // Validate refund amount
        const refundAmount = amount || payment.amount;
        if (refundAmount > payment.amount) {
            return res.status(400).json({
                success: false,
                message: 'Refund amount cannot exceed payment amount'
            });
        }

        if (!reason || reason.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Refund reason is required (minimum 10 characters)'
            });
        }

        // Process Stripe refund if not bypassed
        if (!payment.bypassedForTesting && payment.stripePaymentIntentId) {
            try {
                await stripe.refunds.create({
                    payment_intent: payment.stripePaymentIntentId,
                    amount: refundAmount * 100, // Convert to cents
                    reason: 'requested_by_customer'
                });
            } catch (stripeError) {
                console.error('Stripe refund error:', stripeError);
                return res.status(500).json({
                    success: false,
                    message: 'Error processing Stripe refund',
                    error: stripeError.message
                });
            }
        }

        payment.status = 'refunded';
        payment.refundedAt = Date.now();
        payment.refundReason = reason;
        await payment.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'refund',
            targetModel: 'Payment',
            targetId: payment._id,
            description: `Refunded payment for ${payment.userId.name} - ${payment.courseId.title}. Reason: ${reason}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Payment refunded successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};

// @desc    Create manual payment entry
// @route   POST /api/admin/payments/manual
// @access  Private/Admin
exports.createManualPayment = async(req, res) => {
    try {
        const { userId, courseId, amount, paymentMethod, notes } = req.body;

        // Validate user and course
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check for existing payment
        const existingPayment = await Payment.findOne({
            userId,
            courseId,
            status: 'completed'
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Payment already exists for this course'
            });
        }

        // Create manual payment
        const payment = await Payment.create({
            userId,
            courseId,
            amount: amount || course.certificatePrice,
            currency: 'inr',
            status: 'completed',
            paymentMethod: paymentMethod || 'manual',
            paidAt: Date.now(),
            bypassedForTesting: false,
            metadata: {
                manualEntry: true,
                createdBy: req.user._id,
                notes: notes || 'Manual payment entry by admin'
            }
        });

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'manual_payment',
            targetModel: 'Payment',
            targetId: payment._id,
            description: `Created manual payment entry for ${user.name} - ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        const populatedPayment = await Payment.findById(payment._id)
            .populate('userId', 'name email')
            .populate('courseId', 'title');

        res.status(201).json({
            success: true,
            message: 'Manual payment created successfully',
            data: populatedPayment
        });
    } catch (error) {
        console.error('Error creating manual payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating manual payment',
            error: error.message
        });
    }
};

// @desc    Get payment statistics
// @route   GET /api/admin/payments/stats
// @access  Private/Admin
exports.getPaymentStats = async(req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = { status: 'completed' };
        if (startDate || endDate) {
            query.paidAt = {};
            if (startDate) query.paidAt.$gte = new Date(startDate);
            if (endDate) query.paidAt.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query);

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalTransactions = payments.length;
        const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        // Count payment methods
        const bypassedPayments = payments.filter(p => p.bypassedForTesting).length;
        const stripePayments = payments.filter(p => !p.bypassedForTesting).length;

        // Pending and failed
        const pendingPayments = await Payment.countDocuments({ status: 'pending' });
        const failedPayments = await Payment.countDocuments({ status: 'failed' });
        const refundedPayments = await Payment.countDocuments({ status: 'refunded' });

        // Total refunded amount
        const refundedAmount = await Payment.aggregate([
            { $match: { status: 'refunded' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalTransactions,
                avgTransactionValue: Math.round(avgTransactionValue),
                pendingPayments,
                failedPayments,
                refundedPayments,
                totalRefunded: refundedAmount[0] ? .total || 0,
                paymentMethods: {
                    stripe: stripePayments,
                    bypassed: bypassedPayments
                }
            }
        });
    } catch (error) {
        console.error('Error fetching payment stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment statistics',
            error: error.message
        });
    }
};