import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiTruck, HiSearch, HiFilter, HiX } from 'react-icons/hi';
import Swal from 'sweetalert2';
import axiosInstance from '../../api/AxiosIntance';

interface DriverBrief {
  id: string;
  name: string | null;
  phoneNumber: string;
  email: string | null;
  profileImage: string | null;
  isPhoneVerified: boolean;
  role: string;
  driverStatus: number | string;
}

interface CarItem {
  id: number;
  userId: string;
  driver: DriverBrief;
  carImage?: string | null;
  brand?: string | null;
  warrantyYear?: number | null;
  passengerCount?: number | null;
  color?: string | null;
  plateNumber?: string | null;
  registrationNumber?: string | null;
  carTypeName?: string | null;
  carTypeId?: number | null;
  hasAC?: boolean;
  hasChildSeat?: boolean;
  allowsPets?: boolean;
  allowsDelivery?: boolean;
  isDisabilityAccessible?: boolean;
  hasBikeHolder?: boolean;
  hasExtraLuggageSpace?: boolean;
  isSmokingAllowed?: boolean;
  acceptsCreditCard?: boolean;
  isOnline?: boolean;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  serviceRadiusKm?: number | null;
  frontImage?: string | null;
  backImage?: string | null;
  licenseImage?: string | null;
  isApproved?: boolean;
  createdAt?: string;
}

