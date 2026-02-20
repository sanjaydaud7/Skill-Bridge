const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'inr',
        enum: ['inr', 'usd', 'eur']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    stripePaymentIntentId: {
        type: String
    },
    stripeSessionId: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    paidAt: {
        type: Date
    },
    refundedAt: {
        type: Date
    },
    refundReason: {
        type: String
    },
    bypassedForTesting: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeSessionId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);