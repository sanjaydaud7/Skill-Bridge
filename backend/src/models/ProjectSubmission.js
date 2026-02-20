const mongoose = require('mongoose');

const projectSubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinalProject',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    repositoryUrl: {
        type: String,
        required: [true, 'Repository URL is required']
    },
    liveUrl: {
        type: String
    },
    documentation: {
        type: String,
        maxlength: [10000, 'Documentation cannot exceed 10000 characters']
    },
    technologiesUsed: [{
        type: String,
        trim: true
    }],
    screenshots: [{
        type: String
    }],
    videoDemo: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision-requested'],
        default: 'pending'
    },
    mentorFeedback: {
        type: String,
        maxlength: [3000, 'Feedback cannot exceed 3000 characters']
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C', ''],
        default: ''
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attemptNumber: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Compound index
projectSubmissionSchema.index({ userId: 1, courseId: 1 });
projectSubmissionSchema.index({ courseId: 1, status: 1 });
projectSubmissionSchema.index({ reviewedBy: 1, status: 1 });

module.exports = mongoose.model('ProjectSubmission', projectSubmissionSchema);