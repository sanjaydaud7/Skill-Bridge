const Enrollment = require('../../models/Enrollment');
const User = require('../../models/User');
const Internship = require('../../models/Internship');
const AdminLog = require('../../models/AdminLog');

// @desc    Get all enrollments
// @route   GET /api/admin/enrollments
// @access  Private/Admin
exports.getEnrollments = async(req, res) => {
    try {
        const { courseId, userId, status, page = 1, limit = 10, search } = req.query;

        const query = {};
        if (courseId) query.courseId = courseId;
        if (userId) query.userId = userId;
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        let enrollments = await Enrollment.find(query)
            .populate('userId', 'name email profilePicture')
            .populate('courseId', 'title thumbnail category')
            .sort({ enrolledAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Apply search filter after population
        if (search) {
            enrollments = enrollments.filter(e =>
                e.userId.name.toLowerCase().includes(search.toLowerCase()) ||
                e.userId.email.toLowerCase().includes(search.toLowerCase()) ||
                e.courseId.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = await Enrollment.countDocuments(query);

        res.json({
            success: true,
            data: enrollments,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollments',
            error: error.message
        });
    }
};

// @desc    Get single enrollment details
// @route   GET /api/admin/enrollments/:id
// @access  Private/Admin
exports.getEnrollment = async(req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id)
            .populate('userId', 'name email profilePicture')
            .populate('courseId')
            .populate('certificateId');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        res.json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollment',
            error: error.message
        });
    }
};

// @desc    Update enrollment status
// @route   PUT /api/admin/enrollments/:id/status
// @access  Private/Admin
exports.updateEnrollmentStatus = async(req, res) => {
    try {
        const { status } = req.body;

        const enrollment = await Enrollment.findById(req.params.id)
            .populate('userId', 'name')
            .populate('courseId', 'title');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        const validStatuses = ['enrolled', 'in-progress', 'completed', 'certificate-purchased', 'dropped'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const oldStatus = enrollment.status;
        enrollment.status = status;

        if (status === 'completed' && !enrollment.completedAt) {
            enrollment.completedAt = Date.now();
        }

        await enrollment.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'status_change',
            targetModel: 'Enrollment',
            targetId: enrollment._id,
            changes: { oldStatus, newStatus: status },
            description: `Changed enrollment status from ${oldStatus} to ${status} for ${enrollment.userId.name} in ${enrollment.courseId.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Enrollment status updated successfully',
            data: enrollment
        });
    } catch (error) {
        console.error('Error updating enrollment status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating enrollment status',
            error: error.message
        });
    }
};

// @desc    Manually enroll student
// @route   POST /api/admin/enrollments/manual
// @access  Private/Admin
exports.manualEnrollment = async(req, res) => {
    try {
        const { userId, courseId } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if course exists
        const course = await Internship.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check for existing enrollment
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'Student is already enrolled in this course'
            });
        }

        const enrollment = await Enrollment.create({
            userId,
            courseId,
            status: 'enrolled',
            progress: {
                videosCompleted: [],
                tasksCompleted: [],
                projectSubmitted: false,
                projectApproved: false,
                completionPercentage: 0
            }
        });

        // Update course enrollment count
        Internship.enrollmentCount += 1;
        await Internship.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'enroll',
            targetModel: 'Enrollment',
            targetId: enrollment._id,
            description: `Manually enrolled ${user.name} in ${Internship.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        const populatedEnrollment = await Enrollment.findById(enrollment._id)
            .populate('userId', 'name email')
            .populate('courseId', 'title');

        res.status(201).json({
            success: true,
            message: 'Student enrolled successfully',
            data: populatedEnrollment
        });
    } catch (error) {
        console.error('Error creating manual enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating manual enrollment',
            error: error.message
        });
    }
};

// @desc    Unenroll student
// @route   DELETE /api/admin/enrollments/:id
// @access  Private/Admin
exports.unenrollStudent = async(req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id)
            .populate('userId', 'name')
            .populate('courseId', 'title');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Update course enrollment count
        const course = await Internship.findById(enrollment.courseId._id);
        if (course && Internship.enrollmentCount > 0) {
            Internship.enrollmentCount -= 1;
            await Internship.save();
        }

        const studentName = enrollment.userId.name;
        const courseTitle = enrollment.courseId.title;

        await enrollment.deleteOne();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'unenroll',
            targetModel: 'Enrollment',
            targetId: enrollment._id,
            description: `Unenrolled ${studentName} from ${courseTitle}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Student unenrolled successfully'
        });
    } catch (error) {
        console.error('Error unenrolling student:', error);
        res.status(500).json({
            success: false,
            message: 'Error unenrolling student',
            error: error.message
        });
    }
};

// @desc    Reset enrollment progress
// @route   PUT /api/admin/enrollments/:id/reset
// @access  Private/Admin
exports.resetEnrollmentProgress = async(req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id)
            .populate('userId', 'name')
            .populate('courseId', 'title');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        enrollment.progress = {
            videosCompleted: [],
            tasksCompleted: [],
            projectSubmitted: false,
            projectApproved: false,
            completionPercentage: 0
        };
        enrollment.status = 'enrolled';
        enrollment.completedAt = null;

        await enrollment.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'update',
            targetModel: 'Enrollment',
            targetId: enrollment._id,
            description: `Reset progress for ${enrollment.userId.name} in ${enrollment.courseId.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Enrollment progress reset successfully',
            data: enrollment
        });
    } catch (error) {
        console.error('Error resetting enrollment progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting enrollment progress',
            error: error.message
        });
    }
};

// @desc    Get enrollment statistics
// @route   GET /api/admin/enrollments/stats
// @access  Private/Admin
exports.getEnrollmentStats = async(req, res) => {
    try {
        const { courseId } = req.query;

        const query = courseId ? { courseId } : {};

        const totalEnrollments = await Enrollment.countDocuments(query);
        const activeEnrollments = await Enrollment.countDocuments({...query, status: { $in: ['enrolled', 'in-progress'] } });
        const completedEnrollments = await Enrollment.countDocuments({...query, status: 'completed' });
        const droppedEnrollments = await Enrollment.countDocuments({...query, status: 'dropped' });

        // Get average completion percentage
        const enrollments = await Enrollment.find(query);
        const avgCompletion = enrollments.length > 0 ?
            enrollments.reduce((sum, e) => sum + ((e.progress && e.progress.completionPercentage) || 0), 0) / enrollments.length :
            0;

        res.json({
            success: true,
            data: {
                totalEnrollments,
                activeEnrollments,
                completedEnrollments,
                droppedEnrollments,
                avgCompletion: Math.round(avgCompletion)
            }
        });
    } catch (error) {
        console.error('Error fetching enrollment stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollment statistics',
            error: error.message
        });
    }
};