const CarsContent: React.FC = () => {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [selected, setSelected] = useState<CarItem | null>(null);
  const [approving, setApproving] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get('/CarDriver/all-cars');
        const list: CarItem[] = Array.isArray(data?.data) ? data.data : [];
        setCars(list);
      } catch (e: any) {
        setError('فشل تحميل السيارات');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return cars;
    const q = query.trim().toLowerCase();
    return cars.filter((c) =>
      (c.brand || '').toLowerCase().includes(q) ||
      (c.carTypeName || '').toLowerCase().includes(q) ||
      (c.plateNumber || '').toLowerCase().includes(q) ||
      (c.driver?.name || '').toLowerCase().includes(q) ||
      (c.driver?.phoneNumber || '').toLowerCase().includes(q)
    );
  }, [cars, query]);

  const approveCar = async (carId: number) => {
    const confirm = await Swal.fire({
      title: 'تأكيد الاعتماد',
      text: 'هل تريد اعتماد هذه السيارة؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، اعتماد',
      cancelButtonText: 'إلغاء',
    });
    if (!confirm.isConfirmed) return;

    setApproving((prev) => new Set(prev).add(carId));
    try {
      await axiosInstance.put(`/CarDriver/approve/${carId}`);
      setCars((prev) => prev.map((c) => (c.id === carId ? { ...c, isApproved: true } : c)));
      if (selected?.id === carId) setSelected({ ...selected, isApproved: true });
      await Swal.fire({ icon: 'success', title: 'تم الاعتماد', timer: 1200, showConfirmButton: false });
    } catch (e) {
      await Swal.fire({ icon: 'error', title: 'فشل الاعتماد', text: 'حدث خطأ أثناء الاعتماد' });
    } finally {
      setApproving((prev) => {
        const s = new Set(prev);
        s.delete(carId);
        return s;
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة السيارات</h1>
          <p className="text-gray-600">عرض وإدارة جميع السيارات</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن سيارة..."
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
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">قائمة السيارات</h2>
        </div>
        <div className="p-6 overflow-x-auto">
          {loading && <p className="text-gray-500">جاري التحميل...</p>}
          {error && !loading && <p className="text-red-600">{error}</p>}
          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">#</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الصورة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">النوع</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الماركة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">اللون</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">رقم اللوحة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">السائق</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">اعتماد</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">حالة الاتصال</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((car, i) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>
                    <td className="px-4 py-3">
                      {car.carImage ? (
                        <img src={car.carImage} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <HiTruck className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{car.carTypeName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{car.brand || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{car.color || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{car.plateNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{car.driver?.name || car.driver?.phoneNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm">{car.isApproved ? 'معتمد' : 'غير معتمد'}</td>
                    <td className="px-4 py-3 text-sm">{car.isOnline ? 'متصل' : 'غير متصل'}</td>
                    <td className="px-4 py-3 text-sm text-right space-x-2 space-x-reverse">
                      <button
                        onClick={() => setSelected(car)}
                        className="px-3 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 ml-2"
                      >
                        عرض
                      </button>
                      {car.isApproved ? (
                        <span className="px-3 py-1 rounded-md border border-green-200 text-green-700">معتمد</span>
                      ) : (
                        <button
                          disabled={approving.has(car.id)}
                          onClick={() => approveCar(car.id)}
                          className={`px-3 py-1 rounded-md border ${
                            approving.has(car.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'border-green-200 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          اعتماد
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-gray-500">لا توجد سيارات</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">تفاصيل السيارة</h3>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setSelected(null)}
                aria-label="إغلاق"
              >
                <HiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-500">النوع</p>
                  <p className="font-medium text-gray-800">{selected.carTypeName || '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">الماركة</p>
                  <p className="font-medium text-gray-800">{selected.brand || '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">اللون</p>
                  <p className="font-medium text-gray-800">{selected.color || '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">رقم اللوحة</p>
                  <p className="font-medium text-gray-800">{selected.plateNumber || '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">رقم التسجيل</p>
                  <p className="font-medium text-gray-800">{selected.registrationNumber || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-500">عدد الركاب</p>
                  <p className="font-medium text-gray-800">{selected.passengerCount ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">سنة الضمان</p>
                  <p className="font-medium text-gray-800">{selected.warrantyYear ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">حالة الاتصال</p>
                  <p className="font-medium text-gray-800">{selected.isOnline ? 'متصل' : 'غير متصل'}</p>
                  <p className="text-sm text-gray-500 mt-2">نطاق الخدمة (كم)</p>
                  <p className="font-medium text-gray-800">{selected.serviceRadiusKm ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">تاريخ الإنشاء</p>
                  <p className="font-medium text-gray-800">{selected.createdAt ? new Date(selected.createdAt).toLocaleString('ar-SA') : '—'}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">السائق</h4>
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="font-medium text-gray-800">{selected.driver?.name || '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">الجوال</p>
                  <p className="font-medium text-gray-800">{selected.driver?.phoneNumber || '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">موثق</p>
                  <p className="font-medium text-gray-800">{selected.driver?.isPhoneVerified ? 'نعم' : 'لا'}</p>
                </div>
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">صور السيارة</h4>
                  <div className="flex gap-3 flex-wrap">
                    {selected.carImage && <img src={selected.carImage} className="w-24 h-16 object-cover rounded" />}
                    {selected.frontImage && <img src={selected.frontImage} className="w-24 h-16 object-cover rounded" />}
                    {selected.backImage && <img src={selected.backImage} className="w-24 h-16 object-cover rounded" />}
                    {selected.licenseImage && <img src={selected.licenseImage} className="w-24 h-16 object-cover rounded" />}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">المزايا</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>مكيف: {selected.hasAC ? 'نعم' : 'لا'}</span>
                    <span>مقعد طفل: {selected.hasChildSeat ? 'نعم' : 'لا'}</span>
                    <span>يسمح بالحيوانات: {selected.allowsPets ? 'نعم' : 'لا'}</span>
                    <span>توصيل: {selected.allowsDelivery ? 'نعم' : 'لا'}</span>
                    <span>ذوي الهمم: {selected.isDisabilityAccessible ? 'نعم' : 'لا'}</span>
                    <span>حامل دراجات: {selected.hasBikeHolder ? 'نعم' : 'لا'}</span>
                    <span>أمتعة إضافية: {selected.hasExtraLuggageSpace ? 'نعم' : 'لا'}</span>
                    <span>تدخين: {selected.isSmokingAllowed ? 'مسموح' : 'غير مسموح'}</span>
                    <span>بطاقة ائتمان: {selected.acceptsCreditCard ? 'نعم' : 'لا'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              {!selected?.isApproved ? (
                <button
                  disabled={selected ? approving.has(selected.id) : true}
                  onClick={() => selected && approveCar(selected.id)}
                  className={`px-4 py-2 rounded-md border ${
                    selected && approving.has(selected.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'border-green-200 text-green-700 hover:bg-green-50'
                  }`}
                >
                  اعتماد السيارة
                </button>
              ) : (
                <span className="text-green-700">هذه السيارة معتمدة</span>
              )}
              <button className="px-4 py-2 rounded-md border" onClick={() => setSelected(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CarsContent;


