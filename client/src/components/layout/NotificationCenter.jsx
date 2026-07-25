import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, CheckCheck, X } from 'lucide-react';
import io from 'socket.io-client';
import axiosInstance from '../../api/axiosInstance.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fetch initial notifications list
  const fetchNotifications = async () => {
    try {
      // Fetch initial notifications from database (we can reuse NGO or dashboard notifications,
      // but let's query a general endpoint or fallback gracefully to empty array)
      const res = await axiosInstance.get('/auth/notifications'); // In-app notification endpoint
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.log('[Notifications] Fallback to empty list.');
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Connect to Socket server
    const socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token') || '',
      },
    });

    // Listen to real-time notifications dispatch events
    socket.on('notification:received', (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Handle outside clicks to close notifications center
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await axiosInstance.patch('/auth/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      // Fallback local updates
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-accent transition-all text-muted-foreground focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl text-xs text-foreground">
          <div className="flex justify-between items-center border-b border-border pb-2.5 mb-2.5">
            <span className="font-bold text-sm">Announcements</span>
            <div className="flex gap-2">
              <button
                onClick={markAllRead}
                className="text-[10px] text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" /> Read All
              </button>
              <button
                onClick={clearAll}
                className="text-[10px] text-zinc-500 font-semibold hover:text-zinc-300"
                title="Clear list"
              >
                Clear
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 font-medium">No announcements logged.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${
                    n.is_read
                      ? 'bg-zinc-950/20 border-white/5 opacity-60'
                      : 'bg-indigo-500/5 border-indigo-500/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <strong className="text-white text-[11px] truncate leading-tight w-[170px]">{n.title}</strong>
                    {!n.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
