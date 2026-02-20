const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'create', 'update', 'delete', 'approve', 'reject',
            'revoke', 'restore', 'enroll', 'unenroll', 'refund',
            'manual_certificate', 'manual_payment', 'status_change'
        ]
    },
    targetModel: {
        type: String,
        required: true,
        enum: [
            'Course', 'Module', 'Task', 'FinalProject', 'User',
            'Enrollment', 'TaskSubmission', 'ProjectSubmission',
            'Certificate', 'Payment'
        ]
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    changes: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    description: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes
adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ targetModel: 1, targetId: 1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ createdAt: -1 });

// Static method to create log entry
adminLogSchema.statics.createLog = async function(logData) {
    try {
        return await this.create(logData);
    } catch (error) {
        console.error('Error creating admin log:', error);
    }
};

module.exports = mongoose.model('AdminLog', adminLogSchema);