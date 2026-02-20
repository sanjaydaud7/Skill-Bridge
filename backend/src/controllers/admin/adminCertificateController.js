const Certificate = require('../../models/Certificate');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const Payment = require('../../models/Payment');
const AdminLog = require('../../models/AdminLog');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

// @desc    Get all certificates
// @route   GET /api/admin/certificates
// @access  Private/Admin
exports.getCertificates = async(req, res) => {
    try {
        const { search, status, courseId, page = 1, limit = 10 } = req.query;

        const query = {};
        if (courseId) query.courseId = courseId;
        if (status === 'valid') query.isValid = true;
        if (status === 'revoked') query.isValid = false;

        const skip = (page - 1) * limit;

        let certificates = await Certificate.find(query)
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ issuedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Apply search after population
        if (search) {
            certificates = certificates.filter(cert =>
                cert.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
                cert.verificationCode.toLowerCase().includes(search.toLowerCase()) ||
                cert.userId.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = await Certificate.countDocuments(query);

        res.json({
            success: true,
            data: certificates,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching certificates',
            error: error.message
        });
    }
};

// @desc    Get single certificate
// @route   GET /api/admin/certificates/:id
// @access  Private/Admin
exports.getCertificate = async(req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('userId', 'name email profilePicture')
            .populate('courseId')
            .populate('enrollmentId')
            .populate('paymentId');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            data: certificate
        });
    } catch (error) {
        console.error('Error fetching certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching certificate',
            error: error.message
        });
    }
};

// @desc    Manually issue certificate
// @route   POST /api/admin/certificates/manual
// @access  Private/Admin
exports.manualIssueCertificate = async(req, res) => {
    try {
        const { userId, courseId, grade, override } = req.body;

        // Validate user and course
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(400).json({
                success: false,
                message: 'User is not enrolled in this course'
            });
        }

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({ userId, courseId });
        if (existingCert) {
            return res.status(400).json({
                success: false,
                message: 'Certificate already issued for this course'
            });
        }

        // Check eligibility (unless override)
        if (!override) {
            const completionPercentage = enrollment.progress ? .completionPercentage || 0;
            const tasksCompleted = enrollment.progress ? .tasksCompleted ? .length || 0;
            const projectApproved = enrollment.progress ? .projectApproved || false;

            if (completionPercentage < 100 || tasksCompleted < course.totalTasks || !projectApproved) {
                return res.status(400).json({
                    success: false,
                    message: 'Student has not completed all requirements',
                    eligibility: {
                        videosCompleted: completionPercentage === 100,
                        tasksCompleted: tasksCompleted >= course.totalTasks,
                        projectApproved
                    }
                });
            }
        }

        // Generate certificate number and verification code
        const year = new Date().getFullYear();
        const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
        const certificateNumber = `SB-${year}-${randomHex}`;
        const verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();

        // Create certificate
        const certificate = await Certificate.create({
            userId,
            courseId,
            enrollmentId: enrollment._id,
            certificateNumber,
            verificationCode,
            issuedAt: Date.now(),
            grade: grade || 'A',
            skills: course.skills,
            isValid: true
        });

        // Update enrollment
        enrollment.status = 'certificate-purchased';
        enrollment.certificateId = certificate._id;
        await enrollment.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'manual_certificate',
            targetModel: 'Certificate',
            targetId: certificate._id,
            description: `Manually issued certificate to ${user.name} for ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        const populatedCertificate = await Certificate.findById(certificate._id)
            .populate('userId', 'name email')
            .populate('courseId', 'title');

        res.status(201).json({
            success: true,
            message: 'Certificate issued successfully',
            data: populatedCertificate
        });
    } catch (error) {
        console.error('Error issuing certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Error issuing certificate',
            error: error.message
        });
    }
};

// @desc    Revoke certificate
// @route   PUT /api/admin/certificates/:id/revoke
// @access  Private/Admin
exports.revokeCertificate = async(req, res) => {
    try {
        const { reason } = req.body;

        if (!reason || reason.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Revocation reason is required (minimum 10 characters)'
            });
        }

        const certificate = await Certificate.findById(req.params.id)
            .populate('userId', 'name')
            .populate('courseId', 'title');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        if (!certificate.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Certificate is already revoked'
            });
        }

        certificate.isValid = false;
        certificate.revokedAt = Date.now();
        certificate.revokedReason = reason;

        await certificate.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'revoke',
            targetModel: 'Certificate',
            targetId: certificate._id,
            description: `Revoked certificate for ${certificate.userId.name} - ${certificate.courseId.title}. Reason: ${reason}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Certificate revoked successfully',
            data: certificate
        });
    } catch (error) {
        console.error('Error revoking certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Error revoking certificate',
            error: error.message
        });
    }
};

// @desc    Restore revoked certificate
// @route   PUT /api/admin/certificates/:id/restore
// @access  Private/Admin
exports.restoreCertificate = async(req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('userId', 'name')
            .populate('courseId', 'title');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        if (certificate.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Certificate is not revoked'
            });
        }

        certificate.isValid = true;
        certificate.revokedAt = null;
        certificate.revokedReason = null;

        await certificate.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'restore',
            targetModel: 'Certificate',
            targetId: certificate._id,
            description: `Restored certificate for ${certificate.userId.name} - ${certificate.courseId.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Certificate restored successfully',
            data: certificate
        });
    } catch (error) {
        console.error('Error restoring certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Error restoring certificate',
            error: error.message
        });
    }
};

// @desc    Get certificate statistics
// @route   GET /api/admin/certificates/stats
// @access  Private/Admin
exports.getCertificateStats = async(req, res) => {
    try {
        const totalCertificates = await Certificate.countDocuments();
        const validCertificates = await Certificate.countDocuments({ isValid: true });
        const revokedCertificates = await Certificate.countDocuments({ isValid: false });

        // Certificates this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const certificatesThisMonth = await Certificate.countDocuments({
            issuedAt: { $gte: startOfMonth }
        });

        // Certificates by course
        const certificatesByCourse = await Certificate.aggregate([
            { $match: { isValid: true } },
            { $group: { _id: '$courseId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const populatedCourses = await Course.populate(certificatesByCourse, {
            path: '_id',
            select: 'title'
        });

        res.json({
            success: true,
            data: {
                total: totalCertificates,
                valid: validCertificates,
                revoked: revokedCertificates,
                thisMonth: certificatesThisMonth,
                topCourses: populatedCourses.map(item => ({
                    course: item._id.title,
                    count: item.count
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching certificate stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching certificate statistics',
            error: error.message
        });
    }
};