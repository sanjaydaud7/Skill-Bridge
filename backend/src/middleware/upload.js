const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary (reads from .env automatically via cloudinary.config)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage — files land in skillbridge/resources/<type>
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let folder = `${process.env.CLOUDINARY_FOLDER || 'skillbridge'}/resources`;
        let resourceType = 'auto';

        const mime = file.mimetype;
        if (mime.startsWith('video/')) {
            folder += '/videos';
            resourceType = 'video';
        } else if (mime.startsWith('image/')) {
            folder += '/images';
            resourceType = 'image';
        } else {
            folder += '/documents';
            resourceType = 'raw';
        }

        return {
            folder,
            resource_type: resourceType,
            // Preserve original file extension
            format: undefined,
            public_id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
        };
    }
});

// File filter — allow PDFs, images, Word/Excel/PPT, videos
const fileFilter = (req, file, cb) => {
    const allowed = [
        // PDF
        'application/pdf',
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Word
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Excel
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // PowerPoint
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Videos
        'video/mp4', 'video/quicktime', 'video/webm', 'video/avi',
        // Other
        'application/zip', 'text/plain'
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// ─── Avatar upload (profile pictures) ────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: `${process.env.CLOUDINARY_FOLDER || 'skillbridge'}/avatars`,
        resource_type: 'image',
        format: 'webp',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        public_id: `avatar_${req.user.id}_${Date.now()}`
    })
});

const avatarFileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed for profile pictures'), false);
};

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: avatarFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Helper: delete a file from Cloudinary by public_id
const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.error('[Cloudinary] Delete failed:', err.message);
    }
};

module.exports = { upload, uploadAvatar, deleteFromCloudinary, cloudinary };
