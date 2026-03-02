const Enrollment = require('../models/Enrollment');
const Module = require('../models/Module');
const Internship = require('../models/Internship');

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

        const totalInternships = enrollments.length;
        const completedInternships = enrollments.filter(e => e.status === 'completed').length;
        const inProgressInternships = enrollments.filter(e => e.status === 'in-progress').length;
        const certificatesEarned = enrollments.filter(e => e.certificateId).length;

        // Calculate average completion
        const avgCompletion = enrollments.length > 0 ?
            enrollments.reduce((acc, e) => acc + e.progress.completionPercentage, 0) / enrollments.length :
            0;

        res.status(200).json({
            success: true,
            data: {
                totalInternships,
                completedInternships,
                inProgressInternships,
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

// @desc    Bypass completion - Mark all course requirements as complete (TESTING ONLY)
// @route   POST /api/progress/:courseId/bypass-complete
// @access  Private
exports.bypassCompleteAll = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        console.log('Bypass completion started for courseId:', courseId, 'userId:', userId);

        const enrollment = await Enrollment.findOne({ userId, courseId });

        if (!enrollment) {
            console.log('Enrollment not found');
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        console.log('Enrollment found:', enrollment._id);

        // Get all modules
        const modules = await Module.find({ courseId });
        console.log('Modules found:', modules.length);

        // Get all tasks
        const Task = require('../models/Task');
        const tasks = await Task.find({ courseId });
        console.log('Tasks found:', tasks.length);

        let videosCompleted = 0;
        let tasksCompleted = 0;

        // Mark all videos as completed
        for (const module of modules) {
            const alreadyCompleted = enrollment.progress.videosCompleted.some(
                v => v.moduleId.toString() === module._id.toString()
            );

            if (!alreadyCompleted) {
                enrollment.progress.videosCompleted.push({
                    moduleId: module._id,
                    completedAt: new Date()
                });
                videosCompleted++;
            }
        }

        console.log('Videos marked as completed:', videosCompleted);

        // Mark all tasks as completed
        for (const task of tasks) {
            const alreadyCompleted = enrollment.progress.tasksCompleted.some(
                t => t.taskId.toString() === task._id.toString()
            );

            if (!alreadyCompleted) {
                enrollment.progress.tasksCompleted.push({
                    taskId: task._id,
                    completedAt: new Date()
                });
                tasksCompleted++;
            }
        }

        console.log('Tasks marked as completed:', tasksCompleted);

        // Mark project as submitted and approved
        enrollment.progress.projectSubmitted = true;
        enrollment.progress.projectApproved = true;

        // Update status
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();

        // Set completion percentage to 100%
        enrollment.progress.completionPercentage = 100;

        enrollment.lastAccessedAt = new Date();

        console.log('Saving enrollment...');
        await enrollment.save();
        console.log('Enrollment saved successfully');

        res.status(200).json({
            success: true,
            message: 'All course requirements marked as complete',
            data: {
                videosCompleted,
                tasksCompleted,
                projectApproved: true,
                completionPercentage: 100,
                enrollment
            }
        });
    } catch (error) {
        console.error('Bypass complete all error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error while bypassing completion',
            error: error.message
        });
    }
};