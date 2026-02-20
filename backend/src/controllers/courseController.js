const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Module = require('../models/Module');

// @desc    Get all active courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async(req, res) => {
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

        const courses = await Course.find(filter)
            .select('-__v')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching courses'
        });
    }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async(req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching course'
        });
    }
};

// @desc    Get course curriculum (modules)
// @route   GET /api/courses/:id/curriculum
// @access  Public (preview modules) / Private (all modules)
exports.getCourseCurriculum = async(req, res) => {
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

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollCourse = async(req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course || !course.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or inactive'
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
                message: 'Already enrolled in this course'
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

        // Update course enrollment count
        await Course.findByIdAndUpdate(courseId, {
            $inc: { enrollmentCount: 1 }
        });

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
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

// @desc    Get user's enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
exports.getEnrolledCourses = async(req, res) => {
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
        console.error('Get enrolled courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching enrolled courses'
        });
    }
};