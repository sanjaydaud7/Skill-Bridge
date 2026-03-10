const TaskSubmission = require('../../models/TaskSubmission');
const ProjectSubmission = require('../../models/ProjectSubmission');
const Task = require('../../models/Task');
const FinalProject = require('../../models/FinalProject');
const Internship = require('../../models/Internship');
const User = require('../../models/User');
const Enrollment = require('../../models/Enrollment');
const AdminLog = require('../../models/AdminLog');
const { createNotification } = require('../notificationController');
const { sendEmail } = require('../../utils/emailService');

// @desc    Get all task submissions
// @route   GET /api/admin/submissions/tasks
// @access  Private/Admin
exports.getTaskSubmissions = async(req, res) => {
    try {
        const { status, courseId, studentId, page = 1, limit = 10, sort = 'oldest' } = req.query;

        const query = {};
        if (status) query.status = status;
        if (courseId) query.courseId = courseId;
        if (studentId) query.userId = studentId;

        const sortQuery = sort === 'oldest' ? { submittedAt: 1 } : { submittedAt: -1 };
        const skip = (page - 1) * limit;

        const submissions = await TaskSubmission.find(query)
            .populate('userId', 'name email profilePicture')
            .populate('taskId', 'title maxPoints')
            .populate('courseId', 'title')
            .populate('reviewedBy', 'name')
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await TaskSubmission.countDocuments(query);

        res.json({
            success: true,
            data: submissions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching task submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching task submissions',
            error: error.message
        });
    }
};

// @desc    Get single task submission
// @route   GET /api/admin/submissions/tasks/:id
// @access  Private/Admin
exports.getTaskSubmission = async(req, res) => {
    try {
        const submission = await TaskSubmission.findById(req.params.id)
            .populate('userId', 'name email profilePicture')
            .populate('taskId')
            .populate('courseId', 'title')
            .populate('reviewedBy', 'name');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Get previous submissions
        const previousSubmissions = await TaskSubmission.find({
            userId: submission.userId,
            taskId: submission.taskId,
            attemptNumber: { $lt: submission.attemptNumber }
        }).sort({ attemptNumber: -1 }).limit(5);

        res.json({
            success: true,
            data: {
                submission,
                previousSubmissions
            }
        });
    } catch (error) {
        console.error('Error fetching task submission:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching task submission',
            error: error.message
        });
    }
};

