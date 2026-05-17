import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineTruck } from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CarTypesTable from './CarTypesTable';
import CarTypeCreateModal from './CarTypeCreateModal';
import type { CarType, ApiResponse } from './types';
import Swal from 'sweetalert2';

const initialForm = {
  name: '',
  // Egypt
  pricePerKm: '',
  minimumFare: '',
  surgePriceMultiplier: '',
  // Yemen
  pricePerKmYemen: '',
  minimumFareYemen: '',
  surgePriceMultiplierYemen: '',
  // Common
  isActive: true,
  description: '',
  imageFile: null as File | null,
};

const CarTypesContent: React.FC = () => {
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const countryCode = localStorage.getItem('countryCode') || '+20';
  const isYemen = countryCode === '+967';

  const resetForm = () => {
    setForm(initialForm);
    setPreviewUrl(null);
    setFormError(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  const fetchCarTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get<ApiResponse<CarType[]>>('/CarTypes');
      setCarTypes(res.data.data || []);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarTypes();
  }, []);

  const openDialog = () => {
    resetForm();
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: CarType) => {
    setForm({
      name: item.name,
      // Egypt
      pricePerKm: item.pricePerKm?.toString() || '',
      minimumFare: item.minimumFare?.toString() || '',
      surgePriceMultiplier: item.surgePriceMultiplier?.toString() || '',
      // Yemen
      pricePerKmYemen: item.pricePerKmYemen?.toString() || '',
      minimumFareYemen: item.minimumFareYemen?.toString() || '',
      surgePriceMultiplierYemen: item.surgePriceMultiplierYemen?.toString() || '',
      // Common
      isActive: item.isActive,
      description: item.description || '',
      imageFile: null,
    });
    setPreviewUrl(item.imageUrl);
    setEditingId(item.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, imageFile: file }));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append('Name', form.name.trim());
      fd.append('IsActive', String(form.isActive));
      if (form.description) fd.append('Description', form.description);

      // ── Always send ALL fields to avoid overwriting other country's data with 0 ──
      // Egypt fields
      if (form.pricePerKm) fd.append('PricePerKm', String(Number(form.pricePerKm)));
      if (form.minimumFare) fd.append('MinimumFare', form.minimumFare);
      if (form.surgePriceMultiplier) fd.append('SurgePriceMultiplier', String(Number(form.surgePriceMultiplier)));
      // Yemen fields
      if (form.pricePerKmYemen) fd.append('PricePerKmYemen', String(Number(form.pricePerKmYemen)));
      if (form.minimumFareYemen) fd.append('MinimumFareYemen', String(Number(form.minimumFareYemen)));
      if (form.surgePriceMultiplierYemen) fd.append('SurgePriceMultiplierYemen', String(Number(form.surgePriceMultiplierYemen)));

      if (form.imageFile instanceof File) {
        fd.append('Image', form.imageFile);
      }

      if (isEditMode && editingId) {
        await axiosInstance.put(`/CarTypes/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('تم تحديث نوع السيارة بنجاح');
      } else {
        await axiosInstance.post('/CarTypes', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('تم إضافة نوع السيارة بنجاح');
      }

      await fetchCarTypes();
      closeDialog();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const msg = errorMessage || (isEditMode ? 'تعذر تحديث النوع، حاول مرة أخرى' : 'تعذر إنشاء النوع، حاول مرة أخرى');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: CarType) => {
    const result = await Swal.fire({
      title: 'تأكيد الحذف',
      text: `هل أنت متأكد من حذف النوع: ${item.name}؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#9ca3af',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/CarTypes/${item.id}`);
      toast.success('تم حذف النوع بنجاح');
      await fetchCarTypes();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: errorMessage || 'تعذر حذف النوع',
        confirmButtonText: 'حسناً',
      });
    }
  };

  const handleEdit = async (item: CarType) => {
    openEditDialog(item);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <ToastContainer position="top-center" rtl newestOnTop closeOnClick theme="dark" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <HiOutlineTruck className="w-8 h-8 text-#022949" />
          <h1 className="text-2xl font-bold text-gray-800">إدارة أنواع السيارات</h1>
          {/* Country indicator */}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              isYemen
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {isYemen ? '🇾🇪 اليمن' : '🇪🇬 مصر'}
          </span>
        </div>
        <button
          onClick={openDialog}
          className="inline-flex items-center gap-2 bg-indigo-800 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 hover:shadow-md transition-all"
        >
          إضافة نوع سيارة
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center min-h-[240px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-800"></div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
      )}

      {!loading && !error && (
        <CarTypesTable items={carTypes} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <CarTypeCreateModal
        isOpen={isDialogOpen}
        isEditMode={isEditMode}
        form={form}
        previewUrl={previewUrl}
        submitting={submitting}
        formError={formError}
        onClose={closeDialog}
        onChange={handleInput}
        onImage={handleImage}
        onSubmit={submitForm}
      />
    </motion.div>
  );
};

export default CarTypesContent;