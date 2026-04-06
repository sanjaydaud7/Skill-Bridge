const mongoose = require('mongoose');

const skillAssessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Assessment title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    skillCategory: {
        type: String,
        required: true,
        enum: ['frontend', 'backend', 'fullstack', 'devops', 'design', 'data-science', 'mobile', 'general'],
        default: 'general'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
    },
    questions: [{
        questionText: {
            type: String,
            required: true
        },
        questionType: {
            type: String,
            enum: ['multiple-choice', 'true-false', 'short-answer', 'coding'],
            default: 'multiple-choice'
        },
        options: [{
            text: String,
            isCorrect: Boolean
        }],
        correctAnswer: String,
        points: {
            type: Number,
            default: 1
        },
        explanation: String
    }],
    passingScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100
    },
    timeLimit: {
        type: Number,
        default: 30 // minutes
    },
    totalPoints: {
        type: Number,
        required: true
    },
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    availableAfterModule: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

skillAssessmentSchema.index({ internshipId: 1, skillCategory: 1 });
skillAssessmentSchema.index({ skillCategory: 1, difficulty: 1 });

module.exports = mongoose.model('SkillAssessment', skillAssessmentSchema);