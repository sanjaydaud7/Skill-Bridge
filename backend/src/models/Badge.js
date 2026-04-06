const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Badge name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Badge name cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    icon: {
        type: String, // URL to badge icon/image
        required: true
    },
    category: {
        type: String,
        enum: ['skill', 'achievement', 'milestone', 'engagement', 'performance', 'streak'],
        default: 'achievement'
    },
    condition: {
        type: String,
        enum: ['task-completion', 'assessment-pass', 'streak-achievement', 'enrollment-milestone', 'skill-mastery', 'custom'],
        required: true
    },
    requiredValue: {
        type: Number,
        default: 1,
        description: 'Value required to unlock (e.g., 5 for 5-day streak)'
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'uncommon'
    },
    points: {
        type: Number,
        default: 10 // Reward points for earning this badge
    },
    relatedSkill: String,
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

badgeSchema.index({ category: 1, condition: 1 });
badgeSchema.index({ relatedSkill: 1 });

module.exports = mongoose.model('Badge', badgeSchema);