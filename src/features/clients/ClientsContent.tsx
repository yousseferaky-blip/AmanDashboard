import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiUserGroup, HiSearch, HiFilter, HiTrash, HiBell, HiX, HiPencil, HiArrowDown, HiArrowUp } from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../assets/LoadingSpinner';

type CustomerDto = {
  id: string;
  isEmailVerified: string;
  name: string | null;
  email: string | null;
  phoneNumber?: string;
  profileImage: string | null;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string | null;
  fcmToken: string | null;
  token: string | null;
  role: string;
  driverStatus: string | null;
};

const ClientsContent: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    receiverId: '',
    titleAr: '',
    bodyAr: '',
  });
  const [notificationMode, setNotificationMode] = useState<'specific' | 'all'>('specific');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    profileImage: null as File | null,
  });
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedWalletUserId, setSelectedWalletUserId] = useState<string | null>(null);
  const [submittingWallet, setSubmittingWallet] = useState(false);
  const [walletFormError, setWalletFormError] = useState<string | null>(null);
  const [depositForm, setDepositForm] = useState({
    amount: '',
    paymentReference: '',
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    description: '',
    withdrawalDetails: '',
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get('/Users/customers');
        const list: CustomerDto[] = Array.isArray(data?.data) ? data.data : [];
        setCustomers(list);
      } catch {
        setError('فشل تحميل العملاء');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.trim().toLowerCase();
    return customers.filter((c) => 
      (c.name || '').toLowerCase().includes(q) || 
      (c.phoneNumber || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [customers, query]);

  const openNotificationModal = (clientId: string | null = null, mode: 'specific' | 'all' = 'specific') => {
    setSelectedClientId(clientId);
    setNotificationMode(mode);
    setNotificationForm({
      receiverId: clientId || '',
      titleAr: '',
      bodyAr: '',
    });
    setFormError(null);
    setIsNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false);
    setSelectedClientId(null);
    setNotificationMode('specific');
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

  const openEditModal = (clientId: string) => {
    const client = customers.find((c) => c.id === clientId);
    if (client) {
      setEditingClientId(clientId);
      setEditForm({
        name: client.name || '',
        phone: client.phoneNumber || '',
        profileImage: null,
      });
      setPreviewImageUrl(client.profileImage || null);
      setEditFormError(null);
      setIsEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingClientId(null);
    setEditForm({
      name: '',
      phone: '',
      profileImage: null,
    });
    setPreviewImageUrl(null);
    setEditFormError(null);
  };

  const handleEditInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditFormError(null);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        setEditFormError('يرجى اختيار ملف صورة صالح');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setEditFormError('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      setEditForm((prev) => ({ ...prev, profileImage: file }));
      if (previewImageUrl && previewImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(file ? URL.createObjectURL(file) : null);
      setEditFormError(null);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.name.trim() || !editForm.phone.trim()) {
      setEditFormError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setSubmittingEdit(true);
    setEditFormError(null);

    try {
      const formData = new FormData();
      formData.append('Name', editForm.name.trim());
      formData.append('Phone', editForm.phone.trim());
      if (editForm.profileImage) {
        formData.append('ProfileImage', editForm.profileImage);
      }

      await axiosInstance.put(`/admin/dashboard/update/${editingClientId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await Swal.fire({
        title: 'تم التحديث',
        text: 'تم تحديث بيانات العميل بنجاح',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh clients list
      const { data } = await axiosInstance.get('/Users/customers');
      const list: CustomerDto[] = Array.isArray(data?.data) ? data.data : [];
      setCustomers(list);

      closeEditModal();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setEditFormError(errorMessage || 'فشل تحديث بيانات العميل');
      await Swal.fire({
        title: 'فشل التحديث',
        text: errorMessage || 'حدث خطأ أثناء تحديث بيانات العميل',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notificationForm.titleAr.trim() || !notificationForm.bodyAr.trim()) {
      setFormError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    if (notificationMode === 'specific' && !notificationForm.receiverId.trim()) {
      setFormError('يرجى إدخال معرف المستخدم');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (notificationMode === 'all') {
        // Use broadcast endpoint for all clients
        await axiosInstance.post('/admin/dashboard/broadcast-notification', {
          targetGroup: 'Customer',
          titleAr: notificationForm.titleAr.trim(),
          bodyAr: notificationForm.bodyAr.trim(),
        });
      } else {
        // Use regular notification endpoint for specific client
        await axiosInstance.post('/admin/dashboard/send-notification', {
          receiverId: notificationForm.receiverId.trim(),
          titleAr: notificationForm.titleAr.trim(),
          bodyAr: notificationForm.bodyAr.trim(),
        });
      }

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

  const openDepositModal = (userId: string) => {
    setSelectedWalletUserId(userId);
    setDepositForm({
      amount: '',
      paymentReference: '',
    });
    setWalletFormError(null);
    setIsDepositModalOpen(true);
  };

  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setSelectedWalletUserId(null);
    setDepositForm({
      amount: '',
      paymentReference: '',
    });
    setWalletFormError(null);
  };

  const openWithdrawModal = (userId: string) => {
    setSelectedWalletUserId(userId);
    setWithdrawForm({
      amount: '',
      description: '',
      withdrawalDetails: '',
    });
    setWalletFormError(null);
    setIsWithdrawModalOpen(true);
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setSelectedWalletUserId(null);
    setWithdrawForm({
      amount: '',
      description: '',
      withdrawalDetails: '',
    });
    setWalletFormError(null);
  };

  const handleDepositInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDepositForm((prev) => ({ ...prev, [name]: value }));
    setWalletFormError(null);
  };

  const handleWithdrawInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWithdrawForm((prev) => ({ ...prev, [name]: value }));
    setWalletFormError(null);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!depositForm.amount.trim() || !depositForm.paymentReference.trim()) {
      setWalletFormError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    const amount = parseFloat(depositForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setWalletFormError('يرجى إدخال مبلغ صحيح');
      return;
    }

    setSubmittingWallet(true);
    setWalletFormError(null);

    try {
      await axiosInstance.post(`/Wallet/${selectedWalletUserId}/deposit`, {
        amount: amount,
        paymentReference: depositForm.paymentReference.trim(),
      });

      await Swal.fire({
        title: 'تم الإيداع',
        text: 'تم إيداع المبلغ بنجاح',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      closeDepositModal();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setWalletFormError(errorMessage || 'فشل إيداع المبلغ');
      await Swal.fire({
        title: 'فشل الإيداع',
        text: errorMessage || 'حدث خطأ أثناء إيداع المبلغ',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setSubmittingWallet(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!withdrawForm.amount.trim() || !withdrawForm.description.trim() || !withdrawForm.withdrawalDetails.trim()) {
      setWalletFormError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    const amount = parseFloat(withdrawForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setWalletFormError('يرجى إدخال مبلغ صحيح');
      return;
    }

    setSubmittingWallet(true);
    setWalletFormError(null);

    try {
      await axiosInstance.post(`/Wallet/${selectedWalletUserId}/withdraw`, {
        amount: amount,
        description: withdrawForm.description.trim(),
        withdrawalDetails: withdrawForm.withdrawalDetails.trim(),
      });

      await Swal.fire({
        title: 'تم السحب',
        text: 'تم سحب المبلغ بنجاح',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      closeWithdrawModal();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setWalletFormError(errorMessage || 'فشل سحب المبلغ');
      await Swal.fire({
        title: 'فشل السحب',
        text: errorMessage || 'حدث خطأ أثناء سحب المبلغ',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setSubmittingWallet(false);
    }
  };

  const deleteClient = async (clientId: string) => {
    const client = customers.find((c) => c.id === clientId);
    const clientName = client?.name || client?.phoneNumber || client?.email || 'هذا العميل';

    const confirm = await Swal.fire({
      title: 'تأكيد الحذف',
      text: `هل أنت متأكد من حذف ${clientName}؟ هذا الإجراء لا يمكن التراجع عنه.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!confirm.isConfirmed) return;

    const next = new Set(deletingIds);
    next.add(clientId);
    setDeletingIds(next);

    try {
      await axiosInstance.delete(`/Users/${clientId}`);
      
      // Remove from state
      setCustomers((prev) => prev.filter((c) => c.id !== clientId));

      await Swal.fire({
        title: 'تم الحذف',
        text: 'تم حذف العميل بنجاح',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      await Swal.fire({
        title: 'فشل الحذف',
        text: errorMessage || 'حدث خطأ أثناء حذف العميل',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setDeletingIds((prev) => {
        const clone = new Set(prev);
        clone.delete(clientId);
        return clone;
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء</h1>
          <p className="text-gray-600">إدارة جميع العملاء في النظام</p>
        </div>
        <button
          onClick={() => openNotificationModal(null, 'all')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <HiBell className="w-5 h-5" />
          إرسال إشعار لجميع العملاء
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالاسم، الهاتف، البريد أو المعرف..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39500]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <HiFilter className="w-5 h-5" />
            تصفية
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">قائمة العملاء</h2>
        </div>
        <div className="p-6">
          {loading &&<LoadingSpinner />}
          {error && !loading && <p className="text-red-600">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              {filtered.length === 0 && <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>}
              {filtered.length > 0 && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">معلومات الاتصال</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التواريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إضافي</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((client) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* العميل */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {client.profileImage ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                  src={client.profileImage}
                                  alt={client.name || 'صورة العميل'}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center ${client.profileImage ? 'hidden' : ''}`}>
                                <HiUserGroup className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {client.name || 'غير محدد'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {client.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* معلومات الاتصال */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="font-medium">الهاتف:</span>
                              <span>{client.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">البريد:</span>
                              <span className="text-gray-500">
                                {client.email || 'غير متوفر'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* الحالة */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              client.isEmailVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {client.isEmailVerified ? 'هاتف موثق' : 'هاتف غير موثق'}
                            </span>
                            <div className="text-xs text-gray-500">
                              الدور: {client.role}
                            </div>
                          </div>
                        </td>

                        {/* التواريخ */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">التسجيل:</span>
                              <div>{new Date(client.createdAt).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(client.createdAt).toLocaleTimeString('ar-SA', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            {client.updatedAt && (
                              <div className="pt-1 border-t border-gray-100">
                                <span className="font-medium">التحديث:</span>
                                <div>{new Date(client.updatedAt).toLocaleDateString('ar-SA', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(client.updatedAt).toLocaleTimeString('ar-SA', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* إضافي */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">FCM Token:</span>
                              <div className="text-xs">
                                {client.fcmToken ? 'متوفر' : 'غير متوفر'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Token:</span>
                              <div className="text-xs">
                                {client.token ? 'متوفر' : 'غير متوفر'}
                              </div>
                            </div>
                            {client.driverStatus && (
                              <div>
                                <span className="font-medium">حالة السائق:</span>
                                <div className="text-xs">
                                  {client.driverStatus}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* إجراءات */}
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openDepositModal(client.id)}
                              className="p-2 rounded-md border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                              title="إيداع"
                            >
                              <HiArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openWithdrawModal(client.id)}
                              className="p-2 rounded-md border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
                              title="سحب"
                            >
                              <HiArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(client.id)}
                              className="p-2 rounded-md border border-yellow-200 text-yellow-600 hover:bg-yellow-50 transition-colors"
                              title="تعديل العميل"
                            >
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openNotificationModal(client.id)}
                              className="p-2 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                              title="إرسال إشعار"
                            >
                              <HiBell className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteClient(client.id)}
                              disabled={deletingIds.has(client.id)}
                              className={`px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors ${
                                deletingIds.has(client.id) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="حذف العميل"
                            >
                              <HiTrash className="w-4 h-4 inline" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeNotificationModal}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {notificationMode === 'all' ? 'إرسال إشعار لجميع العملاء' : selectedClientId ? 'إرسال إشعار للعميل' : 'إرسال إشعار'}
              </h3>
              <button onClick={closeNotificationModal} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="px-5 py-4 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{formError}</div>
              )}

              {notificationMode === 'all' && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-1">⚠️ إشعار عام</p>
                  <p className="text-sm text-blue-700">
                    سيتم إرسال هذا الإشعار إلى جميع العملاء في النظام ({customers.length} عميل)
                  </p>
                </div>
              )}

              {notificationMode === 'specific' && selectedClientId && (() => {
                const client = customers.find((c) => c.id === selectedClientId);
                return client ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">العميل:</p>
                    <p className="text-base font-semibold text-gray-800">
                      {client.name || client.phoneNumber || client.email || 'غير محدد'}
                    </p>
                    {client.email && (
                      <p className="text-sm text-gray-500">{client.email}</p>
                    )}
                  </div>
                ) : null;
              })()}

              {notificationMode === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    معرف العميل (Receiver ID) *
                  </label>
                  <input
                    type="text"
                    name="receiverId"
                    value={notificationForm.receiverId}
                    onChange={handleNotificationInput}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل معرف العميل"
                    required={notificationMode === 'specific'}
                    disabled={!!selectedClientId}
                  />
                  {selectedClientId && (
                    <p className="text-xs text-gray-500 mt-1">تم تحديد العميل تلقائياً</p>
                  )}
                </div>
              )}

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
                  disabled={submitting || !notificationForm.titleAr.trim() || !notificationForm.bodyAr.trim() || (notificationMode === 'specific' && !notificationForm.receiverId.trim())}
                  className={`px-4 py-2 rounded-lg text-white ${
                    submitting || !notificationForm.titleAr.trim() || !notificationForm.bodyAr.trim() || (notificationMode === 'specific' && !notificationForm.receiverId.trim())
                      ? 'bg-green-600/60 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-colors`}
                >
                  {submitting ? 'جاري الإرسال...' : notificationMode === 'all' ? 'إرسال للجميع' : 'إرسال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && editingClientId && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeEditModal}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">تعديل بيانات العميل</h3>
              <button onClick={closeEditModal} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="px-5 py-4 space-y-4">
              {editFormError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{editFormError}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل الاسم"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل رقم الهاتف"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الملف الشخصي</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm text-gray-600">
                    {editForm.profileImage ? 'تم اختيار صورة جديدة' : previewImageUrl ? 'تغيير الصورة' : 'اختر صورة'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                </label>
                {previewImageUrl && (
                  <div className="mt-2 flex justify-center">
                    <div className="h-32 w-32 bg-gray-100 rounded-lg overflow-hidden border">
                      <img src={previewImageUrl} alt="preview" className="h-full w-full object-cover" />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">اختياري - حجم الصورة يجب أن يكون أقل من 5MB</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit || !editForm.name.trim() || !editForm.phone.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    submittingEdit || !editForm.name.trim() || !editForm.phone.trim()
                      ? 'bg-blue-600/60 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {submittingEdit ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {isDepositModalOpen && selectedWalletUserId && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeDepositModal}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">إيداع في المحفظة</h3>
              <button onClick={closeDepositModal} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="px-5 py-4 space-y-4">
              {walletFormError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{walletFormError}</div>
              )}

              {(() => {
                const client = customers.find((c) => c.id === selectedWalletUserId);
                return client ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">العميل:</p>
                    <p className="text-base font-semibold text-gray-800">
                      {client.name || client.phoneNumber || client.email || 'غير محدد'}
                    </p>
                  </div>
                ) : null;
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label>
                <input
                  type="number"
                  name="amount"
                  value={depositForm.amount}
                  onChange={handleDepositInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل المبلغ"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مرجع الدفع *</label>
                <input
                  type="text"
                  name="paymentReference"
                  value={depositForm.paymentReference}
                  onChange={handleDepositInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل مرجع الدفع"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDepositModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingWallet || !depositForm.amount.trim() || !depositForm.paymentReference.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    submittingWallet || !depositForm.amount.trim() || !depositForm.paymentReference.trim()
                      ? 'bg-green-600/60 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-colors`}
                >
                  {submittingWallet ? 'جاري الإيداع...' : 'إيداع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && selectedWalletUserId && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeWithdrawModal}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">سحب من المحفظة</h3>
              <button onClick={closeWithdrawModal} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="px-5 py-4 space-y-4">
              {walletFormError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{walletFormError}</div>
              )}

              {(() => {
                const client = customers.find((c) => c.id === selectedWalletUserId);
                return client ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">العميل:</p>
                    <p className="text-base font-semibold text-gray-800">
                      {client.name || client.phoneNumber || client.email || 'غير محدد'}
                    </p>
                  </div>
                ) : null;
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label>
                <input
                  type="number"
                  name="amount"
                  value={withdrawForm.amount}
                  onChange={handleWithdrawInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="أدخل المبلغ"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف *</label>
                <input
                  type="text"
                  name="description"
                  value={withdrawForm.description}
                  onChange={handleWithdrawInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="أدخل وصف السحب"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل السحب *</label>
                <textarea
                  name="withdrawalDetails"
                  value={withdrawForm.withdrawalDetails}
                  onChange={handleWithdrawInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="أدخل تفاصيل السحب"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeWithdrawModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingWallet || !withdrawForm.amount.trim() || !withdrawForm.description.trim() || !withdrawForm.withdrawalDetails.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    submittingWallet || !withdrawForm.amount.trim() || !withdrawForm.description.trim() || !withdrawForm.withdrawalDetails.trim()
                      ? 'bg-orange-600/60 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } transition-colors`}
                >
                  {submittingWallet ? 'جاري السحب...' : 'سحب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ClientsContent; 