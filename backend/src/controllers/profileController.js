const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Helper — strip sensitive fields
const safeUser = (u) => ({
    id:             u._id,
    name:           u.name,
    email:          u.email,
    role:           u.role,
    profilePicture: u.profilePicture,
    bio:            u.bio,
    phone:          u.phone,
    location:       u.location,
    website:        u.website,
    linkedin:       u.linkedin,
    github:         u.github,
    createdAt:      u.createdAt
});

// @desc  Get current user profile
// @route GET /api/profile
// @access Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, user: safeUser(user) });
    } catch (err) {
        console.error('[Profile] getProfile:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc  Update profile details (no password change here)
// @route PUT /api/profile
// @access Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, bio, location, website, linkedin, github } = req.body;

        // Check email uniqueness if email is changing
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Email already in use by another account' });
            }
        }

        const update = {};
        if (name     !== undefined) update.name     = name.trim();
        if (email    !== undefined) update.email    = email.toLowerCase().trim();
        if (phone    !== undefined) update.phone    = phone.trim();
        if (bio      !== undefined) update.bio      = bio.trim();
        if (location !== undefined) update.location = location.trim();
        if (website  !== undefined) update.website  = website.trim();
        if (linkedin !== undefined) update.linkedin = linkedin.trim();
        if (github   !== undefined) update.github   = github.trim();

        const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });

        res.json({ success: true, message: 'Profile updated successfully', user: safeUser(user) });
    } catch (err) {
        console.error('[Profile] updateProfile:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// @desc  Upload / replace profile picture via Cloudinary
// @route POST /api/profile/picture
// @access Private
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        // req.file.path is the Cloudinary secure URL when using multer-storage-cloudinary
        const imageUrl = req.file.path;

        // Delete old picture from Cloudinary if it's a cloudinary URL
        const user = await User.findById(req.user.id);
        if (user.profilePicture && user.profilePicture.includes('cloudinary.com')) {
            try {
                // Extract public_id from URL
                const parts = user.profilePicture.split('/');
                const filenameWithExt = parts[parts.length - 1];
                const filename = filenameWithExt.split('.')[0];
                const folder = parts.slice(parts.indexOf('skillbridge')).slice(0, -1).join('/');
                const publicId = `${folder}/${filename}`;
                await cloudinary.uploader.destroy(publicId);
            } catch (e) {
                console.warn('[Profile] Could not delete old avatar from Cloudinary:', e.message);
            }
        }

        // Save URL to MongoDB
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: imageUrl },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Profile picture updated',
            profilePicture: imageUrl,
            user: safeUser(updated)
        });
    } catch (err) {
        console.error('[Profile] uploadProfilePicture:', err);
        res.status(500).json({ success: false, message: 'Server error uploading image' });
    }
};

// @desc  Change password
// @route PUT /api/profile/password
// @access Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('[Profile] changePassword:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
