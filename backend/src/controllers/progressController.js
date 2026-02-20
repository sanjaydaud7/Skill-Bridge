const Enrollment = require('../models/Enrollment');
const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Get user's progress for a course
// @route   GET /api/progress/:courseId
// @access  Private
exports.getCourseProgress = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const enrollment = await Enrollment.findOne({ userId, courseId })
            .populate('currentModuleId');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Get total modules and tasks
        const totalModules = await Module.countDocuments({ courseId, isActive: true });
        const Task = require('../models/Task');
        const totalTasks = await Task.countDocuments({ courseId, isActive: true });

        const completedVideos = enrollment.progress.videosCompleted.length;
        const completedTasks = enrollment.progress.tasksCompleted.length;

        // Calculate completion percentage
        const totalItems = totalModules + totalTasks + 1; // +1 for project
        let completedItems = completedVideos + completedTasks;
        if (enrollment.progress.projectApproved) completedItems += 1;

        const completionPercentage = totalItems > 0 ?
            Math.round((completedItems / totalItems) * 100) :
            0;

        // Update completion percentage
        enrollment.progress.completionPercentage = completionPercentage;
        await enrollment.save();

        res.status(200).json({
            success: true,
            data: {
                enrollment,
                stats: {
                    totalModules,
                    completedVideos,
                    totalTasks,
                    completedTasks,
                    projectSubmitted: enrollment.progress.projectSubmitted,
                    projectApproved: enrollment.progress.projectApproved,
                    completionPercentage
                }
            }
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching progress'
        });
    }
};

// @desc    Mark video as completed
// @route   POST /api/progress/:courseId/video/:moduleId
// @access  Private
exports.markVideoCompleted = async(req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const userId = req.user.id;

        const enrollment = await Enrollment.findOne({ userId, courseId });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Check if module exists
        const module = await Module.findById(moduleId);
        if (!module || module.courseId.toString() !== courseId) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        // Check if already completed
        const alreadyCompleted = enrollment.progress.videosCompleted.some(
            v => v.moduleId.toString() === moduleId
        );

        if (alreadyCompleted) {
            return res.status(200).json({
                success: true,
                message: 'Video already marked as completed'
            });
        }

        // Add to completed videos
        enrollment.progress.videosCompleted.push({
            moduleId,
            completedAt: new Date()
        });

        // Update status to in-progress if still enrolled
        if (enrollment.status === 'enrolled') {
            enrollment.status = 'in-progress';
        }

        // Find next module
        const nextModule = await Module.findOne({
            courseId,
            order: { $gt: module.order },
            isActive: true
        }).sort({ order: 1 });

        if (nextModule) {
            enrollment.currentModuleId = nextModule._id;
        }

        enrollment.lastAccessedAt = new Date();
        await enrollment.save();

        res.status(200).json({
            success: true,
            message: 'Video marked as completed',
            data: enrollment
        });
    } catch (error) {
        console.error('Mark video completed error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating progress'
        });
    }
};

// @desc    Get course statistics
// @route   GET /api/progress/stats
// @access  Private
exports.getUserStats = async(req, res) => {
    try {
        const userId = req.user.id;

        const enrollments = await Enrollment.find({ userId });

        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter(e => e.status === 'completed').length;
        const inProgressCourses = enrollments.filter(e => e.status === 'in-progress').length;
        const certificatesEarned = enrollments.filter(e => e.certificateId).length;

        // Calculate average completion
        const avgCompletion = enrollments.length > 0 ?
            enrollments.reduce((acc, e) => acc + e.progress.completionPercentage, 0) / enrollments.length :
            0;

        res.status(200).json({
            success: true,
            data: {
                totalCourses,
                completedCourses,
                inProgressCourses,
                certificatesEarned,
                averageCompletion: Math.round(avgCompletion)
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
};