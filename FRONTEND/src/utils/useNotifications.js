import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import api from "./api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

let socket = null;

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get(`/notifications`);
            const list = Array.isArray(res) ? res : (res.notifications || []);
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.is_read).length);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    }, [user]);

    const addToast = useCallback((notif) => {
        const id = Date.now();
        setToasts(prev => [...prev, { ...notif, id }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    useEffect(() => {
        if (!user) return;

        // Initialize socket if not already done
        if (!socket) {
            socket = io(SOCKET_URL, {
                transports: ["websocket"],
                autoConnect: true,
            });

            socket.on("connect", () => {
                console.log("Connected to notification socket");
                socket.emit("authenticate", { user_id: user.id });
            });

            socket.on("new_notification", (notif) => {
                setNotifications(prev => [notif, ...prev]);
                setUnreadCount(prev => prev + 1);
                addToast(notif);
            });
        }

        fetchNotifications();

        return () => {
            // We usually don't want to disconnect global socket on hook unmount
            // unless we're sure it's not needed elsewhere.
        };
    }, [user, fetchNotifications, addToast]);

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post(`/notifications/mark-all-read`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    };

    return {
        notifications,
        unreadCount,
        toasts,
        markAsRead,
        markAllAsRead,
        removeToast: (id) => setToasts(prev => prev.filter(t => t.id !== id))
    };
};
