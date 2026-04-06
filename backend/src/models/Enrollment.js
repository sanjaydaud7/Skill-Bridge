const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['enrolled', 'in-progress', 'completed', 'certificate-purchased', 'dropped'],
        default: 'enrolled'
    },
    progress: {
        videosCompleted: [{
            moduleId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Module'
            },
            completedAt: {
                type: Date,
                default: Date.now
            }
        }],
        tasksCompleted: [{
            taskId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Task'
            },
            completedAt: {
                type: Date,
                default: Date.now
            }
        }],
        projectSubmitted: {
            type: Boolean,
            default: false
        },
        projectApproved: {
            type: Boolean,
            default: false
        },
        completionPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    certificateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    },
    currentModuleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });

// Method to check if video is completed
enrollmentSchema.methods.isVideoCompleted = function(moduleId) {
    return this.progress.videosCompleted.some(
        video => video.moduleId.toString() === moduleId.toString()
    );
};

// Method to check if task is completed
enrollmentSchema.methods.isTaskCompleted = function(taskId) {
    return this.progress.tasksCompleted.some(
        task => task.taskId.toString() === taskId.toString()
    );
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);