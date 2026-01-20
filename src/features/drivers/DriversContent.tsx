import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiTruck, HiSearch, HiFilter, HiX, HiTrash, HiBell, HiPencil, HiArrowDown, HiArrowUp } from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type DriverStatus = 'Pending' | 'Accepted' | 'Rejected' | string;

interface CarTypeApproval {
  carTypeId: number;
  status: 1 | 2;
  adminNotes: string;
}

interface CarTypeDto {
  id: number;
  name: string;
  image?: string;
}

interface CarDriverDto {
  id: number;
  carTypes?: CarTypeDto[];
}

interface DriverDto {
  id: string;
  phoneNumber: string;
  name: string | null;
  email?: string | null;
  profileImage?: string | null;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  fcmToken?: string | null;
  token?: string | null;
  role?: string;
  driverStatus: DriverStatus;
  hasCar?: boolean;
  drivingLicense?: string | null;
  getCarDriverDtos?: CarDriverDto | null;
}

const DriversContent: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<DriverStatus>('Pending');
  const navigate = useNavigate();
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<string>('');
  const [isSubmittingLimit, setIsSubmittingLimit] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedNotificationDriverId, setSelectedNotificationDriverId] = useState<string | null>(null);
  const [submittingNotification, setSubmittingNotification] = useState(false);
  const [notificationFormError, setNotificationFormError] = useState<string | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    receiverId: '',
    titleAr: '',
    bodyAr: '',
  });
  const [notificationMode, setNotificationMode] = useState<'specific' | 'all'>('specific');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
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

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
const [approveDriverId, setApproveDriverId] = useState<string | null>(null);
const [carDriverId, setCarDriverId] = useState<number | null>(null);

