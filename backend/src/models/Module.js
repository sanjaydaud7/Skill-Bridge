const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    moduleNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: [true, 'Module title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    videoUrl: {
        type: String
    },
    videoType: {
        type: String,
        enum: ['cloudinary', 'youtube', 'vimeo', 'external'],
        default: 'youtube'
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    videos: [{
        title: {
            type: String,
            required: true
        },
        videoUrl: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        videoType: {
            type: String,
            enum: ['cloudinary', 'youtube', 'vimeo', 'external'],
            default: 'youtube'
        }
    }],
    order: {
        type: Number,
        required: true,
        default: 0
    },
    resources: [{
        title: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['pdf', 'link', 'code', 'document', 'other'],
            default: 'link'
        }
    }],
    isPreview: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for course and order
moduleSchema.index({ courseId: 1, order: 1 });
moduleSchema.index({ courseId: 1, moduleNumber: 1 });

module.exports = mongoose.model('Module', moduleSchema);