const Certificate = require('../models/Certificate');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const TaskSubmission = require('../models/TaskSubmission');
const ProjectSubmission = require('../models/ProjectSubmission');
const Task = require('../models/Task');

// @desc    Check certificate eligibility
// @route   GET /api/certificates/:courseId/eligibility
// @access  Private
exports.checkEligibility = async(req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Get enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        // Check if certificate already issued
        const existingCertificate = await Certificate.findOne({ userId, courseId });
        if (existingCertificate) {
            return res.status(200).json({
                success: true,
                eligible: true,
                alreadyIssued: true,
                certificate: existingCertificate
            });
        }

        // Get course details
        const course = await Course.findById(courseId);
        const totalTasks = await Task.countDocuments({ courseId });

        // Check videos completed (100%)
        const completionPercentage = enrollment.progress.completionPercentage;
        const videosCompleted = completionPercentage === 100;

        // Check tasks - use enrollment.progress for bypass support
        const completedTasksCount = enrollment.progress.tasksCompleted.length;
        const tasksApproved = completedTasksCount >= totalTasks || enrollment.progress.completionPercentage === 100;

        // Check project - use enrollment.progress for bypass support
        const projectApproved = enrollment.progress.projectApproved === true;

        const eligible = videosCompleted && tasksApproved && projectApproved;

        const requirements = {
            videosCompleted,
            tasksApproved,
            projectApproved,
            allRequirementsMet: eligible
        };

        console.log('Certificate eligibility check:', {
            userId,
            courseId,
            completionPercentage,
            completedTasksCount,
            totalTasks,
            projectApproved,
            eligible
        });

        res.status(200).json({
            success: true,
            eligible,
            alreadyIssued: false,
            requirements,
            courseTitle: course.title,
            certificatePrice: course.certificatePrice,
            message: eligible ? 'You are eligible for the certificate!' : 'Complete all requirements to unlock certificate'
        });
    } catch (error) {
        console.error('Check eligibility error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking eligibility'
        });
    }
};

// @desc    Generate certificate (after payment)
// @route   POST /api/certificates/:courseId/generate
// @access  Private
exports.generateCertificate = async(req, res) => {
    try {
        const { courseId } = req.params;
        const { paymentId } = req.body;
        const userId = req.user.id;

        console.log('Generating certificate for:', { userId, courseId, paymentId });

        // Get enrollment and course
        const enrollment = await Enrollment.findOne({ userId, courseId });
        const course = await Course.findById(courseId);

        if (!enrollment || !course) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment or course not found'
            });
        }

        // If payment is bypassed, skip progress checks
        if (!(paymentId === 'BYPASS' || paymentId === '' || paymentId === undefined)) {
            // Check progress requirements
            const completionPercentage = enrollment.progress.completionPercentage;
            const videosCompleted = completionPercentage === 100;
            const totalTasks = await Task.countDocuments({ courseId });
            const completedTasksCount = enrollment.progress.tasksCompleted.length;
            const tasksApproved = completedTasksCount >= totalTasks || completionPercentage === 100;
            const projectApproved = enrollment.progress.projectApproved === true;
            const eligible = videosCompleted && tasksApproved && projectApproved;
            if (!eligible) {
                return res.status(400).json({
                    success: false,
                    message: 'Course requirements not completed for certificate.'
                });
            }
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({ userId, courseId });
        if (existingCertificate) {
            return res.status(200).json({
                success: true,
                message: 'Certificate already issued',
                data: existingCertificate
            });
        }

        // Verify payment if paymentId provided
        let payment = null;
        if (paymentId === 'BYPASS' || paymentId === '' || paymentId === undefined) {
            // Payment bypass logic: create a dummy payment object
            payment = { _id: null };
        } else if (paymentId) {
            payment = await Payment.findById(paymentId);
            if (!payment || payment.userId.toString() !== userId || payment.status !== 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid payment not found'
                });
            }
        } else {
            // If no paymentId, look for any completed payment for this course
            payment = await Payment.findOne({
                userId,
                courseId,
                status: 'completed'
            }).sort({ paidAt: -1 });
            if (!payment) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment required to generate certificate'
                });
            }
        }

        console.log('Payment verified:', payment._id);

        // Create certificate (use constructor and save to trigger pre-save hook)
        const certificate = new Certificate({
            userId,
            courseId,
            enrollmentId: enrollment._id,
            paymentId: payment._id,
            grade: 'A', // Default grade for bypass
            skills: course.skills || []
        });
        await certificate.save();

        // Update enrollment
        enrollment.status = 'certificate-purchased';
        enrollment.certificateId = certificate._id;
        enrollment.completedAt = new Date();
        await enrollment.save();

        // Set placeholder PDF URL
        certificate.pdfUrl = `https://certificates.skillbridge.com/${certificate.certificateNumber}.pdf`;
        await certificate.save();

        console.log('Certificate generated successfully:', certificate._id);

        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            data: certificate
        });
    } catch (error) {
        console.error('Generate certificate error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: 'Server error while generating certificate',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get user's certificates
// @route   GET /api/certificates
// @access  Private
exports.getUserCertificates = async(req, res) => {
    try {
        const userId = req.user.id;

        const certificates = await Certificate.find({ userId, isValid: true })
            .populate('courseId', 'title category thumbnail')
            .sort({ issuedAt: -1 });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates
        });
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching certificates'
        });
    }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:code
// @access  Public
exports.verifyCertificate = async(req, res) => {
    try {
        const { code } = req.params;

        const certificate = await Certificate.findOne({ verificationCode: code })
            .populate('userId', 'name email')
            .populate('courseId', 'title category duration');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        if (!certificate.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Certificate has been revoked'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                certificateNumber: certificate.certificateNumber,
                studentName: certificate.userId.name,
                courseName: certificate.courseId.title,
                issuedAt: certificate.issuedAt,
                grade: certificate.grade,
                skills: certificate.skills,
                isValid: certificate.isValid
            }
        });
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while verifying certificate'
        });
    }
};

// @desc    Download certificate
// @route   GET /api/certificates/:id/download
// @access  Private
exports.downloadCertificate = async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const certificate = await Certificate.findById(id);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        if (certificate.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this certificate'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                pdfUrl: certificate.pdfUrl,
                certificateNumber: certificate.certificateNumber
            }
        });
    } catch (error) {
        console.error('Download certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while downloading certificate'
        });
    }
};