const User = require('../../models/User');
const Enrollment = require('../../models/Enrollment');
const Certificate = require('../../models/Certificate');
const Payment = require('../../models/Payment');
const Course = require('../../models/Course');
const TaskSubmission = require('../../models/TaskSubmission');
const ProjectSubmission = require('../../models/ProjectSubmission');
const AdminLog = require('../../models/AdminLog');

// @desc    Get dashboard statistics
// @route   GET /api/admin/analytics/dashboard
// @access  Private/Admin
exports.getDashboardStats = async(req, res) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const activeUsers = await User.countDocuments({ isActive: true });

        // Get new users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Course statistics
        const totalCourses = await Course.countDocuments();
        const activeCourses = await Course.countDocuments({ isActive: true });

        // Enrollment statistics
        const totalEnrollments = await Enrollment.countDocuments();
        const activeEnrollments = await Enrollment.countDocuments({
            status: { $in: ['enrolled', 'in-progress'] }
        });
        const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

        // Submission statistics
        const pendingTaskSubmissions = await TaskSubmission.countDocuments({ status: 'pending' });
        const pendingProjectSubmissions = await ProjectSubmission.countDocuments({ status: 'pending' });
        const pendingSubmissions = pendingTaskSubmissions + pendingProjectSubmissions;

        // Certificate statistics
        const totalCertificates = await Certificate.countDocuments();
        const certificatesThisMonth = await Certificate.countDocuments({
            issuedAt: { $gte: startOfMonth }
        });

        // Revenue statistics
        const payments = await Payment.find({ status: 'completed' });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        const paymentsThisMonth = await Payment.find({
            status: 'completed',
            paidAt: { $gte: startOfMonth }
        });
        const revenueThisMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

        // Recent activity (last 10 admin actions)
        const recentActivity = await AdminLog.find()
            .populate('adminId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    admins: totalAdmins,
                    active: activeUsers,
                    newThisMonth: newUsersThisMonth
                },
                courses: {
                    total: totalCourses,
                    active: activeCourses
                },
                enrollments: {
                    total: totalEnrollments,
                    active: activeEnrollments,
                    completed: completedEnrollments
                },
                submissions: {
                    pending: pendingSubmissions,
                    tasks: pendingTaskSubmissions,
                    projects: pendingProjectSubmissions
                },
                certificates: {
                    total: totalCertificates,
                    thisMonth: certificatesThisMonth
                },
                revenue: {
                    total: totalRevenue,
                    thisMonth: revenueThisMonth,
                    currency: 'INR'
                },
                recentActivity
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// @desc    Get enrollment trends
// @route   GET /api/admin/analytics/enrollment-trends
// @access  Private/Admin
exports.getEnrollmentTrends = async(req, res) => {
    try {
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const enrollments = await Enrollment.find({
            enrolledAt: { $gte: startDate }
        }).sort({ enrolledAt: 1 });

        // Group by date
        const trends = {};
        enrollments.forEach(enrollment => {
            const date = enrollment.enrolledAt.toISOString().split('T')[0];
            trends[date] = (trends[date] || 0) + 1;
        });

        // Convert to array format
        const data = Object.keys(trends).map(date => ({
            date,
            count: trends[date]
        }));

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching enrollment trends:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollment trends',
            error: error.message
        });
    }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
exports.getRevenueAnalytics = async(req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const query = { status: 'completed' };

        if (startDate || endDate) {
            query.paidAt = {};
            if (startDate) query.paidAt.$gte = new Date(startDate);
            if (endDate) query.paidAt.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate('courseId', 'title')
            .sort({ paidAt: 1 });

        // Total revenue
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const averageTransactionValue = payments.length > 0 ? totalRevenue / payments.length : 0;

        // Revenue by course
        const revenueByCourse = {};
        payments.forEach(payment => {
            if (payment.courseId) {
                const courseTitle = payment.courseId.title;
                revenueByCourse[courseTitle] = (revenueByCourse[courseTitle] || 0) + payment.amount;
            }
        });

        const topCourses = Object.entries(revenueByCourse)
            .map(([course, revenue]) => ({ course, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Revenue trend
        const revenueTrend = {};
        payments.forEach(payment => {
            let dateKey;
            const date = new Date(payment.paidAt);

            if (groupBy === 'month') {
                dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                dateKey = date.toISOString().split('T')[0];
            }

            revenueTrend[dateKey] = (revenueTrend[dateKey] || 0) + payment.amount;
        });

        const trendData = Object.keys(revenueTrend).map(date => ({
            date,
            revenue: revenueTrend[date]
        }));

        // Payment method distribution
        const paymentMethods = {};
        payments.forEach(payment => {
            const method = payment.bypassedForTesting ? 'Bypassed' : 'Stripe';
            paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalTransactions: payments.length,
                averageTransactionValue: Math.round(averageTransactionValue),
                topCourses,
                revenueTrend: trendData,
                paymentMethods
            }
        });
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue analytics',
            error: error.message
        });
    }
};

