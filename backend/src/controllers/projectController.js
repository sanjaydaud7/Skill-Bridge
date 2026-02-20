const FinalProject = require('../models/FinalProject');
const ProjectSubmission = require('../models/ProjectSubmission');
const Enrollment = require('../models/Enrollment');

// @desc    Get project details for a course
// @route   GET /api/projects/:courseId
// @access  Private
exports.getProjectDetails = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Check enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        const project = await FinalProject.findOne({ courseId, isActive: true });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found for this course'
            });
        }

        // Get user's submission if exists
        const submission = await ProjectSubmission.findOne({
            userId,
            courseId
        }).sort({ attemptNumber: -1 });

        res.status(200).json({
            success: true,
            data: {
                project,
                submission: submission || null
            }
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching project'
        });
    }
};

// @desc    Submit final project
// @route   POST /api/projects/:courseId/submit
// @access  Private
exports.submitProject = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const {
            title,
            description,
            repositoryUrl,
            liveUrl,
            documentation,
            technologiesUsed,
            videoDemo
        } = req.body;

        // Check enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        // Get project
        const project = await FinalProject.findOne({ courseId, isActive: true });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check for previous submissions
        const previousSubmissions = await ProjectSubmission.countDocuments({
            userId,
            courseId
        });

        // Create submission
        const submission = await ProjectSubmission.create({
            userId,
            projectId: project._id,
            courseId,
            title,
            description,
            repositoryUrl,
            liveUrl,
            documentation,
            technologiesUsed: technologiesUsed || [],
            videoDemo,
            screenshots: req.files ? req.files.map(f => f.path) : [],
            attemptNumber: previousSubmissions + 1,
            status: 'pending'
        });

        // Update enrollment
        enrollment.progress.projectSubmitted = true;
        enrollment.lastAccessedAt = new Date();
        await enrollment.save();

        res.status(201).json({
            success: true,
            message: 'Project submitted successfully',
            data: submission
        });
    } catch (error) {
        console.error('Submit project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting project'
        });
    }
};

// @desc    Get user's project submission status
// @route   GET /api/projects/:courseId/submission
// @access  Private
exports.getSubmissionStatus = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const submissions = await ProjectSubmission.find({
                userId,
                courseId
            })
            .populate('projectId')
            .sort({ attemptNumber: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions
        });
    } catch (error) {
        console.error('Get submission status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching submission status'
        });
    }
};