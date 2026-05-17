import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiUsers, HiPlus, HiSearch, HiFilter, HiX, HiBell } from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';
import Swal from 'sweetalert2';

interface User {
  id: string | number;
  name: string;
  email: string;
  status: string;
  role: string;
}

const UsersContent: React.FC = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    receiverId: '',
    titleAr: '',
    bodyAr: '',
  });

  const users: User[] = [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', status: 'نشط', role: 'مستخدم' },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', status: 'نشط', role: 'مستخدم' },
    { id: 3, name: 'علي حسن', email: 'ali@example.com', status: 'غير نشط', role: 'مستخدم' },
    { id: 4, name: 'سارة أحمد', email: 'sara@example.com', status: 'نشط', role: 'مستخدم' },
  ];

  const openNotificationModal = (userId: string | number | null = null) => {
    setSelectedUserId(userId ? String(userId) : null);
    setNotificationForm({
      receiverId: userId ? String(userId) : '',
      titleAr: '',
      bodyAr: '',
    });
    setFormError(null);
    setIsNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false);
    setSelectedUserId(null);
    setNotificationForm({
      receiverId: '',
      titleAr: '',
      bodyAr: '',
    });
    setFormError(null);
  };

  const handleNotificationInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNotificationForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notificationForm.receiverId.trim() || !notificationForm.titleAr.trim() || !notificationForm.bodyAr.trim()) {
      setFormError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await axiosInstance.post('/admin/dashboard/send-notification', {
        receiverId: notificationForm.receiverId.trim(),
        titleAr: notificationForm.titleAr.trim(),
        bodyAr: notificationForm.bodyAr.trim(),
      });

      await Swal.fire({
        title: 'تم الإرسال',
        text: 'تم إرسال الإشعار بنجاح',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      closeNotificationModal();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(errorMessage || 'فشل إرسال الإشعار');
      await Swal.fire({
        title: 'فشل الإرسال',
        text: errorMessage || 'حدث خطأ أثناء إرسال الإشعار',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
          <p className="text-gray-600">إدارة جميع المستخدمين في النظام</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openNotificationModal(null)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <HiBell className="w-5 h-5" />
            إرسال إشعار
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <HiPlus className="w-5 h-5 inline ml-2" />
            إضافة مستخدم
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن مستخدم..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <HiFilter className="w-5 h-5" />
            تصفية
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">قائمة المستخدمين</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <HiUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openNotificationModal(user.id)}
                    className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    title="إرسال إشعار"
                  >
                    <HiBell className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{user.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-[999] bg-#022949 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeNotificationModal}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedUserId ? 'إرسال إشعار للمستخدم' : 'إرسال إشعار'}
              </h3>
              <button onClick={closeNotificationModal} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="px-5 py-4 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{formError}</div>
              )}

              {selectedUserId && (() => {
                const user = users.find((u) => String(u.id) === selectedUserId);
                return user ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">المستخدم:</p>
                    <p className="text-base font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                ) : null;
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  معرف المستخدم (Receiver ID) *
                </label>
                <input
                  type="text"
                  name="receiverId"
                  value={notificationForm.receiverId}
                  onChange={handleNotificationInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل معرف المستخدم"
                  required
                  disabled={!!selectedUserId}
                />
                {selectedUserId && (
                  <p className="text-xs text-gray-500 mt-1">تم تحديد المستخدم تلقائياً</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإشعار (عربي) *</label>
                <input
                  type="text"
                  name="titleAr"
                  value={notificationForm.titleAr}
                  onChange={handleNotificationInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل عنوان الإشعار"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">محتوى الإشعار (عربي) *</label>
                <textarea
                  name="bodyAr"
                  value={notificationForm.bodyAr}
                  onChange={handleNotificationInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="أدخل محتوى الإشعار"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeNotificationModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting || !notificationForm.receiverId.trim() || !notificationForm.titleAr.trim() || !notificationForm.bodyAr.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    submitting || !notificationForm.receiverId.trim() || !notificationForm.titleAr.trim() || !notificationForm.bodyAr.trim()
                      ? 'bg-green-600/60 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-colors`}
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UsersContent; 