const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const TaskSubmission = require('../models/TaskSubmission');

// @desc  Get public portfolio by username (email prefix or name slug)
// @route GET /api/portfolio/:username
// @access Public
exports.getPortfolio = async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by name slug or email prefix
        const user = await User.findOne({
            $or: [
                { email: { $regex: new RegExp(`^${username}@`, 'i') } },
                { name: { $regex: new RegExp(username.replace(/-/g, ' '), 'i') } }
            ],
            isActive: true
        }).select('name email profilePicture createdAt');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Portfolio not found' });
        }

        // Get completed enrollments
        const enrollments = await Enrollment.find({
            userId: user._id,
            status: { $in: ['completed', 'certificate-purchased', 'in-progress'] }
        })
        .populate('courseId', 'title category skills duration difficulty thumbnail')
        .sort({ enrolledAt: -1 });

        // Get certificates
        const certificates = await Certificate.find({ userId: user._id, isValid: true })
            .populate('courseId', 'title category duration')
            .sort({ issuedAt: -1 });

        // Aggregate all unique skills
        const allSkills = new Set();
        enrollments.forEach(e => {
            if (e.courseId && e.courseId.skills) {
                e.courseId.skills.forEach(s => allSkills.add(s));
            }
        });
        certificates.forEach(c => {
            if (c.skills) c.skills.forEach(s => allSkills.add(s));
        });

        // Build stats
        const completedCount  = enrollments.filter(e => ['completed', 'certificate-purchased'].includes(e.status)).length;
        const inProgressCount = enrollments.filter(e => e.status === 'in-progress').length;
        const certCount       = certificates.length;

        // Format completed internships
        const completedInternships = enrollments
            .filter(e => e.courseId)
            .map(e => ({
                title:      e.courseId.title,
                category:   e.courseId.category,
                difficulty: e.courseId.difficulty,
                duration:   e.courseId.duration,
                thumbnail:  e.courseId.thumbnail,
                skills:     e.courseId.skills || [],
                status:     e.status,
                progress:   e.progress?.completionPercentage || 0,
                enrolledAt: e.enrolledAt,
                completedAt: e.completedAt
            }));

        const formattedCertificates = certificates.map(c => ({
            certificateNumber: c.certificateNumber,
            verificationCode:  c.verificationCode,
            internshipTitle:   c.courseId?.title,
            category:          c.courseId?.category,
            grade:             c.grade,
            skills:            c.skills,
            issuedAt:          c.issuedAt
        }));

        res.json({
            success: true,
            data: {
                student: {
                    name:           user.name,
                    profilePicture: user.profilePicture,
                    memberSince:    user.createdAt
                },
                stats: {
                    completedInternships: completedCount,
                    inProgressInternships: inProgressCount,
                    certificates: certCount,
                    skills: allSkills.size
                },
                skills:        [...allSkills],
                internships:   completedInternships,
                certificates:  formattedCertificates
            }
        });
    } catch (err) {
        console.error('[Portfolio] Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc  Get own portfolio (authenticated)
// @route GET /api/portfolio/me
// @access Private
exports.getMyPortfolio = async (req, res) => {
    req.params.username = req.user.email.split('@')[0];
    // Use the same logic but with the authenticated user's ID directly
    try {
        const user = await User.findById(req.user.id).select('name email profilePicture createdAt');

        const enrollments = await Enrollment.find({
            userId: user._id,
            status: { $in: ['completed', 'certificate-purchased', 'in-progress'] }
        })
        .populate('courseId', 'title category skills duration difficulty thumbnail')
        .sort({ enrolledAt: -1 });

        const certificates = await Certificate.find({ userId: user._id, isValid: true })
            .populate('courseId', 'title category duration')
            .sort({ issuedAt: -1 });

        const allSkills = new Set();
        enrollments.forEach(e => e.courseId?.skills?.forEach(s => allSkills.add(s)));
        certificates.forEach(c => c.skills?.forEach(s => allSkills.add(s)));

        const completedCount  = enrollments.filter(e => ['completed', 'certificate-purchased'].includes(e.status)).length;
        const inProgressCount = enrollments.filter(e => e.status === 'in-progress').length;

        const shareUrl = `${process.env.FRONTEND_URL}/portfolio/${encodeURIComponent(user.name.replace(/\s+/g, '-'))}`;

        res.json({
            success: true,
            data: {
                student: { name: user.name, profilePicture: user.profilePicture, memberSince: user.createdAt },
                shareUrl,
                stats: {
                    completedInternships: completedCount,
                    inProgressInternships: inProgressCount,
                    certificates: certificates.length,
                    skills: allSkills.size
                },
                skills: [...allSkills],
                internships: enrollments.filter(e => e.courseId).map(e => ({
                    title: e.courseId.title, category: e.courseId.category,
                    difficulty: e.courseId.difficulty, duration: e.courseId.duration,
                    thumbnail: e.courseId.thumbnail, skills: e.courseId.skills || [],
                    status: e.status, progress: e.progress?.completionPercentage || 0,
                    enrolledAt: e.enrolledAt, completedAt: e.completedAt
                })),
                certificates: certificates.map(c => ({
                    certificateNumber: c.certificateNumber, verificationCode: c.verificationCode,
                    internshipTitle: c.courseId?.title, category: c.courseId?.category,
                    grade: c.grade, skills: c.skills, issuedAt: c.issuedAt
                }))
            }
        });
    } catch (err) {
        console.error('[Portfolio] MyPortfolio Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
