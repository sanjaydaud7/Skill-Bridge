const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Internship title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Internship description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    category: {
        type: String,
        required: true,
        enum: ['technology', 'design', 'marketing', 'business', 'data-science'],
        default: 'technology'
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 week']
    },
    thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/400x300'
    },
    skills: [{
        type: String,
        trim: true
    }],
    learningOutcomes: [{
        type: String,
        trim: true
    }],
    prerequisites: [{
        type: String,
        trim: true
    }],
    totalModules: {
        type: Number,
        default: 0
    },
    totalTasks: {
        type: Number,
        default: 0
    },
    certificatePrice: {
        type: Number,
        default: 49900 // in paise (₹499)
    },
    isActive: {
        type: Boolean,
        default: true
    },
    enrollmentCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Create index for search
internshipSchema.index({ title: 'text', description: 'text' });
internshipSchema.index({ category: 1, difficulty: 1 });
internshipSchema.index({ isActive: 1 });

module.exports = mongoose.model('Course', internshipSchema);