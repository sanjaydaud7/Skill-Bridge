const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrollmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
        required: true
    },
    streakType: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'daily'
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActivityDate: {
        type: Date,
        default: Date.now
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    totalDaysActive: {
        type: Number,
        default: 0
    },
    activityLog: [{
        date: Date,
        activity: String,
        points: Number
    }],
    milestones: [{
        daysCompleted: Number,
        rewardPoints: Number,
        badgeId: mongoose.Schema.Types.ObjectId,
        achieved: Boolean,
        achievedAt: Date
    }]
}, {
    timestamps: true
});

streakSchema.index({ userId: 1, enrollmentId: 1 });
streakSchema.index({ userId: 1, currentStreak: -1 });

module.exports = mongoose.model('Streak', streakSchema);