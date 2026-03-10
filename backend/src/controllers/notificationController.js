const Notification = require('../models/Notification');

// Global Socket.io instance (set by server.js)
let io = null;

const setIO = (socketIO) => { io = socketIO; };

/**
 * Create a notification and push it live via Socket.io
 */
const createNotification = async ({ userId, type, title, message, link = null, metadata = {} }) => {
    try {
        const notification = await Notification.create({ userId, type, title, message, link, metadata });

        // Emit to user's personal room if they're connected
        if (io) {
            io.to(`user_${userId}`).emit('notification', {
                _id: notification._id,
                type,
                title,
                message,
                link,
                isRead: false,
                createdAt: notification.createdAt
            });
        }

        return notification;
    } catch (err) {
        console.error('[Notification] Create failed:', err.message);
        return null;
    }
};

// ─── REST Controllers ─────────────────────────────────────────────────────────

// GET /api/notifications  — paginated list
exports.getNotifications = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip  = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ userId: req.user.id }),
            Notification.countDocuments({ userId: req.user.id, isRead: false })
        ]);

        res.json({ success: true, data: notifications, total, unreadCount, page });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.setIO = setIO;
exports.createNotification = createNotification;
