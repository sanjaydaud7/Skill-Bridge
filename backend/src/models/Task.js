const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    taskNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Task description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    instructions: {
        type: String,
        required: [true, 'Task instructions are required']
    },
    requiredModuleNumber: {
        type: Number,
        default: 0,
        comment: 'Module number that must be completed before this task'
    },
    maxPoints: {
        type: Number,
        default: 100
    },
    submissionType: {
        type: String,
        enum: ['text', 'file', 'link', 'code', 'mixed'],
        default: 'mixed'
    },
    allowedFileTypes: [{
        type: String
    }],
    maxFileSize: {
        type: Number,
        default: 10485760 // 10MB in bytes
    },
    order: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dueDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index
taskSchema.index({ courseId: 1, order: 1 });
taskSchema.index({ courseId: 1, taskNumber: 1 });

module.exports = mongoose.model('Task', taskSchema);