// @desc    Review task submission
// @route   PUT /api/admin/submissions/tasks/:id/review
// @access  Private/Admin
exports.reviewTaskSubmission = async(req, res) => {
    try {
        const { status, feedback, points } = req.body;

        const submission = await TaskSubmission.findById(req.params.id)
            .populate('taskId')
            .populate('userId')
            .populate('courseId');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Validate status
        if (!['approved', 'rejected', 'revision-requested'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Validate points
        if (points !== undefined) {
            if (points < 0 || points > submission.taskId.maxPoints) {
                return res.status(400).json({
                    success: false,
                    message: `Points must be between 0 and ${submission.taskId.maxPoints}`
                });
            }
        }

        // Require feedback for rejection
        if (status === 'rejected' && !feedback) {
            return res.status(400).json({
                success: false,
                message: 'Feedback is required for rejection'
            });
        }

        submission.status = status;
        submission.mentorFeedback = feedback || submission.mentorFeedback;
        submission.points = points !== undefined ? points : submission.points;
        submission.reviewedAt = Date.now();
        submission.reviewedBy = req.user._id;

        await submission.save();

        // Update enrollment if approved
        if (status === 'approved') {
            const enrollment = await Enrollment.findOne({
                userId: submission.userId._id,
                courseId: submission.courseId._id
            });

            if (enrollment) {
                const taskCompleted = enrollment.progress.tasksCompleted.find(
                    t => t.taskId.toString() === submission.taskId._id.toString()
                );

                if (!taskCompleted) {
                    enrollment.progress.tasksCompleted.push({
                        taskId: submission.taskId._id,
                        completedAt: Date.now(),
                        score: points
                    });

                    // Recalculate completion percentage
                    const totalItems = enrollment.progress.videosCompleted.length +
                        enrollment.progress.tasksCompleted.length +
                        (enrollment.progress.projectApproved ? 1 : 0);
                    const totalRequired = submission.courseId.totalModules +
                        submission.courseId.totalTasks + 1;

                    enrollment.progress.completionPercentage = Math.round((totalItems / totalRequired) * 100);

                    // Update status
                    if (enrollment.status === 'enrolled') {
                        enrollment.status = 'in-progress';
                    }

                    await enrollment.save();
                }
            }
        }

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: status === 'approved' ? 'approve' : 'reject',
            targetModel: 'TaskSubmission',
            targetId: submission._id,
            description: `Reviewed task submission: ${submission.taskId.title} by ${submission.userId.name}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        // Notify student via Socket.io + Email
        const studentId = submission.userId._id;
        const studentEmail = submission.userId.email;
        const studentName = submission.userId.name;
        const taskTitle = submission.taskId.title;
        const internshipTitle = submission.courseId?.title || 'your internship';

        if (status === 'approved') {
            createNotification({
                userId: studentId,
                type: 'submission_approved',
                title: '✅ Task Approved!',
                message: `Your submission for "${taskTitle}" has been approved${points != null ? ` with ${points} points` : ''}.`,
                link: '/dashboard'
            });
            sendEmail({ to: studentEmail, templateName: 'submissionApproved', templateData: { name: studentName, taskTitle, internshipTitle, score: points, feedback } });
        } else if (status === 'rejected' || status === 'revision-requested') {
            createNotification({
                userId: studentId,
                type: 'submission_rejected',
                title: '🔄 Revision Needed',
                message: `Your submission for "${taskTitle}" needs revision. Check feedback and resubmit.`,
                link: '/dashboard'
            });
            sendEmail({ to: studentEmail, templateName: 'submissionRejected', templateData: { name: studentName, taskTitle, internshipTitle, feedback } });
        }

        res.json({
            success: true,
            message: 'Submission reviewed successfully',
            data: submission
        });
    } catch (error) {
        console.error('Error reviewing task submission:', error);
        res.status(500).json({
            success: false,
            message: 'Error reviewing task submission',
            error: error.message
        });
    }
};

// @desc    Get all project submissions
// @route   GET /api/admin/submissions/projects
// @access  Private/Admin
exports.getProjectSubmissions = async(req, res) => {
    try {
        const { status, courseId, studentId, page = 1, limit = 10 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (courseId) query.courseId = courseId;
        if (studentId) query.userId = studentId;

        const skip = (page - 1) * limit;

        const submissions = await ProjectSubmission.find(query)
            .populate('userId', 'name email profilePicture')
            .populate('projectId', 'title')
            .populate('courseId', 'title')
            .populate('reviewedBy', 'name')
            .sort({ submittedAt: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ProjectSubmission.countDocuments(query);

        res.json({
            success: true,
            data: submissions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching project submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project submissions',
            error: error.message
        });
    }
};

// @desc    Get single project submission
// @route   GET /api/admin/submissions/projects/:id
// @access  Private/Admin
exports.getProjectSubmission = async(req, res) => {
    try {
        const submission = await ProjectSubmission.findById(req.params.id)
            .populate('userId', 'name email profilePicture')
            .populate('projectId')
            .populate('courseId', 'title')
            .populate('reviewedBy', 'name');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        res.json({
            success: true,
            data: submission
        });
    } catch (error) {
        console.error('Error fetching project submission:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project submission',
            error: error.message
        });
    }
};

// @desc    Review and grade project submission
// @route   PUT /api/admin/submissions/projects/:id/review
// @access  Private/Admin
exports.reviewProjectSubmission = async(req, res) => {
    try {
        const { status, feedback, grade, score } = req.body;

        const submission = await ProjectSubmission.findById(req.params.id)
            .populate('projectId')
            .populate('userId')
            .populate('courseId');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Validate status
        if (!['approved', 'rejected', 'revision-requested'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Validate grade
        const validGrades = ['A+', 'A', 'B+', 'B', 'C'];
        if (grade && !validGrades.includes(grade)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid grade'
            });
        }

        // Validate score
        if (score !== undefined && (score < 0 || score > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Score must be between 0 and 100'
            });
        }

        submission.status = status;
        submission.mentorFeedback = feedback || submission.mentorFeedback;
        submission.grade = grade || submission.grade;
        submission.score = score !== undefined ? score : submission.score;
        submission.reviewedAt = Date.now();
        submission.reviewedBy = req.user._id;

        await submission.save();

        // Update enrollment if approved
        if (status === 'approved') {
            const enrollment = await Enrollment.findOne({
                userId: submission.userId._id,
                courseId: submission.courseId._id
            });

            if (enrollment) {
                enrollment.progress.projectSubmitted = true;
                enrollment.progress.projectApproved = true;

                // Recalculate completion percentage
                const totalItems = enrollment.progress.videosCompleted.length +
                    enrollment.progress.tasksCompleted.length + 1;
                const totalRequired = submission.courseId.totalModules +
                    submission.courseId.totalTasks + 1;

                enrollment.progress.completionPercentage = Math.round((totalItems / totalRequired) * 100);

                // Update status if 100% complete
                if (enrollment.progress.completionPercentage === 100) {
                    enrollment.status = 'completed';
                    enrollment.completedAt = Date.now();
                }

                await enrollment.save();
            }
        }

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: status === 'approved' ? 'approve' : 'reject',
            targetModel: 'ProjectSubmission',
            targetId: submission._id,
            description: `Reviewed project submission by ${submission.userId.name} for ${submission.courseId.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Project submission reviewed successfully',
            data: submission
        });
    } catch (error) {
        console.error('Error reviewing project submission:', error);
        res.status(500).json({
            success: false,
            message: 'Error reviewing project submission',
            error: error.message
        });
    }
};

// @desc    Get pending submissions count
// @route   GET /api/admin/submissions/pending-count
// @access  Private/Admin
exports.getPendingCount = async(req, res) => {
    try {
        const pendingTasks = await TaskSubmission.countDocuments({ status: 'pending' });
        const pendingProjects = await ProjectSubmission.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            data: {
                tasks: pendingTasks,
                projects: pendingProjects,
                total: pendingTasks + pendingProjects
            }
        });
    } catch (error) {
        console.error('Error fetching pending count:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending count',
            error: error.message
        });
    }
};