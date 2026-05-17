import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiTicket, HiSearch, HiFilter, HiX, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/AxiosIntance';
import CouponCreateModal from './CouponCreateModal';
import LoadingSpinner from '../../assets/LoadingSpinner';

interface Coupon {
  id: number;
   newCode?: string;               
   code?: string;
  description?: string | null;
  isPercentage: boolean;
  discountValue: number;
  startDate?: string | null;
  endDate?: string | null;
  maxUsageCount?: number | null;
  maxUsagePerUser?: number | null;
  usedCount?: number | null;
  isActive?: boolean;
  createdAt?: string;
}

interface FormState {
  discountValue: string;
  isPercentage: boolean;
  startDate: string;
  endDate: string;
  maxUsageCount: string;
  maxUsagePerUser: string;
  description: string;
  newCode: string;
}

const CouponsContent: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [selected, setSelected] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    discountValue: '',
    isPercentage: true,
    startDate: '',
    endDate: '',
    maxUsageCount: '0',
    maxUsagePerUser: '0',
    description: '',
    newCode: '',
  });

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get('/Coupons');
        const list: Coupon[] = Array.isArray(data?.data) ? data.data : [];
        setCoupons(list);
      } catch (e: any) {
        if (e?.response?.status === 404) {
          setCoupons([]);
          setError(null);
        } else {
          setError('فشل تحميل الكوبونات');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return coupons;
    const q = query.trim().toLowerCase();
    return coupons.filter((c) =>
      (c.newCode || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  }, [coupons, query]);

  const resetForm = () => {
    setForm({
      discountValue: '',
      isPercentage: true,
      startDate: '',
      endDate: '',
      maxUsageCount: '0',
      maxUsagePerUser: '0',
      description: '',
      newCode: '',
    });
    setFormError(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setForm({
      discountValue: coupon.discountValue.toString(),
      isPercentage: coupon.isPercentage,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : '',
      maxUsageCount: coupon.maxUsageCount?.toString() || '0',
      maxUsagePerUser: coupon.maxUsagePerUser?.toString() || '0',
      description: coupon.description || '',
       newCode: coupon.newCode || coupon.code || '', 
    });
    setEditingId(coupon.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        discountValue: parseFloat(form.discountValue),
        isPercentage: form.isPercentage,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        maxUsageCount: parseInt(form.maxUsageCount) || 0,
        maxUsagePerUser: parseInt(form.maxUsagePerUser) || 0,
        description: form.description.trim(),
        newCode: form.newCode.trim(),
      };

      if (isEditMode && editingId) {
        await axiosInstance.put(`/Coupons/${editingId}`, payload);
        await Swal.fire({ icon: 'success', title: 'تم التحديث', timer: 1200, showConfirmButton: false });
      } else {
        await axiosInstance.post('/Coupons', payload);
        await Swal.fire({ icon: 'success', title: 'تم الإنشاء', timer: 1200, showConfirmButton: false });
      }

      // Refresh the list
      const { data } = await axiosInstance.get('/Coupons');
      const list: Coupon[] = Array.isArray(data?.data) ? data.data : [];
      setCoupons(list);
      closeModal();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'حدث خطأ أثناء الحفظ';
      setFormError(errorMessage);
      await Swal.fire({ icon: 'error', title: 'فشل الحفظ', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCoupon = async (couponId: number) => {
    const confirm = await Swal.fire({
      title: 'تأكيد الحذف',
      text: 'هل تريد حذف هذا الكوبون؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
    });
    if (!confirm.isConfirmed) return;

    try {
      await axiosInstance.delete(`/Coupons/${couponId}`);
      setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      if (selected?.id === couponId) setSelected(null);
      await Swal.fire({ icon: 'success', title: 'تم الحذف', timer: 1200, showConfirmButton: false });
    } catch (e) {
      await Swal.fire({ icon: 'error', title: 'فشل الحذف', text: 'حدث خطأ أثناء الحذف' });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    openEditModal(coupon);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">إدارة الكوبونات</h1>
          <p className="text-sm sm:text-base text-gray-600">عرض وإدارة جميع كوبونات الخصم</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <HiPlus className="w-5 h-5" />
          <span className="text-sm sm:text-base">إضافة كوبون جديد</span>
        </button>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن كوبون..."
              className="w-full pr-10 pl-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto">
            <HiFilter className="w-5 h-5" />
            <span className="text-sm sm:text-base">تصفية</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">قائمة الكوبونات</h2>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          {loading &&<LoadingSpinner />}
          {error && !loading && <p className="text-red-600 text-center py-8">{error}</p>}
          {!loading && !error && (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">#</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الكود</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الوصف</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">نوع الخصم</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">قيمة الخصم</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الاستخدام</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">تاريخ الانتهاء</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الحالة</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filtered.map((coupon, i) => (
                      <tr key={coupon.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{coupon.newCode || coupon.code || '—'} </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{coupon.description || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {coupon.isPercentage ? 'نسبة مئوية' : 'مبلغ ثابت'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {coupon.isPercentage ? `${coupon.discountValue}%` : `${coupon.discountValue} ريال`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {coupon.usedCount !== null && coupon.maxUsageCount !== null && coupon.maxUsageCount > 0
                            ? `${coupon.usedCount} / ${coupon.maxUsageCount}`
                            : coupon.usedCount !== null
                            ? coupon.usedCount
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('ar-SA') : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            نشط
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right space-x-2 space-x-reverse">
                          <button
                            onClick={() => setSelected(coupon)}
                            className="px-3 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 ml-2"
                          >
                            عرض
                          </button>
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="px-3 py-1 rounded-md border border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                          >
                            <HiPencil className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon.id)}
                            className="px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <HiTrash className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                          لا توجد كوبونات
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filtered.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">لا توجد كوبونات</p>
                ) : (
                  filtered.map((coupon, i) => (
                    <div key={coupon.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">#{i + 1}</span>
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              نشط
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-800 mb-1">
                            {coupon.code || coupon.newCode || 'بدون كود'}
                          </h3>
                          {coupon.description && (
                            <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">نوع الخصم</p>
                          <p className="font-medium text-gray-800">
                            {coupon.isPercentage ? 'نسبة مئوية' : 'مبلغ ثابت'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">قيمة الخصم</p>
                          <p className="font-medium text-gray-800">
                            {coupon.isPercentage ? `${coupon.discountValue}%` : `${coupon.discountValue} ريال`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">الاستخدام</p>
                          <p className="font-medium text-gray-800">
                            {coupon.usedCount !== null && coupon.maxUsageCount !== null && coupon.maxUsageCount > 0
                              ? `${coupon.usedCount} / ${coupon.maxUsageCount}`
                              : coupon.usedCount !== null
                              ? coupon.usedCount
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">تاريخ الانتهاء</p>
                          <p className="font-medium text-gray-800">
                            {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('ar-SA') : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => setSelected(coupon)}
                          className="flex-1 px-3 py-2 text-sm rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          عرض
                        </button>
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="flex-1 px-3 py-2 text-sm rounded-md border border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="flex-1 px-3 py-2 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-#022949 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">تفاصيل الكوبون</h3>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setSelected(null)}
                aria-label="إغلاق"
              >
                <HiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500">الكود</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">{selected.code || '—'}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">الوصف</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">{selected.description || '—'}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">نوع الخصم</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {selected.isPercentage ? 'نسبة مئوية' : 'مبلغ ثابت'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">قيمة الخصم</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {selected.isPercentage
                      ? `${selected.discountValue}%`
                      : `${selected.discountValue} ريال`}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500">حد الاستخدام العام</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {selected.maxUsageCount && selected.maxUsageCount > 0 ? selected.maxUsageCount : 'غير محدود'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">حد الاستخدام للشخص الواحد</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {selected.maxUsagePerUser && selected.maxUsagePerUser > 0 ? selected.maxUsagePerUser : 'غير محدود'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">عدد مرات الاستخدام</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">{selected.usedCount ?? 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">تاريخ البدء</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {selected.startDate
                      ? new Date(selected.startDate).toLocaleString('ar-SA')
                      : '—'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">تاريخ الانتهاء</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {selected.endDate ? new Date(selected.endDate).toLocaleString('ar-SA') : '—'}
                  </p>
                </div>
              </div>
              {selected.createdAt && (
                <div className="mt-4 sm:mt-6">
                  <div className="border rounded p-3 sm:p-4">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">معلومات إضافية</h4>
                    <p className="text-xs sm:text-sm text-gray-500">تاريخ الإنشاء</p>
                    <p className="text-sm sm:text-base font-medium text-gray-800">
                      {new Date(selected.createdAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                className="px-4 py-2 text-sm sm:text-base rounded-md border hover:bg-gray-50"
                onClick={() => setSelected(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <CouponCreateModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        form={form}
        submitting={submitting}
        formError={formError}
        onClose={closeModal}
        onChange={handleInput}
        onCheckboxChange={handleCheckboxChange}
        onSubmit={submitForm}
      />
    </motion.div>
  );
};

export default CouponsContent;

