const Resource = require('../models/Resource');
const Enrollment = require('../models/Enrollment');

// @desc   Get resources available to the logged-in student
//         → Global resources + resources for enrolled internships
// @route  GET /api/resources
// @access Private
exports.getStudentResources = async (req, res) => {
    try {
        const { type, internshipId } = req.query;

        // Get all internships the student is enrolled in
        const enrollments = await Enrollment.find({
            userId: req.user.id,
            status: { $ne: 'dropped' }
        }).select('courseId');

        const enrolledIds = enrollments.map(e => e.courseId);

        // Build query: global OR enrolled internship
        const query = {
            isActive: true,
            $or: [
                { internshipId: null },
                { internshipId: { $in: enrolledIds } }
            ]
        };

        if (type) query.type = type;
        if (internshipId) {
            // Filter to a specific internship (must be enrolled)
            const isEnrolled = enrolledIds.some(id => id.toString() === internshipId);
            if (!isEnrolled) {
                return res.status(403).json({ success: false, message: 'Not enrolled in this internship' });
            }
            query.$or = [{ internshipId: null }, { internshipId }];
        }

        const resources = await Resource.find(query)
            .populate('internshipId', 'title category')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: resources });
    } catch (err) {
        console.error('[Resource] getStudentResources error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc   Get resources for a specific internship (for InternshipDetail page)
// @route  GET /api/resources/internship/:internshipId
// @access Private
exports.getResourcesByInternship = async (req, res) => {
    try {
        const { internshipId } = req.params;

        // Check enrollment
        const enrollment = await Enrollment.findOne({
            userId: req.user.id,
            courseId: internshipId,
            status: { $ne: 'dropped' }
        });

        if (!enrollment) {
            return res.status(403).json({ success: false, message: 'Not enrolled in this internship' });
        }

        // Return internship-specific + global resources
        const resources = await Resource.find({
            isActive: true,
            $or: [{ internshipId }, { internshipId: null }]
        })
            .populate('internshipId', 'title category')
            .sort({ internshipId: -1, createdAt: -1 });

        res.json({ success: true, data: resources });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc   Track resource download/open
// @route  POST /api/resources/:id/download
// @access Private
exports.trackDownload = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            { $inc: { downloadCount: 1 } },
            { new: true }
        );
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
        res.json({ success: true, fileUrl: resource.fileUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
