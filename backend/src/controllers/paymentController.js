const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout
// @access  Private
exports.createCheckoutSession = async(req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        // Get course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
            userId,
            courseId,
            status: 'completed'
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Payment already completed for this course'
            });
        }

        // Create payment record
        const payment = await Payment.create({
            userId,
            courseId,
            amount: course.certificatePrice,
            currency: 'inr',
            status: 'pending'
        });

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `${course.title} - Certificate`,
                        description: 'Course Completion Certificate',
                    },
                    unit_amount: course.certificatePrice,
                },
                quantity: 1,
            }, ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/dashboard/certificates?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/certificates?canceled=true`,
            metadata: {
                userId: userId,
                courseId: courseId,
                paymentId: payment._id.toString()
            }
        });

        // Update payment with session ID
        payment.stripeSessionId = session.id;
        await payment.save();

        res.status(200).json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            }
        });
    } catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating checkout session'
        });
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async(req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;

            // Update payment status
            await Payment.findOneAndUpdate({ stripeSessionId: session.id }, {
                status: 'completed',
                stripePaymentIntentId: session.payment_intent,
                paidAt: new Date()
            });

            break;

        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;

            await Payment.findOneAndUpdate({ stripePaymentIntentId: failedIntent.id }, { status: 'failed' });

            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

// @desc    Bypass payment for testing
// @route   POST /api/payments/bypass/:courseId
// @access  Private
exports.bypassPayment = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Only allow in development mode
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'Bypass payment only available in development mode'
            });
        }

        // Get course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
            userId,
            courseId,
            status: 'completed'
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Payment already completed for this course'
            });
        }

        // Create bypassed payment record
        const payment = await Payment.create({
            userId,
            courseId,
            amount: course.certificatePrice,
            currency: 'inr',
            status: 'completed',
            bypassedForTesting: true,
            paidAt: new Date(),
            paymentMethod: 'bypass'
        });

        res.status(200).json({
            success: true,
            message: 'Payment bypassed for testing',
            data: payment
        });
    } catch (error) {
        console.error('Bypass payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while bypassing payment'
        });
    }
};

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async(req, res) => {
    try {
        const userId = req.user.id;

        const payments = await Payment.find({ userId })
            .populate('courseId', 'title thumbnail')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching payment history'
        });
    }
};