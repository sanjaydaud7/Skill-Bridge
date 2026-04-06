const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    enrollmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
        required: true
    },
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Milestone title is required'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: String,
    order: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['module-completion', 'task-completion', 'assessment-pass', 'project-completion', 'skill-unlock'],
        required: true
    },
    requirements: {
        tasksToComplete: Number,
        assessmentPassScore: Number,
        modulesToComplete: Number,
        projectsToComplete: Number
    },
    rewardPoints: {
        type: Number,
        default: 50
    },
    badgeReward: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    roadmapOrder: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

milestoneSchema.index({ enrollmentId: 1, roadmapOrder: 1 });
milestoneSchema.index({ internshipId: 1, type: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);