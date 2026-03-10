const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    changePassword
} = require('../controllers/profileController');

router.get('/',         protect, getProfile);
router.put('/',         protect, updateProfile);
router.post('/picture', protect, uploadAvatar.single('profilePicture'), uploadProfilePicture);
router.put('/password', protect, changePassword);

module.exports = router;
