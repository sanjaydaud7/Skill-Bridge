const express = require('express');
const router = express.Router();
const {
    getProjectDetails,
    submitProject,
    getSubmissionStatus
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage for screenshots
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: process.env.CLOUDINARY_FOLDER + '/projects',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        resource_type: 'image'
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
});

// All routes are protected
router.use(protect);

router.get('/:courseId', getProjectDetails);
router.post('/:courseId/submit', upload.array('screenshots', 5), submitProject);
router.get('/:courseId/submission', getSubmissionStatus);

module.exports = router;