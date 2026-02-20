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
        const totalTasks = await Task.countDocuments({ courseId, isActive: true });

        // Check all tasks approved
        const approvedTasks = await TaskSubmission.countDocuments({
            userId,
            courseId,
            status: 'approved'
        });

        // Check project approved
        const projectSubmission = await ProjectSubmission.findOne({
            userId,
            courseId,
            status: 'approved'
        });

        // Check videos completed (100%)
        const completionPercentage = enrollment.progress.completionPercentage;

        const eligible =
            approvedTasks >= totalTasks &&
            projectSubmission &&
            completionPercentage === 100;

        const requirements = {
            videosCompleted: completionPercentage === 100,
            tasksApproved: approvedTasks >= totalTasks,
            projectApproved: !!projectSubmission,
            allRequirementsMet: eligible
        };

        res.status(200).json({
            success: true,
            eligible,
            alreadyIssued: false,
            requirements,
            courseTitle: course.title,
            certificatePrice: course.certificatePrice
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

        // Get enrollment and course
        const enrollment = await Enrollment.findOne({ userId, courseId });
        const course = await Course.findById(courseId);
        const user = req.user;

        if (!enrollment || !course) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment or course not found'
            });
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({ userId, courseId });
        if (existingCertificate) {
            return res.status(400).json({
                success: false,
                message: 'Certificate already issued'
            });
        }

        // Verify payment
        const payment = await Payment.findById(paymentId);
        if (!payment || payment.userId.toString() !== userId || payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Valid payment not found'
            });
        }

        // Get project grade
        const projectSubmission = await ProjectSubmission.findOne({
            userId,
            courseId,
            status: 'approved'
        });

        // Create certificate
        const certificate = await Certificate.create({
            userId,
            courseId,
            enrollmentId: enrollment._id,
            paymentId: payment._id,
            // grade: projectSubmission ? .grade || 'B',
            skills: course.skills,
            issuedAt: new Date()
        });

        // Update enrollment
        enrollment.status = 'certificate-purchased';
        enrollment.certificateId = certificate._id;
        enrollment.completedAt = new Date();
        await enrollment.save();

        // TODO: Generate PDF using PDFKit and upload to Cloudinary
        // For now, we'll set a placeholder URL
        certificate.pdfUrl = `https://certificates.skillbridge.com/${certificate.certificateNumber}.pdf`;
        await certificate.save();

        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            data: certificate
        });
    } catch (error) {
        console.error('Generate certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating certificate'
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