import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiTrendingUp } from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LevelsTable from './LevelsTable';
import LevelCreateModal from './LevelCreateModal';
import type { Level, ApiResponse } from './types';

const LevelsContent: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    level: string;
    requiredTrips: string;
    commissionPercentage: string;
  }>({
    level: '',
    requiredTrips: '',
    commissionPercentage: '',
  });

  const resetForm = () => {
    setForm({
      level: '',
      requiredTrips: '',
      commissionPercentage: '',
    });
    setFormError(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  const fetchLevels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/admin/dashboard/all-level');
      setLevels(res.data.data || []);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const openDialog = () => {
    resetForm();
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Level) => {
    setForm({
      level: item.level.toString(),
      requiredTrips: item.requiredTrips.toString(),
      commissionPercentage: item.commissionPercentage.toString(),
    });
    setEditingId(item.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.level || !form.requiredTrips || !form.commissionPercentage) {
      setFormError('يرجى تعبئة الحقول المطلوبة');
      toast.error('يرجى تعبئة الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    
    try {
      const payload = {
        id: isEditMode && editingId ? editingId : undefined,
        level: parseInt(form.level),
        requiredTrips: parseInt(form.requiredTrips),
        commissionPercentage: parseFloat(form.commissionPercentage),
      };

      await axiosInstance.post('/admin/dashboard/upsert', payload);
      toast.success(isEditMode ? 'تم تحديث المستوى بنجاح' : 'تم إضافة المستوى بنجاح');
      
      await fetchLevels();
      closeDialog();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const msg = errorMessage || (isEditMode ? 'تعذر تحديث المستوى، حاول مرة أخرى' : 'تعذر إنشاء المستوى، حاول مرة أخرى');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: Level) => {
    const ok = confirm(`هل تريد حذف المستوى ${item.level}؟`);
    if (!ok) return;
    
    try {
      await axiosInstance.delete(`/admin/dashboard/${item.level}`);
      toast.success('تم حذف المستوى بنجاح');
      await fetchLevels();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || 'تعذر حذف المستوى');
    }
  };

  const handleEdit = async (item: Level) => {
    openEditDialog(item);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <ToastContainer position="top-center" rtl newestOnTop closeOnClick theme="dark" />

      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <HiTrendingUp className="w-8 h-8 text-#022949" />
          <h1 className="text-2xl font-bold text-gray-800">إدارة المستويات</h1>
        </div>
        <button
          onClick={openDialog}
          className="inline-flex items-center gap-2 bg-indigo-800 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 hover:shadow-md transition-all"
        >
          إضافة مستوى جديد
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
        <LevelsTable items={levels} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <LevelCreateModal
        isOpen={isDialogOpen}
        isEditMode={isEditMode}
        form={form}
        submitting={submitting}
        formError={formError}
        onClose={closeDialog}
        onChange={handleInput}
        onSubmit={submitForm}
      />
    </motion.div>
  );
};

export default LevelsContent;
