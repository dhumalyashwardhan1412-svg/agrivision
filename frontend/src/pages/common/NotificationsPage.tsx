import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Filter,
  ArrowRightLeft,
  Package,
  Star,
  AlertTriangle,
  FileText,
  ShieldCheck,
  WifiOff,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { notificationsApi } from '../../services/notificationsApi';
import { NotificationItem, NotificationPriority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { cacheDataItems, getCachedDataItems } from '../../utils/offlineStorage';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      if (navigator.onLine) {
        const data = await notificationsApi.getNotifications({ limit: 100 });
        setNotifications(data);
        setLastUpdated(new Date().toLocaleTimeString());
        // Cache for offline
        try {
          await cacheDataItems('notifications', data);
        } catch {
          // Ignore cache errors
        }
      } else {
        // Load from cache
        const cached = await getCachedDataItems<NotificationItem>('notifications');
        setNotifications(cached.items || []);
        setLastUpdated(cached.lastUpdated ? new Date(cached.lastUpdated).toLocaleTimeString() : null);
      }
    } catch (err) {
      console.warn('Network fetch failed, falling back to cache:', err);
      try {
        const cached = await getCachedDataItems<NotificationItem>('notifications');
        setNotifications(cached.items || []);
      } catch {
        // fallback empty
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    const key = (type || category || '').toUpperCase();
    if (key.includes('OFFER')) return <ArrowRightLeft className="w-5 h-5 text-emerald-600" />;
    if (key.includes('ORDER') || key.includes('DELIVERY')) return <Package className="w-5 h-5 text-blue-600" />;
    if (key.includes('REVIEW') || key.includes('RATING')) return <Star className="w-5 h-5 text-amber-500 fill-amber-500" />;
    if (key.includes('STOCK')) return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    if (key.includes('SCHEME')) return <FileText className="w-5 h-5 text-purple-600" />;
    if (key.includes('VERIF')) return <ShieldCheck className="w-5 h-5 text-sky-600" />;
    if (key.includes('SYNC') || key.includes('OFFLINE')) return <WifiOff className="w-5 h-5 text-slate-500" />;
    return <Bell className="w-5 h-5 text-emerald-600" />;
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 uppercase">
            Urgent
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
            Warning
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">
            Success
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
            Info
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Filter categories
  const categories = [
    { id: 'ALL', label: 'All Notifications' },
    { id: 'OFFER', label: 'Offers & Trade' },
    { id: 'ORDER', label: 'Orders & Shipments' },
    { id: 'STOCK', label: 'Inventory & Stock' },
    { id: 'REVIEW', label: 'Ratings & Reviews' },
    { id: 'SYSTEM', label: 'System & Alerts' }
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (unreadOnly && n.is_read) return false;
    if (selectedCategory !== 'ALL') {
      const target = (n.notification_type + ' ' + n.category).toUpperCase();
      if (!target.includes(selectedCategory)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Communications Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time trade updates, purchase offers, inventory warnings, verified ratings, and system alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}

          <button
            onClick={() => fetchNotifications(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> Showing cached notifications from local storage. Actions will sync once reconnected.
            </span>
          </div>
          {lastUpdated && (
            <span className="text-[11px] text-amber-700 font-medium">Last synced: {lastUpdated}</span>
          )}
        </div>
      )}

      {/* Controls Bar: Search & Category Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Unread Only Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUnreadOnly((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                unreadOnly
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Unread Only ({unreadCount})</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3 shadow-sm">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium">Loading your notification feed...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3 shadow-sm">
          <Inbox className="w-12 h-12 text-slate-200 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-slate-700">No notifications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {unreadOnly
              ? 'You have caught up with all notifications!'
              : 'There are no notifications matching your current filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                notif.is_read
                  ? 'bg-white border-slate-200 shadow-xs opacity-90 hover:opacity-100'
                  : 'bg-emerald-50/30 border-emerald-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon Box */}
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                    notif.is_read
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-white shadow-xs border border-emerald-200 text-emerald-700'
                  }`}
                >
                  {getNotificationIcon(notif.notification_type, notif.category)}
                </div>

                {/* Content Body */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-extrabold ${
                          notif.is_read ? 'text-slate-800' : 'text-slate-900'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      {getPriorityBadge(notif.priority)}
                      {!notif.is_read && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          New
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(notif.created_at)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Metadata / Related Entity Tag */}
                  {notif.related_entity_type && (
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {notif.related_entity_type}:
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {notif.related_entity_id || 'Reference'}
                      </span>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {(notif.action_url || notif.link_url) && (
                        <button
                          onClick={() => {
                            const url = notif.action_url || notif.link_url;
                            if (url) {
                              if (!notif.is_read) handleMarkAsRead(notif.id);
                              if (url.startsWith('http')) window.open(url, '_blank');
                              else navigate(url);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                        >
                          <span>Open & Take Action</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark as Read</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
