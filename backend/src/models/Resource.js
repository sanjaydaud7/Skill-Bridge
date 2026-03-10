const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    type: {
        type: String,
        enum: ['pdf', 'image', 'document', 'video', 'link', 'other'],
        required: true
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL or link is required']
    },
    publicId: {
        // Cloudinary public_id — used for deletion. Null for external links.
        type: String,
        default: null
    },
    // null = global resource (available to all enrolled students)
    // ObjectId = scoped to a specific internship
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileSize: {
        type: Number,  // bytes
        default: 0
    },
    mimeType: {
        type: String,
        default: ''
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

resourceSchema.index({ internshipId: 1, isActive: 1 });
resourceSchema.index({ type: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
