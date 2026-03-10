const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { previewResume, downloadResume } = require('../controllers/resumeController');

router.get('/preview',  protect, previewResume);
router.get('/download', protect, downloadResume);

module.exports = router;
