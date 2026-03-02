const User = require('../../models/User');
const Enrollment = require('../../models/Enrollment');
const Certificate = require('../../models/Certificate');
const Payment = require('../../models/Payment');
const AdminLog = require('../../models/AdminLog');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async(req, res) => {
    try {
        const { role, status, search, page = 1, limit = 10 } = req.query;

        const query = {};
        if (role) query.role = role;
        if (status) query.isActive = status === 'active';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user enrollments
        const enrollments = await Enrollment.find({ userId: user._id })
            .populate('courseId', 'title thumbnail')
            .sort({ enrolledAt: -1 });

        // Get user certificates
        const certificates = await Certificate.find({ userId: user._id })
            .populate('courseId', 'title')
            .sort({ issuedAt: -1 });

        // Get user payments
        const payments = await Payment.find({ userId: user._id })
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                user,
                enrollments,
                certificates,
                payments
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow password update through this endpoint
        const { password, ...updateData } = req.body;

        Object.assign(user, updateData);
        await user.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'update',
            targetModel: 'User',
            targetId: user._id,
            description: `Updated user: ${user.name}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.changeUserRole = async(req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate role
        if (!['student', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        // Prevent changing own role
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        // Check if this is the last admin
        if (user.role === 'admin' && role !== 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot demote the last admin'
                });
            }
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'update',
            targetModel: 'User',
            targetId: user._id,
            changes: { oldRole, newRole: role },
            description: `Changed role from ${oldRole} to ${role} for user: ${user.name}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing user role',
            error: error.message
        });
    }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deactivating own account
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'status_change',
            targetModel: 'User',
            targetId: user._id,
            description: `${user.isActive ? 'Activated' : 'Deactivated'} user: ${user.name}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling user status',
            error: error.message
        });
    }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting own account
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Check for active enrollments
        const activeEnrollments = await Enrollment.countDocuments({
            userId: user._id,
            status: { $in: ['enrolled', 'in-progress'] }
        });

        if (activeEnrollments > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete user with ${activeEnrollments} active enrollments. Please complete or unenroll first.`
            });
        }

        // Soft delete
        user.isActive = false;
        user.email = `deleted_${user._id}@deleted.com`; // Prevent email conflicts
        await user.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'delete',
            targetModel: 'User',
            targetId: user._id,
            description: `Deleted user: ${user.name}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};
