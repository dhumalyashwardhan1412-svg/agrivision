import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ArrowRightLeft,
  Package,
  Star,
  AlertTriangle,
  FileText,
  ShieldCheck,
  WifiOff,
  Clock,
  ExternalLink
} from 'lucide-react';
import { notificationsApi } from '../../services/notificationsApi';
import { NotificationItem, NotificationPriority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { cacheDataItems } from '../../utils/offlineStorage';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Ignore network errors gracefully
    }
  };

  // Fetch notifications for dropdown
  const fetchRecentNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await notificationsApi.getNotifications({ limit: 6 });
      setNotifications(items);
      // Cache in background for offline viewing
      try {
        await cacheDataItems('notifications', items);
      } catch {
        // Offline cache error non-blocking
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and 30s poll
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // When dropdown opens, fetch latest notifications & count
  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await notificationsApi.markAsRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch {
        // Continue navigation even if read call fails
      }
    }
    setIsOpen(false);
    const targetUrl = notif.action_url || notif.link_url;
    if (targetUrl) {
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        window.open(targetUrl, '_blank');
      } else {
        navigate(targetUrl);
      }
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    const key = (type || category || '').toUpperCase();
    if (key.includes('OFFER')) return <ArrowRightLeft className="w-4 h-4 text-emerald-600" />;
    if (key.includes('ORDER') || key.includes('DELIVERY')) return <Package className="w-4 h-4 text-blue-600" />;
    if (key.includes('REVIEW') || key.includes('RATING')) return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
    if (key.includes('STOCK')) return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    if (key.includes('SCHEME')) return <FileText className="w-4 h-4 text-purple-600" />;
    if (key.includes('VERIF')) return <ShieldCheck className="w-4 h-4 text-sky-600" />;
    if (key.includes('SYNC') || key.includes('OFFLINE')) return <WifiOff className="w-4 h-4 text-slate-500" />;
    return <Bell className="w-4 h-4 text-emerald-600" />;
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700 uppercase">Urgent</span>;
      case 'WARNING':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">Warning</span>;
      case 'SUCCESS':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase">Success</span>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffSecs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSecs < 60) return 'Just now';
      const mins = Math.floor(diffSecs / 60);
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  const getNotificationsPath = () => {
    if (!user) return '/notifications';
    const role = user.role?.toLowerCase();
    if (role === 'farmer') return '/farmer/notifications';
    if (role === 'customer') return '/customer/notifications';
    if (role === 'shopkeeper') return '/shopkeeper/notifications';
    if (role === 'admin') return '/admin/notifications';
    return '/notifications';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm tracking-wide">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Read All</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-200 stroke-1" />
                <p className="font-medium text-slate-500">No notifications right now</p>
                <p className="text-[11px] text-slate-400">You will receive real-time updates for offers, orders, and alerts.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex gap-3 items-start cursor-pointer transition-colors ${
                    n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                  }`}
                >
                  {/* Icon Box */}
                  <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                    n.is_read ? 'bg-slate-100 text-slate-600' : 'bg-white shadow-xs border border-emerald-100'
                  }`}>
                    {getNotificationIcon(n.notification_type, n.category)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className={`text-xs font-bold truncate ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {n.title}
                      </h5>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getPriorityBadge(n.priority)}
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(n.created_at)}
                      </span>
                      {(n.action_url || n.link_url) && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              to={getNotificationsPath()}
              onClick={() => setIsOpen(false)}
              className="inline-block text-xs font-bold text-emerald-700 hover:text-emerald-800 py-1 px-3 rounded-lg hover:bg-emerald-100/50 transition"
            >
              View All Notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
