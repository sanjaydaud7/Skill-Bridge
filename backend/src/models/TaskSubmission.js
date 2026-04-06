const mongoose = require('mongoose');

const taskSubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    fileUrl: {
        type: String
    },
    linkUrl: {
        type: String
    },
    codeSnippet: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision-requested'],
        default: 'pending'
    },
    mentorFeedback: {
        type: String,
        maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },
    points: {
        type: Number,
        default: 0,
        min: 0
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

// Compound index for user and task
taskSubmissionSchema.index({ userId: 1, taskId: 1, attemptNumber: 1 });
taskSubmissionSchema.index({ courseId: 1, status: 1 });
taskSubmissionSchema.index({ reviewedBy: 1, status: 1 });

module.exports = mongoose.model('TaskSubmission', taskSubmissionSchema);