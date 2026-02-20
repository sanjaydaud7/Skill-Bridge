const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    changeUserRole,
    toggleUserStatus,
    deleteUser
} = require('../../controllers/admin/adminUserController');
const { protect, authorize } = require('../../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User routes
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.put('/:id/role', changeUserRole);
router.put('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;