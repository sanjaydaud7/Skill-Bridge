import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const NotificationProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef(null);

    // Fetch existing notifications from server
    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(`${API}/api/notifications?limit=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error('[Notifications] Fetch failed:', err.message);
        }
    }, [token]);

    // Connect Socket.io when user logs in
    useEffect(() => {
        if (!user || !token) return;

        const s = io(API, { transports: ['websocket', 'polling'] });
        s.on('connect', () => {
            s.emit('join', user.id || user._id);
        });

        // New notification pushed from server
        s.on('notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socketRef.current = s;
        fetchNotifications();

        return () => { s.disconnect(); };
    }, [user, token, fetchNotifications]);

    const markRead = async (id) => {
        try {
            await axios.patch(`${API}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            await axios.patch(`${API}/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${API}/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const removed = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (removed && !removed.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, deleteNotification, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
