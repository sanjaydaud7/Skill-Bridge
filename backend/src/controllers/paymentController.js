const Payment = require('../models/Payment');
const Internship = require('../models/Internship');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to auto-generate certificate after payment
const autoGenerateCertificate = async(userId, courseId, paymentId, enrollmentId) => {
    try {
        console.log('🎓 Auto-generating certificate for:', { userId, courseId, paymentId, enrollmentId });

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({ userId, courseId });
        if (existingCertificate) {
            console.log('✅ Certificate already exists:', existingCertificate._id);
            return existingCertificate;
        }

        // Get course for details
        const course = await Internship.findById(courseId);

        // Create certificate
        const certificate = await Certificate.create({
            userId,
            courseId,
            enrollmentId,
            paymentId,
            grade: 'A',
            skills: course ? .skills || []
        });

        console.log('🎉 Certificate created:', certificate._id, certificate.certificateNumber);

        // Update enrollment
        await Enrollment.findByIdAndUpdate(enrollmentId, {
            status: 'certificate-purchased',
            certificateId: certificate._id,
            completedAt: new Date()
        });

        console.log('✅ Enrollment updated');

        // Set placeholder PDF URL
        certificate.pdfUrl = `https://certificates.skillbridge.com/${certificate.certificateNumber}.pdf`;
        await certificate.save();

        console.log('🎓 Certificate auto-generated successfully:', certificate._id);
        return certificate;
    } catch (error) {
        console.error('❌ Auto-generate certificate error:', error.message);
        console.error('Full error stack:', error.stack);
        return null;
    }
};

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout
// @access  Private
exports.createCheckoutSession = async(req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        // Get course
        const course = await Internship.findById(courseId);
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
                message: 'Not enrolled in this internship'
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
            userId,
            courseId,
            status: 'completed'
        });

        if (existingPayment) {
            // Check if certificate already exists
            const existingCertificate = await Certificate.findOne({ userId, courseId });

            if (existingCertificate) {
                // Payment and certificate both exist
                return res.status(400).json({
                    success: false,
                    message: 'Certificate already issued for this course',
                    certificateExists: true
                });
            } else {
                // Payment exists but no certificate - auto-generate it
                console.log('Payment exists but no certificate, auto-generating...');
                const certificate = await autoGenerateCertificate(
                    userId,
                    courseId,
                    existingPayment._id,
                    enrollment._id
                );

                if (certificate) {
                    return res.status(200).json({
                        success: true,
                        message: 'Certificate generated successfully from existing payment',
                        data: { certificate }
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to generate certificate'
                    });
                }
            }
        }

        // Create payment record
        const payment = await Payment.create({
            userId,
            courseId,
            amount: Internship.certificatePrice,
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
                        name: `${Internship.title} - Certificate`,
                        description: 'Course Completion Certificate',
                    },
                    unit_amount: Internship.certificatePrice,
                },
                quantity: 1,
            }, ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/dashboard/certificates?success=true&courseId=${courseId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/certificates?canceled=true&courseId=${courseId}`,
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
            console.log('💳 Stripe checkout completed:', session.id);

            // Update payment status
            const payment = await Payment.findOneAndUpdate({ stripeSessionId: session.id }, {
                status: 'completed',
                stripePaymentIntentId: session.payment_intent,
                paidAt: new Date()
            }, { new: true });

            if (!payment) {
                console.error('❌ Payment not found for session:', session.id);
            } else {
                console.log('✅ Payment updated:', payment._id);

                // Auto-generate certificate
                const enrollment = await Enrollment.findOne({
                    userId: payment.userId,
                    courseId: payment.courseId
                });

                if (enrollment) {
                    console.log('🎓 Generating certificate for completed payment');
                    const certificate = await autoGenerateCertificate(
                        payment.userId,
                        payment.courseId,
                        payment._id,
                        enrollment._id
                    );

                    if (certificate) {
                        console.log('🎉 Certificate unlocked:', certificate._id);
                    } else {
                        console.error('❌ Failed to generate certificate');
                    }
                } else {
                    console.error('❌ Enrollment not found for payment:', payment._id);
                }
            }

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
        const course = await Internship.findById(courseId);
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
                message: 'Not enrolled in this internship'
            });
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({ userId, courseId });

        if (existingCertificate) {
            return res.status(400).json({
                success: false,
                message: 'Certificate already issued for this course',
                alreadyIssued: true
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
            userId,
            courseId,
            status: 'completed'
        });

        if (existingPayment) {
            // Payment exists but no certificate - auto-generate it
            console.log('Payment exists but no certificate, auto-generating...');
            const certificate = await autoGenerateCertificate(
                userId,
                courseId,
                existingPayment._id,
                enrollment._id
            );

            if (certificate) {
                return res.status(200).json({
                    success: true,
                    message: 'Certificate generated from existing payment!',
                    data: {
                        payment: existingPayment,
                        certificate
                    }
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate certificate'
                });
            }
        }

        // Create bypassed payment record
        const payment = await Payment.create({
            userId,
            courseId,
            amount: course.certificatePrice || 499,
            currency: 'inr',
            status: 'completed',
            bypassedForTesting: true,
            paidAt: new Date(),
            paymentMethod: 'bypass'
        });

        console.log('✅ Payment bypassed:', payment._id);

        // Auto-generate certificate
        const certificate = await autoGenerateCertificate(userId, courseId, payment._id, enrollment._id);

        if (certificate) {
            console.log('🎉 Certificate unlocked after bypass payment:', certificate._id);
            res.status(200).json({
                success: true,
                message: 'Payment bypassed and certificate unlocked!',
                data: {
                    payment,
                    certificate
                }
            });
        } else {
            console.error('❌ Failed to generate certificate after bypass');
            res.status(500).json({
                success: false,
                message: 'Payment was recorded but certificate generation failed. Please contact support.',
                paymentId: payment._id
            });
        }
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