const [carTypeApprovals, setCarTypeApprovals] = useState<CarTypeApproval[]>([]);
const [submittingApproval, setSubmittingApproval] = useState(false);
// 

  const statusOptions: { value: DriverStatus; label: string }[] = [
    { value: 'Pending', label: 'قيد المراجعة' },
    { value: 'Accepted', label: 'مقبول' },
    { value: 'Rejected', label: 'مرفوض' },
  ];

  const openLimitDialog = (driverId: string | null = null) => {
    setSelectedDriverId(driverId);
    setNewLimit('');
    setIsLimitDialogOpen(true);
  };

  const closeLimitDialog = () => {
    setIsLimitDialogOpen(false);
    setSelectedDriverId(null);
    setNewLimit('');
  };

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLimit) {
      toast.error('يرجى إدخال الحد المسموح به');
      return;
    }

    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit < 0) {
      toast.error('يرجى إدخال رقم صحيح');
      return;
    }

    setIsSubmittingLimit(true);
    
    try {
      const payload: { newLimit: number; driverId?: string } = {
        newLimit: limit
      };
      
      // Only include driverId if it's a per-driver update (not global)
      if (selectedDriverId) {
        payload.driverId = selectedDriverId;
      }
      
      await axiosInstance.put('/admin/dashboard/update-limit', payload);
      
      toast.success(selectedDriverId ? 'تم تحديث الحد المسموح به للسائق بنجاح' : 'تم تحديث الحد المسموح به العام بنجاح');
      closeLimitDialog();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || 'فشل تحديث الحد المسموح به');
    } finally {
      setIsSubmittingLimit(false);
    }
  };


  const updateDriverStatus = async (driverId: string, status: DriverStatus) => {
  try {
    const confirm = await Swal.fire({
      title: 'تأكيد التحديث',
      text: 'هل أنت متأكد من تغيير حالة السائق؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، تحديث',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (!confirm.isConfirmed) return;

    const next = new Set(updatingIds);
    next.add(driverId);
    setUpdatingIds(next);

    // Optimistic update
    setDrivers(prev =>
      prev.map(d =>
        d.id === driverId ? { ...d, driverStatus: status } : d
      )
    );

    const driver = drivers.find(d => d.id === driverId);

    const carTypesPayload =
      driver?.getCarDriverDtos?.carTypes?.map(ct => ({
        carTypeId: ct.id,
      })) ?? [];

    await axiosInstance.put('/Auth/update-driver-status', {
      driverId,
      status,        
      carTypes: carTypesPayload,
    });

    await Swal.fire({
      title: 'تم التحديث',
      text: 'تم تحديث حالة السائق بنجاح',
      icon: 'success',
      confirmButtonText: 'حسناً',
    });
  } catch {
    // Revert by refetching
    try {
      const { data } = await axiosInstance.get('/Users/drivers');
      const list: DriverDto[] = Array.isArray(data?.data) ? data.data : [];
      setDrivers(list);
    } catch {}

    await Swal.fire({
      title: 'فشل التحديث',
      text: 'حدث خطأ أثناء تحديث حالة السائق',
      icon: 'error',
      confirmButtonText: 'حسناً',
    });
  } finally {
    setUpdatingIds(prev => {
      const clone = new Set(prev);
      clone.delete(driverId);
      return clone;
    });
  }
};



// const updateDriverStatus = async (driverId: string, status: DriverStatus) => {
//   try {
//     const confirm = await Swal.fire({
//       title: 'تأكيد التحديث',
//       text: 'هل أنت متأكد من تغيير حالة السائق؟',
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonText: 'نعم، تحديث',
//       cancelButtonText: 'إلغاء',
//     });
//     if (!confirm.isConfirmed) return;

//     setUpdatingIds(prev => new Set(prev).add(driverId));

//     setDrivers(prev =>
//       prev.map(d =>
//         d.id === driverId ? { ...d, driverStatus: status } : d
//       )
//     );

//     const driver = drivers.find(d => d.id === driverId);

//     let carTypesPayload: { carTypeId: number }[] | null = null;

//     if (status === 'Accepted') {
//       carTypesPayload =
//         driver?.getCarDriverDtos?.carTypes?.map(ct => ({
//           carTypeId: ct.id,
//         })) ?? [];
//     } else {
//       // ✅ الحل الصح
//       carTypesPayload = [];
//       // ولو الباك مش بيقبل []
//       // carTypesPayload = null;
//     }

//     await axiosInstance.put('/Auth/update-driver-status', {
//       driverId,
//       status,
//       carTypes: carTypesPayload,
//     });

//     await Swal.fire({
//       title: 'تم التحديث',
//       text: 'تم تحديث حالة السائق بنجاح',
//       icon: 'success',
//     });
//   } catch (err) {
//     console.error(err);
//     await Swal.fire({
//       title: 'فشل التحديث',
//       text: 'حدث خطأ أثناء تحديث حالة السائق',
//       icon: 'error',
//     });
//   } finally {
//     setUpdatingIds(prev => {
//       const clone = new Set(prev);
//       clone.delete(driverId);
//       return clone;
//     });
//   }
// };



  const openNotificationModal = (driverId: string | null = null, mode: 'specific' | 'all' = 'specific') => {
    setSelectedNotificationDriverId(driverId);
    setNotificationMode(mode);
    setNotificationForm({
      receiverId: driverId || '',
      titleAr: '',
      bodyAr: '',
    });
    setNotificationFormError(null);
    setIsNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false);
    setSelectedNotificationDriverId(null);
    setNotificationMode('specific');
    setNotificationForm({
      receiverId: '',
      titleAr: '',
      bodyAr: '',
    });
    setNotificationFormError(null);
  };

  const handleNotificationInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNotificationForm((prev) => ({ ...prev, [name]: value }));
    setNotificationFormError(null);
  };

  const openEditModal = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
      setEditingDriverId(driverId);
      setEditForm({
        name: driver.name || '',
        phone: driver.phoneNumber || '',
        profileImage: null,
      });
      setPreviewImageUrl(driver.profileImage || null);
      setEditFormError(null);
      setIsEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingDriverId(null);
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

  const handleUpdateDriver = async (e: React.FormEvent) => {
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

      await axiosInstance.put(`/admin/dashboard/update/${editingDriverId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await Swal.fire({
        title: 'تم التحديث',
        text: 'تم تحديث بيانات السائق بنجاح',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh drivers list
      const { data } = await axiosInstance.get('/Users/drivers');
      const list: DriverDto[] = Array.isArray(data?.data) ? data.data : [];
      setDrivers(list);

      closeEditModal();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setEditFormError(errorMessage || 'فشل تحديث بيانات السائق');
      await Swal.fire({
        title: 'فشل التحديث',
        text: errorMessage || 'حدث خطأ أثناء تحديث بيانات السائق',
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
      setNotificationFormError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    if (notificationMode === 'specific' && !notificationForm.receiverId.trim()) {
      setNotificationFormError('يرجى إدخال معرف السائق');
      return;
    }

    setSubmittingNotification(true);
    setNotificationFormError(null);

    try {
      if (notificationMode === 'all') {
        // Use broadcast endpoint for all drivers
        await axiosInstance.post('/admin/dashboard/broadcast-notification', {
          targetGroup: 'Driver',
          titleAr: notificationForm.titleAr.trim(),
          bodyAr: notificationForm.bodyAr.trim(),
        });
      } else {
        // Use regular notification endpoint for specific driver
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
      setNotificationFormError(errorMessage || 'فشل إرسال الإشعار');
      await Swal.fire({
        title: 'فشل الإرسال',
        text: errorMessage || 'حدث خطأ أثناء إرسال الإشعار',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setSubmittingNotification(false);
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

  const deleteDriver = async (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    const driverName = driver?.name || driver?.phoneNumber || 'هذا السائق';

    const confirm = await Swal.fire({
      title: 'تأكيد الحذف',
      text: `هل أنت متأكد من حذف ${driverName}؟ هذا الإجراء لا يمكن التراجع عنه.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!confirm.isConfirmed) return;

    const next = new Set(deletingIds);
    next.add(driverId);
    setDeletingIds(next);

    try {
      await axiosInstance.delete(`/Users/${driverId}`);
      
      // Remove from state
      setDrivers((prev) => prev.filter((d) => d.id !== driverId));

      await Swal.fire({
        title: 'تم الحذف',
        text: 'تم حذف السائق بنجاح',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      await Swal.fire({
        title: 'فشل الحذف',
        text: errorMessage || 'حدث خطأ أثناء حذف السائق',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setDeletingIds((prev) => {
        const clone = new Set(prev);
        clone.delete(driverId);
        return clone;
      });
    }
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get('/Users/drivers');
        // Expecting shape: { success, statusCode, message, data: DriverDto[] }
        const list: DriverDto[] = Array.isArray(data?.data) ? data.data : [];
        setDrivers(list);
      } catch {
        setError('فشل تحميل السائقين');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    const byStatus = drivers.filter((d) => d.driverStatus === activeTab);
    if (!query.trim()) return byStatus;
    const q = query.trim().toLowerCase();
    return byStatus.filter((d) =>
      (d.name || '').toLowerCase().includes(q) || (d.phoneNumber || '').toLowerCase().includes(q)
    );
  }, [drivers, activeTab, query]);

  // openApproveModal
  const openApproveModal = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    const car = driver?.getCarDriverDtos;

    if (!car || !car.id) {
      toast.error('لا توجد سيارة مرتبطة بهذا السائق');
      return;
    }

    if (!car.carTypes || car.carTypes.length === 0) {
      toast.error('لا توجد أنواع سيارات لاعتمادها');
      return;
    }

    setApproveDriverId(driverId);
    setCarDriverId(car.id);

    setCarTypeApprovals(
      car.carTypes.map(ct => ({
        carTypeId: ct.id,
        status: 1,
        adminNotes: '',
      }))
    );

    setIsApproveModalOpen(true);
  };

  // handleApproveCarTypes
// const handleApproveCarTypes = async () => {
//   if (!carDriverId || !approveDriverId) return;

//   try {
//     setSubmittingApproval(true);

//     await axiosInstance.post('/CarDriver/approve-car-types', {
//       carDriverId,
//       carTypes: carTypeApprovals,
//     });

//     await axiosInstance.put('/Auth/update-driver-status', {
//       driverId: approveDriverId,
//       status: 'Accepted',
//     });

//     toast.success('تم اعتماد السائق وأنواع السيارة');
//     setIsApproveModalOpen(false);

//     setDrivers(prev =>
//       prev.map(d =>
//         d.id === approveDriverId ? { ...d, driverStatus: 'Accepted' } : d
//       )
//     );
//   } catch {
//     toast.error('فشل اعتماد أنواع السيارة');
//   } finally {
//     setSubmittingApproval(false);
//   }
// };

  const handleApproveCarTypes = async () => {
    if (!approveDriverId) return;

    const approvedCarTypes = carTypeApprovals.filter(ct => ct.status === 1);

    const driverStatus: DriverStatus =
      approvedCarTypes.length > 0 ? 'Accepted' : 'Rejected';

    try {
      setSubmittingApproval(true);

      await axiosInstance.put('/Auth/update-driver-status', {
        driverId: approveDriverId,
        status: driverStatus,
        carTypes: approvedCarTypes.map(ct => ({
          carTypeId: ct.carTypeId,
        })),
      });

      toast.success(
        driverStatus === 'Accepted'
          ? 'تم قبول السائق وأنواع السيارة'
          : 'تم رفض السائق لعدم قبول أي نوع سيارة'
      );

      setIsApproveModalOpen(false);

      setDrivers(prev =>
        prev.map(d =>
          d.id === approveDriverId
            ? { ...d, driverStatus }
            : d
        )
      );
    } catch (error) {
      toast.error('فشل تحديث حالة السائق');
    } finally {
      setSubmittingApproval(false);
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <ToastContainer position="top-center" rtl newestOnTop closeOnClick theme="dark" />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة السائقين</h1>
          <p className="text-gray-600">إدارة جميع السائقين في النظام</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openNotificationModal(null, 'all')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <HiBell className="w-5 h-5" />
            إرسال إشعار لجميع السائقين
          </button>
          <button
            onClick={() => openLimitDialog(null)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            تحديث الحد العام
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن سائق..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <HiFilter className="w-5 h-5" />
            تصفية
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          {['Pending', 'Accepted', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab === 'Pending' ? 'قيد المراجعة' : tab === 'Accepted' ? 'مقبول' : 'مرفوض'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">قائمة السائقين</h2>
        </div>
        <div className="p-6">
          {loading && (
            <p className="text-gray-500">جاري التحميل...</p>
          )}
          {error && !loading && (
            <p className="text-red-600">{error}</p>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              {filteredDrivers.length === 0 ? (
                <p className="text-gray-500">لا توجد بيانات</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">السائق</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">رقم الجوال</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الحالة</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">تم التحقق</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">لديه سيارة</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">عدد السيارات</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الدور</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">تاريخ التسجيل</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {driver.profileImage ? (
                              <img src={driver.profileImage} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <HiTruck className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-800">{driver.name || '—'}</p>
                              {driver.email && <p className="text-xs text-gray-500">{driver.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{driver.phoneNumber}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            driver.driverStatus === 'Accepted'
                              ? 'bg-green-100 text-green-800'
                              : driver.driverStatus === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {driver.driverStatus === 'Pending' ? 'قيد المراجعة' : driver.driverStatus === 'Accepted' ? 'مقبول' : 'مرفوض'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {driver.isPhoneVerified ? (
                            <span className="text-green-700">نعم</span>
                          ) : (
                            <span className="text-gray-600">لا</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {driver.hasCar ? 'نعم' : 'لا'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {driver.getCarDriverDtos ? 1 : 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{driver.role || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString('ar-SA') : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right space-x-2 space-x-reverse">
                          <button
                            onClick={() => navigate(`/driver-details/${driver.id}`)}
                            className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50 border border-blue-200 ml-2"
                          >
                            عرض
                          </button>
                          <button
                            onClick={() => openDepositModal(driver.id)}
                            className="px-3 py-1 rounded-md border border-green-200 text-green-600 hover:bg-green-50"
                            title="إيداع"
                          >
                            <HiArrowDown className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => openWithdrawModal(driver.id)}
                            className="px-3 py-1 rounded-md border border-orange-200 text-orange-600 hover:bg-orange-50"
                            title="سحب"
                          >
                            <HiArrowUp className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => openEditModal(driver.id)}
                            className="px-3 py-1 rounded-md border border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                            title="تعديل السائق"
                          >
                            <HiPencil className="w-4 h-4 inline" />
                          </button>
                          <select
                            value={driver.driverStatus}
                            // onChange={(e) => updateDriverStatus(driver.id, e.target.value as DriverStatus)}
                           onChange={(e) => {
                                const value = e.target.value as DriverStatus;

                                if (value === 'Accepted') {
                                  if (driver.driverStatus === 'Accepted') {
                                    toast.info('السائق مقبول بالفعل');
                                    return;
                                  }
                                  openApproveModal(driver.id);
                                } else {
                                  updateDriverStatus(driver.id, value);
                                }
                              }}


                            disabled={updatingIds.has(driver.id) || deletingIds.has(driver.id)}
                            className={`px-2 py-1 border rounded-md bg-white ${
                              updatingIds.has(driver.id) || deletingIds.has(driver.id) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                            }`}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => openNotificationModal(driver.id)}
                            className="px-3 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50"
                            title="إرسال إشعار"
                          >
                            <HiBell className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => openLimitDialog(driver.id)}
                            className="px-3 py-1 rounded-md border border-green-200 text-green-600 hover:bg-green-50"
                            title="تحديث الحد المسموح به"
                          >
                            حد
                          </button>
                          <button
                            onClick={() => deleteDriver(driver.id)}
                            disabled={deletingIds.has(driver.id)}
                            className={`px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 ${
                              deletingIds.has(driver.id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="حذف السائق"
                          >
                            <HiTrash className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Limit Dialog */}
      {isLimitDialogOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeLimitDialog}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedDriverId ? 'تحديث الحد المسموح به للسائق' : 'تحديث الحد المسموح به العام'}
              </h3>
              <button onClick={closeLimitDialog} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLimit} className="px-5 py-4 space-y-4">
              {selectedDriverId && (() => {
                const driver = drivers.find((d) => d.id === selectedDriverId);
                return driver ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">السائق:</p>
                    <p className="text-base font-semibold text-gray-800">
                      {driver.name || driver.phoneNumber || 'غير محدد'}
                    </p>
                  </div>
                ) : null;
              })()}
              {!selectedDriverId && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    سيتم تطبيق هذا الحد على جميع السائقين كحد افتراضي
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحد المسموح به *</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeLimitDialog}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLimit || !newLimit}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isSubmittingLimit || !newLimit ? 'bg-green-600/60 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  } transition-colors`}
                >
                  {isSubmittingLimit ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeNotificationModal}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {notificationMode === 'all' ? 'إرسال إشعار لجميع السائقين' : selectedNotificationDriverId ? 'إرسال إشعار للسائق' : 'إرسال إشعار'}
              </h3>
              <button onClick={closeNotificationModal} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="px-5 py-4 space-y-4">
              {notificationFormError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{notificationFormError}</div>
              )}

              {notificationMode === 'all' && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-1">⚠️ إشعار عام</p>
                  <p className="text-sm text-blue-700">
                    سيتم إرسال هذا الإشعار إلى جميع السائقين في النظام ({drivers.length} سائق)
                  </p>
                </div>
              )}

              {notificationMode === 'specific' && selectedNotificationDriverId && (() => {
                const driver = drivers.find((d) => d.id === selectedNotificationDriverId);
                return driver ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">السائق:</p>
                    <p className="text-base font-semibold text-gray-800">
                      {driver.name || driver.phoneNumber || 'غير محدد'}
                    </p>
                    {driver.email && (
                      <p className="text-sm text-gray-500">{driver.email}</p>
                    )}
                  </div>
                ) : null;
              })()}

              {notificationMode === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    معرف السائق (Receiver ID) *
                  </label>
                  <input
                    type="text"
                    name="receiverId"
                    value={notificationForm.receiverId}
                    onChange={handleNotificationInput}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل معرف السائق"
                    required={notificationMode === 'specific'}
                    disabled={!!selectedNotificationDriverId}
                  />
                  {selectedNotificationDriverId && (
                    <p className="text-xs text-gray-500 mt-1">تم تحديد السائق تلقائياً</p>
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
                  disabled={submittingNotification || !notificationForm.titleAr.trim() || !notificationForm.bodyAr.trim() || (notificationMode === 'specific' && !notificationForm.receiverId.trim())}
                  className={`px-4 py-2 rounded-lg text-white ${
                    submittingNotification || !notificationForm.titleAr.trim() || !notificationForm.bodyAr.trim() || (notificationMode === 'specific' && !notificationForm.receiverId.trim())
                      ? 'bg-blue-600/60 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {submittingNotification ? 'جاري الإرسال...' : notificationMode === 'all' ? 'إرسال للجميع' : 'إرسال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {isEditModalOpen && editingDriverId && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeEditModal}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">تعديل بيانات السائق</h3>
              <button onClick={closeEditModal} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDriver} className="px-5 py-4 space-y-4">
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
                const driver = drivers.find((d) => d.id === selectedWalletUserId);
                return driver ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">السائق:</p>
                    <p className="text-base font-semibold text-gray-800">
                      {driver.name || driver.phoneNumber || 'غير محدد'}
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
                const driver = drivers.find((d) => d.id === selectedWalletUserId);
                return driver ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">السائق:</p>
                    <p className="text-base font-semibold text-gray-800">
                      {driver.name || driver.phoneNumber || 'غير محدد'}
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


      {/* isApproveModalOpen */}
        {isApproveModalOpen && (
          <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-5">
              <h3 className="text-lg font-bold mb-4">اعتماد أنواع السيارة</h3>

              {carTypeApprovals.map((ct, index) => {
                const driver = drivers.find(d => d.id === approveDriverId);
                const car = driver?.getCarDriverDtos as any;
                const type = car?.carTypes?.find((t: any) => t.id === ct.carTypeId);

                return (
                  <div key={ct.carTypeId} className="border rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-3 mb-2">
                      {type?.image && (
                        <img src={type.image} className="w-10 h-10 object-contain" />
                      )}
                      <p className="font-medium">{type?.name}</p>
                    </div>

                    <select
                      value={ct.status}
                      onChange={(e) => {
                        const value = Number(e.target.value) as 1 | 2;
                        setCarTypeApprovals(prev =>
                          prev.map((x, i) =>
                            i === index ? { ...x, status: value } : x
                          )
                        );
                      }}
                      className="border rounded p-1 mb-2"
                    >
                      <option value={1}>موافق</option>
                      <option value={2}>مرفوض</option>
                    </select>

                    <textarea
                      placeholder="ملاحظات الأدمن"
                      className="w-full border rounded p-2 text-sm"
                      value={ct.adminNotes}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCarTypeApprovals(prev =>
                          prev.map((x, i) =>
                            i === index ? { ...x, adminNotes: value } : x
                          )
                        );
                      }}
                    />
                  </div>
                );
              })}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  إلغاء
                </button>

                <button
                  disabled={submittingApproval}
                  onClick={handleApproveCarTypes}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {submittingApproval ? 'جاري الاعتماد...' : 'اعتماد'}
                </button>
              </div>
            </div>
          </div>
        )}

    </motion.div>
  );
};

export default DriversContent; 