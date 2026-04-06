const mongoose = require('mongoose');

const rewardPointsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    availablePoints: {
        type: Number,
        default: 0,
        min: 0
    },
    pointsHistory: [{
        amount: Number,
        source: {
            type: String,
            enum: ['task-completion', 'assessment-pass', 'badge-earned', 'streak-bonus', 'milestone-achieved', 'referral', 'manual-award', 'redemption'],
            required: true
        },
        sourceId: mongoose.Schema.Types.ObjectId,
        description: String,
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        default: 'bronze'
    },
    tierProgression: {
        bronze: { min: 0, badge: 'Bronze Member', discount: 5 },
        silver: { min: 500, badge: 'Silver Member', discount: 10 },
        gold: { min: 1500, badge: 'Gold Member', discount: 15 },
        platinum: { min: 3000, badge: 'Platinum Member', discount: 20 },
        diamond: { min: 5000, badge: 'Diamond Member', discount: 25 }
    },
    rewardsRedeemed: [{
        rewardId: mongoose.Schema.Types.ObjectId,
        pointsSpent: Number,
        redeemedAt: Date,
        reward: String
    }],
    lastPointsEarned: Date
}, {
    timestamps: true
});

rewardPointsSchema.index({ userId: 1 });
rewardPointsSchema.index({ totalPoints: -1 });
rewardPointsSchema.index({ tier: 1 });

module.exports = mongoose.model('RewardPoints', rewardPointsSchema);