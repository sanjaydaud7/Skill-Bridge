const Resource = require('../../models/Resource');
const Internship = require('../../models/Internship');
const { deleteFromCloudinary } = require('../../middleware/upload');

// Determine resource type from MIME type
const getMimeType = (mimetype = '', originalname = '') => {
    if (!mimetype && !originalname) return 'other';
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (
        mimetype.includes('word') || mimetype.includes('document') ||
        mimetype.includes('excel') || mimetype.includes('sheet') ||
        mimetype.includes('powerpoint') || mimetype.includes('presentation') ||
        mimetype.includes('text/plain')
    ) return 'document';
    return 'other';
};

// @desc   Upload resource (file or external link)
// @route  POST /api/admin/resources
// @access Admin
exports.uploadResource = async (req, res) => {
    try {
        const { title, description, internshipId, type } = req.body;

        if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

        let fileUrl, publicId, fileSize, mimeType, resourceType;

        if (type === 'link') {
            // External link — no file needed
            const { linkUrl } = req.body;
            if (!linkUrl) return res.status(400).json({ success: false, message: 'Link URL is required for link type' });
            fileUrl = linkUrl;
            publicId = null;
            fileSize = 0;
            mimeType = 'text/uri-list';
            resourceType = 'link';
        } else {
            // File upload
            if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
            fileUrl = req.file.path; // Cloudinary secure URL
            publicId = req.file.filename; // Cloudinary public_id
            fileSize = req.file.size || 0;
            mimeType = req.file.mimetype || '';
            resourceType = getMimeType(mimeType, req.file.originalname);
        }

        // Validate internship if provided
        if (internshipId) {
            const internship = await Internship.findById(internshipId);
            if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        const resource = await Resource.create({
            title: title.trim(),
            description: description ? description.trim() : '',
            type: resourceType,
            fileUrl,
            publicId,
            internshipId: internshipId || null,
            uploadedBy: req.user.id,
            fileSize,
            mimeType
        });

        await resource.populate([
            { path: 'uploadedBy', select: 'name email' },
            { path: 'internshipId', select: 'title category' }
        ]);

        res.status(201).json({ success: true, data: resource, message: 'Resource uploaded successfully' });
    } catch (err) {
        console.error('[Resource] Upload error:', err);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
};

// @desc   Get all resources (admin — paginated, filtered)
// @route  GET /api/admin/resources
// @access Admin
exports.getResources = async (req, res) => {
    try {
        const { search, type, internshipId, scope, page = 1, limit = 15 } = req.query;

        const query = {};
        if (type) query.type = type;
        if (scope === 'global') query.internshipId = null;
        else if (scope === 'internship') query.internshipId = { $ne: null };
        if (internshipId) query.internshipId = internshipId;
        if (search) query.title = { $regex: search, $options: 'i' };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [resources, total] = await Promise.all([
            Resource.find(query)
                .populate('uploadedBy', 'name email')
                .populate('internshipId', 'title category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Resource.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: resources,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc   Get single resource
// @route  GET /api/admin/resources/:id
// @access Admin
exports.getResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'name email')
            .populate('internshipId', 'title category');
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
        res.json({ success: true, data: resource });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc   Update resource metadata
// @route  PUT /api/admin/resources/:id
// @access Admin
exports.updateResource = async (req, res) => {
    try {
        const { title, description, internshipId, isActive } = req.body;

        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

        if (title !== undefined)       resource.title = title.trim();
        if (description !== undefined) resource.description = description.trim();
        if (isActive !== undefined)    resource.isActive = isActive;
        if (internshipId !== undefined) {
            if (internshipId === null || internshipId === '') {
                resource.internshipId = null;
            } else {
                const internship = await Internship.findById(internshipId);
                if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
                resource.internshipId = internshipId;
            }
        }

        await resource.save();
        await resource.populate([
            { path: 'uploadedBy', select: 'name email' },
            { path: 'internshipId', select: 'title category' }
        ]);

        res.json({ success: true, data: resource });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc   Toggle active/inactive
// @route  PUT /api/admin/resources/:id/toggle
// @access Admin
exports.toggleResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
        resource.isActive = !resource.isActive;
        await resource.save();
        res.json({ success: true, isActive: resource.isActive });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc   Delete resource (removes from Cloudinary too)
// @route  DELETE /api/admin/resources/:id
// @access Admin
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

        // Delete from Cloudinary if it's a stored file (not an external link)
        if (resource.publicId) {
            let cloudinaryType = 'raw';
            if (resource.type === 'image') cloudinaryType = 'image';
            else if (resource.type === 'video') cloudinaryType = 'video';
            await deleteFromCloudinary(resource.publicId, cloudinaryType);
        }

        await Resource.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Resource deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc   Get resource stats for admin dashboard
// @route  GET /api/admin/resources/stats
// @access Admin
exports.getResourceStats = async (req, res) => {
    try {
        const [total, active, byType, globalCount] = await Promise.all([
            Resource.countDocuments(),
            Resource.countDocuments({ isActive: true }),
            Resource.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
            Resource.countDocuments({ internshipId: null })
        ]);
        res.json({ success: true, data: { total, active, byType, globalCount, internshipCount: total - globalCount } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
