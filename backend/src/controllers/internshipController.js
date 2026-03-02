const Internship = require('../models/Internship');
const Enrollment = require('../models/Enrollment');
const Module = require('../models/Module');

// @desc    Get all active internships
// @route   GET /api/internships
// @access  Public
exports.getAllInternships = async(req, res) => {
    try {
        const { category, difficulty, search } = req.query;

        const filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        const internships = await Internship.find(filter)
            .select('-__v')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });
    } catch (error) {
        console.error('Get internships error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching internships'
        });
    }
};

// @desc    Get single internship by ID
// @route   GET /api/internships/:id
// @access  Public
exports.getInternshipById = async(req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        res.status(200).json({
            success: true,
            data: internship
        });
    } catch (error) {
        console.error('Get internship error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching internship'
        });
    }
};

// @desc    Get internship curriculum (modules)
// @route   GET /api/internships/:id/curriculum
// @access  Public (preview modules) / Private (all modules)
exports.getInternshipCurriculum = async(req, res) => {
    try {
        const courseId = req.params.id;

        // Check if user is enrolled (if authenticated)
        let isEnrolled = false;
        if (req.user) {
            const enrollment = await Enrollment.findOne({
                userId: req.user.id,
                courseId: courseId
            });
            isEnrolled = !!enrollment;
        }

        // If not enrolled, only show preview modules
        const filter = { courseId, isActive: true };
        if (!isEnrolled) {
            filter.isPreview = true;
        }

        const modules = await Module.find(filter)
            .sort({ order: 1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: modules.length,
            isEnrolled,
            data: modules
        });
    } catch (error) {
        console.error('Get curriculum error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching curriculum'
        });
    }
};

// @desc    Enroll in an internship
// @route   POST /api/internships/:id/enroll
// @access  Private
exports.enrollInternship = async(req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        // Check if internship exists
        const internship = await Internship.findById(courseId);
        if (!internship || !internship.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found or inactive'
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            userId,
            courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this internship'
            });
        }

        // Get first module
        const firstModule = await Module.findOne({ courseId })
            .sort({ order: 1 });

        // Create enrollment
        const enrollment = await Enrollment.create({
            userId,
            courseId,
            status: 'enrolled',
            currentModuleId: firstModule ? firstModule._id : null
        });

        // Update internship enrollment count
        await Internship.findByIdAndUpdate(courseId, {
            $inc: { enrollmentCount: 1 }
        });

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in internship',
            data: enrollment
        });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during enrollment'
        });
    }
};

// @desc    Get user's enrolled internships
// @route   GET /api/internships/enrolled
// @access  Private
exports.getEnrolledInternships = async(req, res) => {
    try {
        const enrollments = await Enrollment.find({
                userId: req.user.id,
                status: { $ne: 'dropped' }
            })
            .populate('courseId')
            .sort({ lastAccessedAt: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        console.error('Get enrolled internships error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching enrolled internships'
        });
    }
};