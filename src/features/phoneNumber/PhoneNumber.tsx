import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/AxiosIntance';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../../assets/LoadingSpinner';

interface ContactNumber {
  id: number;
  phoneNumber: string;
  label: string;
  createdAt: string;
  updatedAt: string | null;
}

const PhoneNumber: React.FC = () => {
  const formRef = useRef<HTMLDivElement | null>(null);
  const [numbers, setNumbers] = useState<ContactNumber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [label, setLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawCountryCode = localStorage.getItem('countryCode') || '+20';
  const countryCode = rawCountryCode === '+967' ? 'YE' : 'EG';

  // Get
  useEffect(() => {
    const fetchNumbers = async () => {
      try {
        const res = await axiosInstance.get('/ContactNumbers');
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setNumbers(data || []);
      } catch (error) {
        console.error(error);
        setNumbers([]);
        toast.error('فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchNumbers();
  }, []);

  // Add
  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !label) {
      toast.error('الرجاء ملئ جميع الحقول');
      return;
    }
    setAdding(true);
    try {
      const res = await axiosInstance.post('/ContactNumbers', {
        phoneNumber,
        label,
        countryCode,
      });
      const newNumber = res.data.data;
      setNumbers(prev => [...prev, newNumber]);
      toast.success('تم إضافة الرقم بنجاح');
      setPhoneNumber('');
      setLabel('');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء الإضافة');
    } finally {
      setAdding(false);
    }
  };

  // Edit (Modal)
  const openEditModal = (num: ContactNumber) => {
    setPhoneNumber(num.phoneNumber);
    setLabel(num.label);
    setEditingId(num.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setPhoneNumber('');
    setLabel('');
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEditNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !label) {
      toast.error('الرجاء ملئ جميع الحقول');
      return;
    }
    setAdding(true);
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/ContactNumbers/${editingId}`, {
          phoneNumber,
          label,
          countryCode,
        });
        const updatedNumber = res.data.data ?? { id: editingId, phoneNumber, label };
        setNumbers(prev => prev.map(n => n.id === editingId ? { ...n, ...updatedNumber } : n));
        toast.success('تم تعديل الرقم بنجاح');
        closeModal();
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء التعديل');
    } finally {
      setAdding(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن تتمكن من التراجع بعد الحذف!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'حذف',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/ContactNumbers/${id}`);
        setNumbers(prev => prev.filter(n => n.id !== id));
        toast.success('تم حذف الرقم بنجاح');
      } catch (error) {
        console.error(error);
        toast.error('حدث خطأ أثناء الحذف');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  // Filter
  const filteredNumbers = numbers.filter(n => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return n.label.toLowerCase().includes(term) || n.phoneNumber.toLowerCase().includes(term);
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">أرقام التواصل</h1>
          <p className="text-gray-500 mt-1">إدارة أرقام الاتصال — أضف، عدل أو احذف بسهولة</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Country badge */}
          <span
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
              countryCode === 'YE'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-blue-100 text-blue-800 border-blue-300'
            }`}
          >
            {countryCode === 'YE' ? '🇾🇪 اليمن' : '🇪🇬 مصر'}
          </span>

          {/* Search box */}
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg py-2 pr-10 pl-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute left-1 top-1/2 -translate-y-1/2 p-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
                مسح
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form column (Add only) */}
        <div ref={formRef} className="lg:col-span-1 bg-white border rounded-lg shadow-sm p-5">
          <h2 className="text-xl font-semibold mb-3">إضافة رقم</h2>
          <form onSubmit={handleAddNumber} className="space-y-3">
            <input
              type="text"
              placeholder="الاسم/الوسم"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full border rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="tel"
              placeholder="رقم الهاتف"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="w-full border rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button type="submit" disabled={adding} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {adding ? 'جاري الحفظ...' : 'إضافة رقم'}
            </button>
          </form>
        </div>

        {/* List column */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-medium mb-4">قائمة الأرقام ({filteredNumbers.length})</h3>
            {filteredNumbers.length === 0 ? (
              <div className="py-8 text-center text-gray-500">لا يوجد أرقام</div>
            ) : (
              <ul className="space-y-3">
                {filteredNumbers.map(num => (
                  <li key={num.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-md hover:shadow">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{num.label}</p>
                      <p className="text-gray-500">{num.phoneNumber}</p>
                      <p className="text-gray-400 text-sm">
                        تم الإنشاء: {new Date(num.createdAt).toLocaleString('ar-EG')}
                      </p>
                      {num.updatedAt && (
                        <p className="text-gray-400 text-sm">آخر تعديل: {new Date(num.updatedAt).toLocaleString('ar-EG')}</p>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => openEditModal(num)}
                        className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(num.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-#022949 bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">تعديل الرقم</h2>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full border ${
                  countryCode === 'YE'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {countryCode === 'YE' ? '🇾🇪 اليمن' : '🇪🇬 مصر'}
              </span>
            </div>
            <form onSubmit={handleEditNumber} className="space-y-3">
              <input
                type="text"
                placeholder="الاسم/الوسم"
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="w-full border rounded-md p-2"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full border rounded-md p-2"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">إلغاء</button>
                <button type="submit" disabled={adding} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {adding ? 'جاري الحفظ...' : 'حفظ التعديل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PhoneNumber;