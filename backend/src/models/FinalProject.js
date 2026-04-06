const mongoose = require('mongoose');

const finalProjectSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true,
        unique: true
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
    requirements: [{
        type: String,
        trim: true
    }],
    submissionGuidelines: {
        type: String,
        required: [true, 'Submission guidelines are required']
    },
    technicalRequirements: [{
        type: String,
        trim: true
    }],
    evaluationCriteria: [{
        criterion: String,
        weightage: Number,
        description: String
    }],
    sampleProjects: [{
        title: String,
        url: String,
        description: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

finalProjectSchema.index({ courseId: 1 });

module.exports = mongoose.model('FinalProject', finalProjectSchema);