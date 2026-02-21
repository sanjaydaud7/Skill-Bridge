const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
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
    enrollmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
        required: true
    },
    certificateNumber: {
        type: String,
        required: true,
        unique: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    pdfUrl: {
        type: String
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C', ''],
        default: ''
    },
    skills: [{
        type: String,
        trim: true
    }],
    verificationCode: {
        type: String,
        required: true,
        unique: true
    },
    isValid: {
        type: Boolean,
        default: true
    },
    revokedAt: {
        type: Date
    },
    revokedReason: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for backward compatibility
certificateSchema.virtual('issuedDate').get(function() {
    return this.issuedAt;
});

// Generate certificate number before saving
certificateSchema.pre('save', function(next) {
    if (!this.certificateNumber) {
        const year = new Date().getFullYear();
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        this.certificateNumber = `SB-${year}-${random}`;
    }

    if (!this.verificationCode) {
        this.verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    }

    next();
});

// Indexes
certificateSchema.index({ userId: 1, courseId: 1 });
// Removed duplicate indexes for certificateNumber and verificationCode

module.exports = mongoose.model('Certificate', certificateSchema);