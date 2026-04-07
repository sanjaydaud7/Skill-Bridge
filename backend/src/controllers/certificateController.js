const Certificate = require('../models/Certificate');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Internship = require('../models/Internship');
const TaskSubmission = require('../models/TaskSubmission');
const ProjectSubmission = require('../models/ProjectSubmission');
const Task = require('../models/Task');
const PDFDocument = require('pdfkit');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('./notificationController');

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
                message: 'Not enrolled in this internship'
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
        const course = await Internship.findById(courseId);
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
            courseTitle: Internship.title,
            certificatePrice: Internship.certificatePrice,
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
        const course = await Internship.findById(courseId);

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
            skills: Internship.skills || []
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

        // Notify student
        const user = await require('../models/User').findById(userId).select('name email');
        if (user) {
            createNotification({
                userId,
                type: 'certificate_ready',
                title: '🏆 Your Certificate is Ready!',
                message: `Congratulations! Your certificate for "${course.title}" is ready to download.`,
                link: '/certificates'
            });
            sendEmail({
                to: user.email,
                templateName: 'certificateReady',
                templateData: {
                    name: user.name,
                    internshipTitle: course.title,
                    certificateNumber: certificate.certificateNumber,
                    downloadUrl: `${process.env.FRONTEND_URL}/certificates`
                }
            });
        }

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

        const certificate = await Certificate.findById(id)
            .populate('userId', 'name email')
            .populate('courseId', 'title category duration skills');

        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        if (certificate.userId._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to download this certificate' });
        }

        const studentName = certificate.userId.name || 'Student';
        const courseTitle = certificate.courseId.title || 'internship';
        const category = certificate.courseId.category || 'Technology';
        const duration = certificate.courseId.duration ? `${certificate.courseId.duration} Weeks` : '';
        const grade = certificate.grade || 'A';
        const certNumber = certificate.certificateNumber || '';
        const verificationCode = certificate.verificationCode || '';
        const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const skills = (certificate.skills && certificate.skills.length > 0) ?
            certificate.skills : [];

        // ── PDF setup ─────────────────────────────────────────────────────────
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="SkillBridge_Certificate_${certNumber}.pdf"`);
        doc.pipe(res);

        const W = 841.89;
        const H = 595.28;

        // ── Colours ───────────────────────────────────────────────────────────
        const NAVY = '#0D1B4B';
        const NAVY2 = '#162362';
        const GOLD = '#C9940A';
        const GOLD_LT = '#E8B84B';
        const GOLD_PALE = '#F5DFA0';
        const CREAM = '#FFFDF5';
        const CREAM2 = '#FFF8E7';
        const TEXT_DARK = '#1A1A2E';
        const TEXT_MID = '#3D3D5C';
        const TEXT_LIGHT = '#7A7A9A';
        const WHITE = '#FFFFFF';

        // ══════════════════════════════════════════════════════════
        // LEFT PANEL  (0 → 232)
        // ══════════════════════════════════════════════════════════
        const LP = 232; // left panel width

        // Base navy fill
        doc.rect(0, 0, LP, H).fill(NAVY);

        // Subtle lighter top triangle accent
        doc.polygon([0, 0], [LP, 0], [0, H * 0.55]).fill(NAVY2);

        // Thin gold right edge
        doc.rect(LP - 4, 0, 4, H).fill(GOLD);

        // ── Top ornament strip ────────────────────────────────────
        doc.rect(0, 0, LP, 6).fill(GOLD);
        doc.rect(0, H - 6, LP, 6).fill(GOLD);

        // ── "SKILLBRIDGE" brand ───────────────────────────────────
        doc.fontSize(7).fillColor(GOLD_PALE).font('Helvetica')
            .text('━━━━━━━━━━━', 0, 30, { width: LP, align: 'center', characterSpacing: 3 });

        doc.fontSize(20).fillColor(WHITE).font('Helvetica-Bold')
            .text('SKILL', 0, 47, { width: LP, align: 'center', characterSpacing: 6, continued: true })
            .fillColor(GOLD_LT)
            .text('BRIDGE', { characterSpacing: 6 });

        doc.fontSize(7).fillColor(GOLD_PALE).font('Helvetica')
            .text('━━━━━━━━━━━', 0, 78, { width: LP, align: 'center', characterSpacing: 3 });

        doc.fontSize(6.5).fillColor(GOLD_PALE).font('Helvetica')
            .text('PROFESSIONAL LEARNING PLATFORM', 0, 88, { width: LP, align: 'center', characterSpacing: 2 });

        // ── Gold seal circle ──────────────────────────────────────
        const sealX = LP / 2;
        const sealY = H / 2 + 10;
        const sealR = 68;

        // Outer glow ring
        doc.circle(sealX, sealY, sealR + 10).lineWidth(1).strokeColor(NAVY2).stroke();
        // Gold outer ring
        doc.circle(sealX, sealY, sealR + 7)
            .lineWidth(2).strokeColor(GOLD).stroke();
        // Dashed inner ring (simulate with dashes)
        doc.circle(sealX, sealY, sealR + 2)
            .lineWidth(1).strokeColor(GOLD_LT).dash(4, { space: 3 }).stroke().undash();
        // Solid fill
        doc.circle(sealX, sealY, sealR).fill(NAVY2);
        // Inner decoration ring
        doc.circle(sealX, sealY, sealR - 8)
            .lineWidth(1).strokeColor(GOLD_LT).stroke();

        // Star / burst lines (12 spokes)
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            const x1 = sealX + Math.cos(angle) * (sealR - 18);
            const y1 = sealY + Math.sin(angle) * (sealR - 18);
            const x2 = sealX + Math.cos(angle) * (sealR - 10);
            const y2 = sealY + Math.sin(angle) * (sealR - 10);
            doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(1).strokeColor(GOLD).stroke();
        }

        // Seal text
        doc.fontSize(22).fillColor(GOLD_LT).font('Helvetica-Bold')
            .text('✦', sealX - 12, sealY - 36, { width: 24, align: 'center' });
        doc.fontSize(8).fillColor(GOLD_PALE).font('Helvetica-Bold')
            .text('CERTIFICATE', sealX - 35, sealY - 16, { width: 70, align: 'center', characterSpacing: 1 });
        doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
            .text('OF', sealX - 35, sealY - 4, { width: 70, align: 'center', characterSpacing: 2 });
        doc.fontSize(8).fillColor(GOLD_PALE).font('Helvetica-Bold')
            .text('COMPLETION', sealX - 35, sealY + 8, { width: 70, align: 'center', characterSpacing: 1 });

        // Grade badge inside seal
        doc.fontSize(20).fillColor(GOLD_LT).font('Helvetica-Bold')
            .text(grade, sealX - 15, sealY + 22, { width: 30, align: 'center' });

        // ── Year badge ────────────────────────────────────────────
        const yr = new Date(certificate.issuedAt).getFullYear();
        doc.roundedRect(LP / 2 - 28, sealY + sealR + 14, 56, 22, 4).fill(GOLD);
        doc.fontSize(11).fillColor(NAVY).font('Helvetica-Bold')
            .text(String(yr), LP / 2 - 28, sealY + sealR + 18, { width: 56, align: 'center' });

        // ── Bottom left: category tag ─────────────────────────────
        if (category) {
            doc.fontSize(8).fillColor(GOLD_LT).font('Helvetica')
                .text(category.toUpperCase(), 0, H - 50, { width: LP, align: 'center', characterSpacing: 2 });
        }
        if (duration) {
            doc.fontSize(8).fillColor(TEXT_LIGHT).font('Helvetica')
                .text(duration, 0, H - 38, { width: LP, align: 'center' });
        }

        // Small decorative diamonds on left edge
        const diaPoints = [60, 190, 320, 450];
        diaPoints.forEach(y => {
            doc.polygon([8, y - 6], [14, y], [8, y + 6], [2, y]).fill(GOLD_LT);
        });

        // ══════════════════════════════════════════════════════════
        // RIGHT PANEL  (LP → W)
        // ══════════════════════════════════════════════════════════
        const RP_X = LP + 4; // start after gold bar
        const RP_W = W - RP_X;

        // Cream background
        doc.rect(RP_X, 0, RP_W, H).fill(CREAM);

        // Top & bottom gold bars
        doc.rect(RP_X, 0, RP_W, 7).fill(GOLD);
        doc.rect(RP_X, H - 7, RP_W, 7).fill(GOLD);

        // Outer border
        doc.rect(RP_X + 16, 16, RP_W - 32, H - 32)
            .lineWidth(2).strokeColor(GOLD).stroke();
        // Inner border
        doc.rect(RP_X + 22, 22, RP_W - 44, H - 44)
            .lineWidth(0.5).strokeColor(GOLD_LT).stroke();

        // Corner ornaments (4 corners of inner border)
        const corners = [
            [RP_X + 22, 22],
            [W - 26, 22],
            [RP_X + 22, H - 22],
            [W - 26, H - 22]
        ];
        corners.forEach(([cx, cy]) => {
            doc.circle(cx, cy, 4).fill(GOLD);
            doc.circle(cx, cy, 6).lineWidth(1).strokeColor(GOLD_LT).stroke();
        });

        // Subtle cream-2 inner fill between borders
        doc.rect(RP_X + 23, 23, RP_W - 46, H - 46).fill(CREAM2);

        // ── "CERTIFICATE OF COMPLETION" header ───────────────────
        const CX = RP_X + RP_W / 2; // horizontal center of right panel

        doc.fontSize(8).fillColor(GOLD).font('Helvetica-Bold')
            .text('━━━━━━━━━━━  EXCELLENCE IN LEARNING  ━━━━━━━━━━━',
                RP_X + 40, 38, { width: RP_W - 80, align: 'center', characterSpacing: 1 });

        doc.fontSize(26).fillColor(NAVY).font('Helvetica-Bold')
            .text('CERTIFICATE OF COMPLETION',
                RP_X + 40, 56, { width: RP_W - 80, align: 'center', characterSpacing: 3 });

        // Title underline (double line)
        const tlY = 94;
        doc.moveTo(RP_X + 60, tlY).lineTo(W - 44, tlY)
            .lineWidth(2).strokeColor(GOLD).stroke();
        doc.moveTo(RP_X + 80, tlY + 4).lineTo(W - 64, tlY + 4)
            .lineWidth(0.5).strokeColor(GOLD_LT).stroke();

        // ── Presented to ──────────────────────────────────────────
        doc.fontSize(10).fillColor(TEXT_LIGHT).font('Helvetica-Oblique')
            .text('This is proudly presented to',
                RP_X + 40, 110, { width: RP_W - 80, align: 'center' });

        // ── Student Name ──────────────────────────────────────────
        // Name background ribbon
        const nameY = 126;
        const nameFontSize = studentName.length > 22 ? 30 : 36;
        doc.rect(RP_X + 50, nameY - 4, RP_W - 100, nameFontSize + 16).fill('#FFF3CD');
        doc.rect(RP_X + 50, nameY - 4, 4, nameFontSize + 16).fill(GOLD);
        doc.rect(W - 54, nameY - 4, 4, nameFontSize + 16).fill(GOLD);

        doc.fontSize(nameFontSize).fillColor(NAVY).font('Helvetica-BoldOblique')
            .text(studentName, RP_X + 54, nameY + 2, { width: RP_W - 108, align: 'center' });

        // ── Completion statement ──────────────────────────────────
        const afterNameY = nameY + nameFontSize + 22;
        doc.fontSize(10).fillColor(TEXT_MID).font('Helvetica')
            .text('has successfully demonstrated excellence and completed the internship program',
                RP_X + 40, afterNameY, { width: RP_W - 80, align: 'center' });

        // ── Course title ──────────────────────────────────────────
        const courseY = afterNameY + 18;
        doc.fontSize(15).fillColor(NAVY).font('Helvetica-Bold')
            .text(`"${courseTitle}"`,
                RP_X + 40, courseY, { width: RP_W - 80, align: 'center' });

        // ── Skills row ────────────────────────────────────────────
        if (skills.length > 0) {
            const skillsY = courseY + 28;
            const badgeH = 16;
            let bx = RP_X + 40;
            const maxW = RP_W - 80;
            let totalBadgeW = 0;

            // Measure total width
            skills.slice(0, 6).forEach(skill => {
                totalBadgeW += doc.widthOfString(skill, { fontSize: 7 }) + 16;
            });
            if (totalBadgeW < maxW) bx = CX - totalBadgeW / 2;

            skills.slice(0, 6).forEach(skill => {
                const bw = doc.widthOfString(skill, { fontSize: 7 }) + 16;
                doc.roundedRect(bx, skillsY, bw, badgeH, 3).fill(NAVY).stroke();
                doc.fontSize(7).fillColor(GOLD_PALE).font('Helvetica-Bold')
                    .text(skill, bx, skillsY + 4, { width: bw, align: 'center' });
                bx += bw + 6;
            });
        }

        // ── Divider ───────────────────────────────────────────────
        const divY = H - 100;
        doc.moveTo(RP_X + 60, divY).lineTo(W - 44, divY)
            .lineWidth(0.75).strokeColor(GOLD_LT).stroke();

        // ── Bottom 3-column info strip ────────────────────────────
        const infoY = divY + 10;
        const colW = (RP_W - 80) / 3;
        const c1x = RP_X + 40;
        const c2x = c1x + colW;
        const c3x = c2x + colW;

        // Vertical dividers
        doc.moveTo(c2x, infoY).lineTo(c2x, infoY + 46).lineWidth(0.5).strokeColor(GOLD_LT).stroke();
        doc.moveTo(c3x, infoY).lineTo(c3x, infoY + 46).lineWidth(0.5).strokeColor(GOLD_LT).stroke();

        // Column 1: Date
        doc.fontSize(7).fillColor(GOLD).font('Helvetica-Bold')
            .text('DATE OF ISSUE', c1x, infoY, { width: colW, align: 'center', characterSpacing: 1 });
        doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
            .text(issuedDate, c1x, infoY + 12, { width: colW, align: 'center' });
        // Signature line
        doc.moveTo(c1x + 20, infoY + 38).lineTo(c1x + colW - 20, infoY + 38)
            .lineWidth(0.75).strokeColor(TEXT_LIGHT).stroke();
        doc.fontSize(7).fillColor(TEXT_LIGHT).font('Helvetica-Oblique')
            .text('Authorised Signatory', c1x, infoY + 40, { width: colW, align: 'center' });

        // Column 2: Certificate No
        doc.fontSize(7).fillColor(GOLD).font('Helvetica-Bold')
            .text('CERTIFICATE NO.', c2x, infoY, { width: colW, align: 'center', characterSpacing: 1 });
        doc.fontSize(9).fillColor(NAVY).font('Helvetica-Bold')
            .text(certNumber, c2x, infoY + 12, { width: colW, align: 'center' });
        doc.fontSize(7).fillColor(TEXT_LIGHT).font('Helvetica')
            .text('SkillBridge Official', c2x, infoY + 26, { width: colW, align: 'center' });

        // Column 3: Grade
        doc.fontSize(7).fillColor(GOLD).font('Helvetica-Bold')
            .text('GRADE AWARDED', c3x, infoY, { width: colW, align: 'center', characterSpacing: 1 });
        // Grade circle
        const gradeCircX = c3x + colW / 2;
        const gradeCircY = infoY + 26;
        doc.circle(gradeCircX, gradeCircY, 14).fill(NAVY);
        doc.circle(gradeCircX, gradeCircY, 14).lineWidth(1.5).strokeColor(GOLD).stroke();
        doc.fontSize(14).fillColor(GOLD_LT).font('Helvetica-Bold')
            .text(grade, gradeCircX - 7, gradeCircY - 9, { width: 14, align: 'center' });

        // ── Verification footer ───────────────────────────────────
        doc.fontSize(7).fillColor(TEXT_LIGHT).font('Helvetica')
            .text(`Verify authenticity at: skillbridge.com/verify  •  Verification Code: ${verificationCode}`,
                RP_X + 40, H - 22, { width: RP_W - 80, align: 'center' });

        // ── Watermark (light diagonal text) ──────────────────────
        doc.save();
        doc.rotate(-35, { origin: [CX, H / 2] });
        doc.fontSize(72).fillColor('#F0EBD8').font('Helvetica-Bold')
            .text('SKILLBRIDGE', CX - 180, H / 2 - 36, { width: 360, align: 'center' });
        doc.restore();

        doc.end();

    } catch (error) {
        console.error('Download certificate error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Server error while generating certificate PDF' });
        }
    }
};

// @desc    Unlock certificate - Create a pending certificate for payment (TESTING ONLY)
// @route   POST /api/certificates/:courseId/unlock
// @access  Private
exports.unlockCertificate = async(req, res) => {
    try {
        // Check if in development mode
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'This action is not allowed in production'
            });
        }

        const { courseId } = req.params;
        const userId = req.user.id;

        // Get enrollment and course
        const enrollment = await Enrollment.findOne({ userId, courseId });
        const course = await Internship.findById(courseId);

        if (!enrollment || !course) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment or course not found'
            });
        }

        // Check requirements
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
                message: 'Complete all requirements to unlock certificate'
            });
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({ userId, courseId });
        if (existingCertificate && existingCertificate.status === 'issued') {
            return res.status(400).json({
                success: false,
                message: 'Certificate already issued'
            });
        }

        // If certificate exists but is pending payment, return it
        if (existingCertificate && existingCertificate.status === 'pending-payment') {
            return res.status(200).json({
                success: true,
                message: 'Certificate unlock pending - awaiting payment',
                data: existingCertificate
            });
        }

        // Create new pending certificate
        const certificate = new Certificate({
            userId,
            courseId,
            enrollmentId: enrollment._id,
            status: 'pending-payment',
            grade: 'A',
            skills: course.skills || []
        });

        await certificate.save();

        res.status(200).json({
            success: true,
            message: 'Certificate unlock initiated - proceed with payment',
            data: certificate
        });
    } catch (error) {
        console.error('Unlock certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while unlocking certificate',
            error: error.message
        });
    }
};