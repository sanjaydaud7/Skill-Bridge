const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
        required: true
    },
    enrollmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment'
    },
    earnedAt: {
        type: Date,
        default: Date.now
    },
    earnedFrom: {
        type: String,
        enum: ['task-submission', 'assessment', 'streak', 'engagement', 'manual-award'],
        required: true
    },
    earnedFromId: mongoose.Schema.Types.ObjectId // Reference to task, assessment, etc.
}, {
    timestamps: true
});

// Compound index to prevent duplicate badge awards
studentBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
studentBadgeSchema.index({ userId: 1, earnedAt: -1 });

module.exports = mongoose.model('StudentBadge', studentBadgeSchema);