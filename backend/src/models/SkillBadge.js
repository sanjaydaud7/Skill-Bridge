const mongoose = require('mongoose');

const skillBadgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skill: {
        type: String,
        required: [true, 'Skill name is required'],
        enum: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'SQL', 'HTML/CSS', 'TypeScript', 'Express.js', 'Leadership', 'Communication', 'Problem-Solving', 'Time-Management'],
        trim: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner'
    },
    assessmentsPassed: [{
        assessmentId: mongoose.Schema.Types.ObjectId,
        score: Number,
        passedAt: Date
    }],
    tasksCompleted: {
        type: Number,
        default: 0
    },
    projectsCompleted: {
        type: Number,
        default: 0
    },
    proficiencyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin who verified
    },
    verifiedAt: Date,
    icon: String,
    endorsements: {
        type: Number,
        default: 0
    },
    endorsedBy: [mongoose.Schema.Types.ObjectId], // List of users who endorsed
    estimatedProficiency: {
        type: String,
        enum: ['low', 'moderate', 'high', 'expert'],
        default: 'low'
    }
}, {
    timestamps: true
});

skillBadgeSchema.index({ userId: 1, skill: 1 }, { unique: true });
skillBadgeSchema.index({ skill: 1, level: 1 });
skillBadgeSchema.index({ proficiencyScore: -1 });

module.exports = mongoose.model('SkillBadge', skillBadgeSchema);