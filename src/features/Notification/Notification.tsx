import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/AxiosIntance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type FilterType = 'all' | 'unread';

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [markingId, setMarkingId] = useState<number | null>(null);

  // لمنع تكرار التوست
  const seenIds = useRef<Set<number>>(new Set());

  /* ======================
     INIT LOAD – كل الـ GETs
  ====================== */
  const initLoad = async () => {
    try {
      setLoading(true);

      const [listRes, unreadRes, combinedRes] = await Promise.all([
        axiosInstance.get('/Notification/my-notifications'),
        axiosInstance.get('/Notification/my-notifications/unread/count'),
        axiosInstance.get('/Notification/my-notifications-and-count'),
      ]);

      const list: NotificationItem[] =
        Array.isArray(listRes.data)
          ? listRes.data
          : listRes.data?.data ?? [];

      // إزالة التكرار
      const uniqueList = Array.from(
        new Map(list.map(n => [n.id, n])).values()
      );

      const unreadRaw =
        unreadRes.data?.data ??
        unreadRes.data ??
        combinedRes.data?.unreadNotificationsCount ??
        0;

      const safeUnread =
        typeof unreadRaw === 'number' && !isNaN(unreadRaw)
          ? unreadRaw
          : 0;

      setNotifications(uniqueList);
      setUnreadCount(safeUnread);

      uniqueList.forEach(n => seenIds.current.add(n.id));
    } catch (error) {
      console.error(error);
      toast.error('فشل تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     POLLING + TOAST
  ====================== */
  const checkForNewNotifications = async () => {
    try {
      const res = await axiosInstance.get('/Notification/my-notifications');

      const data: NotificationItem[] =
        Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? [];

      const unique = Array.from(
        new Map(data.map(n => [n.id, n])).values()
      );

      unique.forEach(n => {
        if (!n.isRead && !seenIds.current.has(n.id)) {
          seenIds.current.add(n.id);

          toast.info(
            <div>
              <p className="font-bold">{n.title}</p>
              <p className="text-sm">{n.message}</p>
            </div>,
            { autoClose: 6000 }
          );
        }
      });

      setNotifications(unique);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initLoad();
    const interval = setInterval(checkForNewNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  /* ======================
     MARK AS READ
  ====================== */
  const handleMarkAsRead = async (id: number) => {
    try {
      setMarkingId(id);
      await axiosInstance.put(
        `/Notification/my-notifications/mark-as-read/${id}`
      );

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch {
      toast.error('فشل تحديث الإشعار');
    } finally {
      setMarkingId(null);
    }
  };

  /* ======================
     LOADING
  ====================== */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-10 h-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  /* ======================
     FILTER + SEARCH
  ====================== */
  const filtered = notifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false;

    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      n.title.toLowerCase().includes(term) ||
      n.message.toLowerCase().includes(term)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto p-6"
    >
      <ToastContainer position="top-left" rtl newestOnTop />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">الإشعارات</h1>
          <p className="text-gray-500 mt-1">
            متابعة وإدارة إشعارات النظام
          </p>
        </div>

        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
          غير مقروء: {unreadCount}
        </span>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            غير المقروء
          </button>
        </div>

        <input
          type="text"
          placeholder="ابحث في الإشعارات..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow p-4">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            لا يوجد إشعارات
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map(item => (
              <li
                key={`notification-${item.id}`}
                className={`p-4 border rounded flex justify-between ${
                  item.isRead
                    ? 'bg-gray-50'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>

                {!item.isRead && (
                  <button
                    disabled={markingId === item.id}
                    onClick={() => handleMarkAsRead(item.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {markingId === item.id ? '...' : 'مقروء'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default Notification;
