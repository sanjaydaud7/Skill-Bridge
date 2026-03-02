const Task = require('../models/Task');
const TaskSubmission = require('../models/TaskSubmission');
const Enrollment = require('../models/Enrollment');

// @desc    Get all tasks for a course
// @route   GET /api/tasks/:courseId
// @access  Private
exports.getCourseTasks = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Check enrollment
        const enrollment = await Enrollment.findOne({
            userId,
            courseId
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled in this internship'
            });
        }

        const tasks = await Task.find({ courseId, isActive: true })
            .sort({ order: 1 });

        // Get user's submissions for these tasks
        const submissions = await TaskSubmission.find({
            userId,
            courseId,
            taskId: { $in: tasks.map(t => t._id) }
        }).sort({ attemptNumber: -1 });

        // Combine tasks with submission status
        const tasksWithStatus = tasks.map(task => {
            const submission = submissions.find(
                s => s.taskId.toString() === task._id.toString()
            );

            return {
                ...task.toObject(),
                submissionStatus: submission ? submission.status : 'not-submitted',
                lastSubmission: submission || null
            };
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasksWithStatus
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tasks'
        });
    }
};

// @desc    Get single task details
// @route   GET /api/tasks/:courseId/:taskId
// @access  Private
exports.getTaskById = async(req, res) => {
    try {
        const { courseId, taskId } = req.params;
        const userId = req.user.id;

        // Check enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled in this internship'
            });
        }

        const task = await Task.findById(taskId);
        if (!task || task.courseId.toString() !== courseId) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Get user's submissions for this task
        const submissions = await TaskSubmission.find({
            userId,
            taskId
        }).sort({ attemptNumber: -1 });

        res.status(200).json({
            success: true,
            data: {
                task,
                submissions
            }
        });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching task'
        });
    }
};

// @desc    Submit task
// @route   POST /api/tasks/:courseId/:taskId/submit
// @access  Private
exports.submitTask = async(req, res) => {
    try {
        const { courseId, taskId } = req.params;
        const userId = req.user.id;
        const { content, linkUrl, codeSnippet } = req.body;

        // Check enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled in this internship'
            });
        }

        // Check if task exists
        const task = await Task.findById(taskId);
        if (!task || task.courseId.toString() !== courseId) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Get previous submissions count
        const previousSubmissions = await TaskSubmission.countDocuments({
            userId,
            taskId
        });

        // Create submission
        const submission = await TaskSubmission.create({
            userId,
            taskId,
            courseId,
            content,
            linkUrl,
            codeSnippet,
            fileUrl: req.file ? req.file.path : null,
            attemptNumber: previousSubmissions + 1,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Task submitted successfully',
            data: submission
        });
    } catch (error) {
        console.error('Submit task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting task'
        });
    }
};

// @desc    Get user's submissions for a course
// @route   GET /api/tasks/:courseId/submissions
// @access  Private
exports.getUserSubmissions = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const submissions = await TaskSubmission.find({
                userId,
                courseId
            })
            .populate('taskId')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions
        });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching submissions'
        });
    }
};