// @desc    Get course performance metrics
// @route   GET /api/admin/analytics/courses
// @access  Private/Admin
exports.getCourseAnalytics = async(req, res) => {
    try {
        const courses = await Course.find();

        const courseMetrics = await Promise.all(
            courses.map(async(course) => {
                const enrollments = await Enrollment.find({ courseId: course._id });
                const completed = enrollments.filter(e => e.status === 'completed').length;
                const active = enrollments.filter(e => ['enrolled', 'in-progress'].includes(e.status)).length;
                const avgProgress = enrollments.length > 0 ?
                    enrollments.reduce((sum, e) => sum + ((e.progress && e.progress.completionPercentage) || 0), 0) / enrollments.length :
                    0;

                const certificates = await Certificate.countDocuments({ courseId: course._id });
                const revenue = await Payment.aggregate([
                    { $match: { courseId: course._id, status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);

                return {
                    courseId: course._id,
                    title: course.title,
                    category: course.category,
                    totalEnrollments: enrollments.length,
                    activeEnrollments: active,
                    completedEnrollments: completed,
                    completionRate: enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0,
                    avgProgress: Math.round(avgProgress),
                    certificates,
                    revenue: (revenue[0] && revenue[0].total) || 0
                };
            })
        );

        // Sort by enrollments
        courseMetrics.sort((a, b) => b.totalEnrollments - a.totalEnrollments);

        res.json({
            success: true,
            data: courseMetrics
        });
    } catch (error) {
        console.error('Error fetching course analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course analytics',
            error: error.message
        });
    }
};

// @desc    Get student engagement metrics
// @route   GET /api/admin/analytics/students
// @access  Private/Admin
exports.getStudentAnalytics = async(req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const enrolledStudents = await Enrollment.distinct('userId').countDocuments();

        const enrollments = await Enrollment.find();

        // Completion distribution
        const completionDistribution = {
            '0-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-99%': 0,
            '100%': 0
        };

        enrollments.forEach(enrollment => {
            const completion = (enrollment.progress && enrollment.progress.completionPercentage) || 0;
            if (completion === 100) completionDistribution['100%']++;
            else if (completion >= 76) completionDistribution['76-99%']++;
            else if (completion >= 51) completionDistribution['51-75%']++;
            else if (completion >= 26) completionDistribution['26-50%']++;
            else completionDistribution['0-25%']++;
        });

        // Average time to completion
        const completedEnrollments = enrollments.filter(e => e.completedAt);
        let avgTimeToCompletion = 0;
        if (completedEnrollments.length > 0) {
            const totalDays = completedEnrollments.reduce((sum, e) => {
                const days = Math.floor((new Date(e.completedAt) - new Date(e.enrolledAt)) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0);
            avgTimeToCompletion = Math.round(totalDays / completedEnrollments.length);
        }

        res.json({
            success: true,
            data: {
                totalStudents,
                enrolledStudents,
                engagementRate: totalStudents > 0 ? Math.round((enrolledStudents / totalStudents) * 100) : 0,
                completionDistribution,
                avgTimeToCompletion
            }
        });
    } catch (error) {
        console.error('Error fetching student analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student analytics',
            error: error.message
        });
    }
};

// @desc    Get submission statistics
// @route   GET /api/admin/analytics/submissions
// @access  Private/Admin
exports.getSubmissionAnalytics = async(req, res) => {
    try {
        // Task submissions
        const totalTaskSubmissions = await TaskSubmission.countDocuments();
        const approvedTasks = await TaskSubmission.countDocuments({ status: 'approved' });
        const rejectedTasks = await TaskSubmission.countDocuments({ status: 'rejected' });
        const pendingTasks = await TaskSubmission.countDocuments({ status: 'pending' });

        // Project submissions
        const totalProjectSubmissions = await ProjectSubmission.countDocuments();
        const approvedProjects = await ProjectSubmission.countDocuments({ status: 'approved' });
        const rejectedProjects = await ProjectSubmission.countDocuments({ status: 'rejected' });
        const pendingProjects = await ProjectSubmission.countDocuments({ status: 'pending' });

        // Average review time
        const reviewedTasks = await TaskSubmission.find({
            reviewedAt: { $exists: true },
            submittedAt: { $exists: true }
        });

        let avgReviewTime = 0;
        if (reviewedTasks.length > 0) {
            const totalHours = reviewedTasks.reduce((sum, task) => {
                const hours = (new Date(task.reviewedAt) - new Date(task.submittedAt)) / (1000 * 60 * 60);
                return sum + hours;
            }, 0);
            avgReviewTime = Math.round(totalHours / reviewedTasks.length);
        }

        res.json({
            success: true,
            data: {
                tasks: {
                    total: totalTaskSubmissions,
                    approved: approvedTasks,
                    rejected: rejectedTasks,
                    pending: pendingTasks,
                    approvalRate: totalTaskSubmissions > 0 ? Math.round((approvedTasks / totalTaskSubmissions) * 100) : 0
                },
                projects: {
                    total: totalProjectSubmissions,
                    approved: approvedProjects,
                    rejected: rejectedProjects,
                    pending: pendingProjects,
                    approvalRate: totalProjectSubmissions > 0 ? Math.round((approvedProjects / totalProjectSubmissions) * 100) : 0
                },
                avgReviewTimeHours: avgReviewTime
            }
        });
    } catch (error) {
        console.error('Error fetching submission analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching submission analytics',
            error: error.message
        });
    }
};