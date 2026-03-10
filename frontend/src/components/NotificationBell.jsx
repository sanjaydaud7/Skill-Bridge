import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

const typeIcon = {
    submission_approved: '✅',
    submission_rejected: '🔄',
    certificate_ready:   '🏆',
    enrollment_confirmed:'📋',
    task_graded:         '📝',
    project_graded:      '🎯',
    general:             '🔔'
};

const NotificationBell = () => {
    const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = (notif) => {
        if (!notif.isRead) markRead(notif._id);
        if (notif.link) { navigate(notif.link); setOpen(false); }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1)  return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    return (
        <div className="notif-wrapper" ref={ref}>
            <button className="notif-bell" onClick={() => setOpen(o => !o)} aria-label="Notifications">
                🔔
                {unreadCount > 0 && <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <button className="notif-read-all" onClick={markAllRead}>Mark all read</button>
                        )}
                    </div>

                    <div className="notif-list">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">
                                <span>🔕</span>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                                    onClick={() => handleClick(n)}
                                >
                                    <span className="notif-icon">{typeIcon[n.type] || '🔔'}</span>
                                    <div className="notif-content">
                                        <p className="notif-title">{n.title}</p>
                                        <p className="notif-msg">{n.message}</p>
                                        <span className="notif-time">{timeAgo(n.createdAt)}</span>
                                    </div>
                                    <button
                                        className="notif-delete"
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                                        title="Dismiss"
                                    >×</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
