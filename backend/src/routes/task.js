const express = require('express');
const router = express.Router();
const {
    getCourseTasks,
    getTaskById,
    submitTask,
    getUserSubmissions
} = require('../controllers/taskController');
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

// Configure multer storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: process.env.CLOUDINARY_FOLDER + '/tasks',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'zip'],
        resource_type: 'auto'
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// All routes are protected
router.use(protect);

router.get('/:courseId', getCourseTasks);
router.get('/:courseId/:taskId', getTaskById);
router.post('/:courseId/:taskId/submit', upload.single('file'), submitTask);
router.get('/:courseId/submissions/all', getUserSubmissions);

module.exports = router;