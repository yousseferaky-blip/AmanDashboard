import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiCurrencyDollar, HiChartBar, HiCreditCard, HiTrendingUp, HiMinusCircle, HiX } from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';

import Swal from 'sweetalert2';


// -----------------------------
// Types / Interfaces
// -----------------------------

type DriverStatus = 'Pending' | 'Accepted' | 'Rejected' | string;
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

interface DriverEarnings {
  driverId: string;
  totalTrips: number;
  level: number;
  commissionPercentage: number;
  totalEarnings: number;
  appCommission: number;
  netEarnings: number;
  balance: number;
  errors?: unknown[];
}

interface CarTypeDto {
  id: number;
  name: string;
  image?: string;
}

interface CarDto {
  id: number;
  brand: string;
  color: string;
  plateNumber: string;
  registrationNumber: string;
  passengerCount: number;
  warrantyYear: number;
  carTypeId: number;
  carImage?: string;
  frontImage?: string;
  backImage?: string;
  driverLicenseFrontImage?: string;
  driverLicenseBackImage?: string;
  criminalRecordImage?: string;
  hasAC?: boolean;
  hasChildSeat?: boolean;
  allowsPets?: boolean;
  allowsDelivery?: boolean;
  isDisabilityAccessible?: boolean;
  hasBikeHolder?: boolean;
  hasExtraLuggageSpace?: boolean;
  isSmokingAllowed?: boolean;
  acceptsCreditCard?: boolean;
  level?: number | null;
  tripsCount?: number | null;
  weeklyTrips?: number | null;
   carTypes?: CarTypeDto[];
}

interface DriverProfileDto {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  isPhoneVerified: boolean;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  fcmToken?: string | null;
  token?: string | null;
  role: string;
  driverStatus: DriverStatus;
  drivingLicense?: string | null;
  hasCar?: boolean;
  carId?: number | null;
  level?: number;
  tripsCount?: number;
  weeklyTrips?: number;
  isActive?: boolean;
  getCarDriverDtos?: CarDto[] | CarDto | null;
}

interface CarTypeApproval {
  carTypeId: number;
  status: 1 | 2;
  adminNotes: string;
}
// -----------------------------
// Component
// -----------------------------

const DriverDetails: React.FC = () => {
  // router param
  const { id } = useParams<{ id: string }>();

  // main data states
  const [driver, setDriver] = useState<DriverProfileDto | null>(null);
  const [driverEarnings, setDriverEarnings] = useState<DriverEarnings | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // loading / error states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingEarnings, setLoadingEarnings] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // deduct dialog / form states
  const [isDeductDialogOpen, setIsDeductDialogOpen] = useState(false);
  const [deductAmount, setDeductAmount] = useState<string>('');
  const [deductNote, setDeductNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // wallet
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);

  // car model update states
  const [allCarTypes, setAllCarTypes] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [selectedType, setSelectedType] = useState<number | ''>('');
  const [isUpdatingType, setIsUpdatingType] = useState(false);
  // 

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveDriverId, setApproveDriverId] = useState<string | null>(null);
  const [carTypeApprovals, setCarTypeApprovals] = useState<CarTypeApproval[]>([]);
  const [submittingApproval, setSubmittingApproval] = useState(false);
  
  // safe extraction: first car if present
  const car: CarDto | null = driver
    ? (Array.isArray(driver.getCarDriverDtos) ? (driver.getCarDriverDtos[0] ?? null) : (driver.getCarDriverDtos ?? null))
    : null;

  // -----------------------------
  // Fetch driver, earnings, wallet
  // -----------------------------
  useEffect(() => {
    const fetchDriver = async (driverId: string) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get(`/Users/${driverId}`);
        const profile: DriverProfileDto | null = data?.data ?? data ?? null;
        setDriver(profile);
      } catch (err) {
        console.error('fetchDriver error', err);
        setError('فشل تحميل بيانات السائق');
      } finally {
        setLoading(false);
      }
    };

    const fetchDriverEarnings = async (driverId: string) => {
      try {
        setLoadingEarnings(true);
        const { data } = await axiosInstance.get(`/admin/dashboard/${driverId}`);
        if (data.success && data.data) {
          setDriverEarnings(data.data);
        }
      } catch (err) {
        console.warn('fetchDriverEarnings failed', err);
      } finally {
        setLoadingEarnings(false);
      }
    };

    const fetchWallet = async (driverId: string) => {
      try {
        setLoadingWallet(true);
        const { data } = await axiosInstance.get(`/Wallet/${driverId}`);

        // support multiple possible shapes for balance
        const possibleBalance =
          data?.data?.balance ??
          data?.balance ??
          (typeof data?.data === 'number' ? data.data : undefined);

        if (typeof possibleBalance === 'number') {
          setWalletBalance(possibleBalance);
        } else {
          const balanceStr = (data?.data?.balance ?? data?.balance) as unknown;
          const parsed = typeof balanceStr === 'string' ? parseFloat(balanceStr) : NaN;
          if (!isNaN(parsed)) setWalletBalance(parsed);
          else setWalletBalance(null);
        }
      } catch (err) {
        console.warn('Failed to fetch wallet:', err);
        setWalletBalance(null);
      } finally {
        setLoadingWallet(false);
      }
    };

    if (id) {
      fetchDriver(id);
      fetchDriverEarnings(id);
      fetchWallet(id);
    }
  }, [id]);

  // -----------------------------
  // fetch car types (two endpoints used in original code)
  // -----------------------------
  const [carTypes, setCarTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchCarTypes = async () => {
      setLoadingTypes(true);
      try {
        const { data } = await axiosInstance.get('/CarTypes');
        setCarTypes(data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error('فشل تحميل الأنواع');
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchCarTypes();
  }, []);

  useEffect(() => {
    const fetchCarTypes = async () => {
      try {
        setLoadingTypes(true);
        const { data } = await axiosInstance.get('/CarDriver/all-cars');
        setAllCarTypes(data?.data ?? data ?? []);
      } catch (err) {
        console.error('Error loading car types', err);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchCarTypes();
  }, []);

  // -----------------------------
  // Handlers
  // -----------------------------

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setSelectedType(val);

    if (!driver?.id) return;

    setIsUpdatingType(true);
    try {
      await axiosInstance.put(`/Users/update-my-car-typeId/${driver.id}`, {
        carTypeId: val,
      });

      // update local driver state to reflect new car type
      setDriver(prev => {
        if (!prev || !prev.getCarDriverDtos) return prev;
        const updatedCarDtos = Array.isArray(prev.getCarDriverDtos)
          ? prev.getCarDriverDtos.map(c => ({ ...c, carTypeId: val }))
          : [{ ...prev.getCarDriverDtos, carTypeId: val }];
        return { ...prev, getCarDriverDtos: updatedCarDtos };
      });

      toast.success('تم تحديث نوع السيارة بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('فشل تحديث نوع السيارة، حاول مرة أخرى');
    } finally {
      setIsUpdatingType(false);
    }
  };

  const handleDeduct = async () => {
    if (!id || !deductAmount.trim()) {
      toast.error('يرجى إدخال المبلغ');
      return;
    }

    const amount = parseFloat(deductAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صالح');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post('/admin/dashboard/withdraw-from-app-commission', {
        driverId: id,
        amount,
        note: deductNote.trim() || 'لا يوجد ملاحظات'
      });

      toast.success('تم خصم المبلغ بنجاح');
      setIsDeductDialogOpen(false);
      setDeductAmount('');
      setDeductNote('');

      // Refresh driver earnings
      try {
        const { data } = await axiosInstance.get(`/admin/dashboard/${id}`);
        if (data.success && data.data) setDriverEarnings(data.data);
      } catch {
        // ignore
      }

      // Refresh wallet
      try {
        const w = await axiosInstance.get(`/Wallet/${id}`);
        const possibleBalance = w?.data?.data?.balance ?? w?.data?.balance;
        if (typeof possibleBalance === 'number') setWalletBalance(possibleBalance);
        else {
          const parsed = typeof possibleBalance === 'string' ? parseFloat(possibleBalance) : NaN;
          if (!isNaN(parsed)) setWalletBalance(parsed);
        }
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || 'فشل خصم المبلغ، حاول مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

//  ==============================================

  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [carDriverId, setCarDriverId] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const statusOptions: { value: DriverStatus; label: string }[] = [
    { value: 'Pending', label: 'قيد المراجعة' },
    { value: 'Accepted', label: 'مقبول' },
    { value: 'Rejected', label: 'مرفوض' },
  ];


//   const updateDriverStatus = async (driverId: string, status: DriverStatus) => {
//   try {
//     const confirm = await Swal.fire({
//       title: 'تأكيد التحديث',
//       text: 'هل أنت متأكد من تغيير حالة السائق؟',
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonText: 'نعم، تحديث',
//       cancelButtonText: 'إلغاء',
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//     });

//     if (!confirm.isConfirmed) return;

//     const next = new Set(updatingIds);
//     next.add(driverId);
//     setUpdatingIds(next);

//     // Optimistic update
//     setDrivers(prev =>
//       prev.map(d =>
//         d.id === driverId ? { ...d, driverStatus: status } : d
//       )
//     );

//     const driver = drivers.find(d => d.id === driverId);

//     const carTypesPayload =
//       driver?.getCarDriverDtos?.carTypes?.map(ct => ({
//         carTypeId: ct.id,
//       })) ?? [];

//     await axiosInstance.put('/Auth/update-driver-status', {
//       driverId,
//       status,        
//       carTypes: carTypesPayload,
//     });

//     await Swal.fire({
//       title: 'تم التحديث',
//       text: 'تم تحديث حالة السائق بنجاح',
//       icon: 'success',
//       confirmButtonText: 'حسناً',
//     });
//   } catch {
//     // Revert by refetching
//     try {
//       const { data } = await axiosInstance.get('/Users/drivers');
//       const list: DriverDto[] = Array.isArray(data?.data) ? data.data : [];
//       setDrivers(list);
//     } catch {}

//     await Swal.fire({
//       title: 'فشل التحديث',
//       text: 'حدث خطأ أثناء تحديث حالة السائق',
//       icon: 'error',
//       confirmButtonText: 'حسناً',
//     });
//   } finally {
//     setUpdatingIds(prev => {
//       const clone = new Set(prev);
//       clone.delete(driverId);
//       return clone;
//     });
//   }
// };

// const openApproveModal = (driverId: string) => {
//     const driver = drivers.find(d => d.id === driverId);
//     const car = driver?.getCarDriverDtos;

//     if (!car || !car.id) {
//       toast.error('لا توجد سيارة مرتبطة بهذا السائق');
//       return;
//     }

//     if (!car.carTypes || car.carTypes.length === 0) {
//       toast.error('لا توجد أنواع سيارات لاعتمادها');
//       return;
//     }

//     setApproveDriverId(driverId);
//     setCarDriverId(car.id);

//     setCarTypeApprovals(
//       car.carTypes.map(ct => ({
//         carTypeId: ct.id,
//         status: 1,
//         adminNotes: '',
//       }))
//     );

//     setIsApproveModalOpen(true);
//   };

//  const handleApproveCarTypes = async () => {
//     if (!approveDriverId) return;

//     const approvedCarTypes = carTypeApprovals.filter(ct => ct.status === 1);

//     const driverStatus: DriverStatus =
//       approvedCarTypes.length > 0 ? 'Accepted' : 'Rejected';

//     try {
//       setSubmittingApproval(true);

//       await axiosInstance.put('/Auth/update-driver-status', {
//         driverId: approveDriverId,
//         status: driverStatus,
//         carTypes: approvedCarTypes.map(ct => ({
//           carTypeId: ct.carTypeId,
//         })),
//       });

//       toast.success(
//         driverStatus === 'Accepted'
//           ? 'تم قبول السائق وأنواع السيارة'
//           : 'تم رفض السائق لعدم قبول أي نوع سيارة'
//       );

//       setIsApproveModalOpen(false);

//       setDrivers(prev =>
//         prev.map(d =>
//           d.id === approveDriverId
//             ? { ...d, driverStatus }
//             : d
//         )
//       );
//     } catch (error) {
//       toast.error('فشل تحديث حالة السائق');
//     } finally {
//       setSubmittingApproval(false);
//     }
//   };

const fetchDriverFromList = async (driverId: string) => {
  const { data } = await axiosInstance.get('/Users/drivers');
  const list: DriverDto[] = data?.data ?? [];

  const found = list.find(d => d.id === driverId);
  if (found) {
    setDriver(found as any);
  }
};

const getCurrentCarTypesPayload = () => {
  const car = Array.isArray(driver?.getCarDriverDtos)
    ? driver.getCarDriverDtos[0]
    : driver?.getCarDriverDtos;

  return (
    car?.carTypes?.map(ct => ({
      carTypeId: ct.id,
    })) ?? []
  );
};
const updateDriverStatus = async (
  driverId: string,
  status: DriverStatus
) => {
  try {
    await axiosInstance.put('/Auth/update-driver-status', {
      driverId,
      status,
      carTypes: getCurrentCarTypesPayload(), // 👈 نفس اللي بيحصل في Drivers
    });

    setDriver(prev =>
      prev ? { ...prev, driverStatus: status } : prev
    );

    toast.success('تم تحديث حالة السائق بنجاح');
  } catch (err) {
    toast.error('فشل تحديث حالة السائق');
  }
};


const openApproveModal = (driverId: string) => {
  if (!driver?.getCarDriverDtos) {
    toast.error('لا توجد سيارة مرتبطة بهذا السائق');
    return;
  }

  const car = Array.isArray(driver.getCarDriverDtos)
    ? driver.getCarDriverDtos[0]
    : driver.getCarDriverDtos;

  if (!car?.carTypes || car.carTypes.length === 0) {
    toast.error('لا توجد أنواع سيارات لاعتمادها');
    return;
  }

  setApproveDriverId(driverId);

  setCarTypeApprovals(
    car.carTypes.map(ct => ({
      carTypeId: ct.id,
      status: 1,
      adminNotes: '',
    }))
  );

  setIsApproveModalOpen(true);
};


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

    setDriver(prev =>
      prev ? { ...prev, driverStatus } : prev
    );
  } catch {
    toast.error('فشل تحديث حالة السائق');
  } finally {
    setSubmittingApproval(false);
  }
};

// const fetchDriverEarnings = async (driverId: string) => {
//   try {
//     setLoadingEarnings(true);

//     const { data } = await axiosInstance.get(
//       `/admin/dashboard/${driverId}`
//     );

//     if (data?.success && data?.data) {
//       setDriverEarnings(data.data);
//     } else {
//       setDriverEarnings(null);
//     }
//   } catch (err: any) {
//     console.warn(
//       'fetchDriverEarnings failed:',
//       err?.response?.data || err.message
//     );

//     // مهم: متكراشش الصفحة
//     setDriverEarnings(null);
//   } finally {
//     setLoadingEarnings(false);
//   }
// };



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

//     await axiosInstance.put('/Auth/update-driver-status', {
//       driverId,
//       status,
//       carTypes: [],
//     });

//     toast.success('تم تحديث حالة السائق بنجاح');

//     setDriver(prev =>
//       prev ? { ...prev, driverStatus: status } : prev
//     );
//   } catch {
//     toast.error('حدث خطأ أثناء تحديث حالة السائق');
//   }
// };



  // -----------------------------
  // Render
  // -----------------------------
 
  return (
    <div className="p-6 space-y-6">
      <ToastContainer position="top-center" rtl newestOnTop closeOnClick theme="dark" />

      <div>
        <h1 className="text-2xl font-bold text-gray-800">تفاصيل السائق</h1>
        <p className="text-gray-600">معلومات الملف الشخصي والسيارات المرتبطة</p>
      </div>

      {loading && <p className="text-gray-500">جاري التحميل...</p>}
      {error && !loading && <p className="text-red-600">{error}</p>}

      {!loading && !error && driver && (
        <div className="space-y-6">
          {/* Header Card */}
          
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
            {driver.profileImage ? (
              <img onClick={() => setPreviewImage(driver.profileImage!)} src={driver.profileImage} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                {(driver.name || driver.phoneNumber || '—').toString().slice(0, 2)}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-800">{driver.name || '—'}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    driver.driverStatus === 'Accepted'
                      ? 'bg-green-100 text-green-800'
                      : driver.driverStatus === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {driver.driverStatus === 'Pending' ? 'قيد المراجعة' : driver.driverStatus === 'Accepted' ? 'مقبول' : 'مرفوض'}
                </span>
              </div>
              <p className="text-gray-600">{driver.phoneNumber}</p>
            <div className="flex items-center gap-3">

            <select
                value={driver.driverStatus}
                // onChange={(e) => {
                //   const value = e.target.value as DriverStatus;
                //   updateDriverStatus(driver.id, value);
                // }}
                onChange={async (e) => {
                      const value = e.target.value as DriverStatus;

                      const result = await Swal.fire({
                        title: 'تأكيد التغيير',
                        text: 'هل أنت متأكد من تغيير حالة السائق؟',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'نعم، متأكد',
                        cancelButtonText: 'إلغاء',
                        confirmButtonColor: '#16a34a',
                        cancelButtonColor: '#dc2626',
                      });

                      if (!result.isConfirmed) {
                        // رجّع القيمة القديمة
                        e.target.value = driver.driverStatus;
                        return;
                      }

                      if (value === 'Accepted') {
                        openApproveModal(driver.id);
                      } else {
                        updateDriverStatus(driver.id, value);
                      }
                    }}


                className="px-2 py-1 border rounded-md bg-white hover:bg-gray-50"
              >
                <option value="Pending">قيد المراجعة</option>
                <option value="Accepted">مقبول</option>
                <option value="Rejected">مرفوض</option>
              </select>




              </div>

            </div>

            <div className="text-right space-y-2">
              <div>
                <p className="text-sm text-gray-500">تم التحقق من الهاتف</p>
                <p className={`font-medium ${driver.isPhoneVerified ? 'text-green-700' : 'text-gray-700'}`}>
                  {driver.isPhoneVerified ? 'نعم' : 'لا'}
                </p>
              </div>
              {driver.isEmailVerified !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">تم التحقق من البريد</p>
                  <p className={`font-medium ${driver.isEmailVerified ? 'text-green-700' : 'text-gray-700'}`}>
                    {driver.isEmailVerified ? 'نعم' : 'لا'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="font-medium text-gray-800">{driver.email || '—'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">الدور</p>
                <p className="font-medium text-gray-800">{driver.role || '—'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">رخصة القيادة</p>
                <p className="font-medium text-gray-800">{driver.drivingLicense || '—'}</p>
              </div>

              {driver.level !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">المستوى</p>
                  <p className="font-medium text-gray-800">{driver.level}</p>
                </div>
              )}

              {driver.tripsCount !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">عدد الرحلات</p>
                  <p className="font-medium text-gray-800">{driver.tripsCount}</p>
                </div>
              )}

              {driver.weeklyTrips !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">رحلات هذا الأسبوع</p>
                  <p className="font-medium text-gray-800">{driver.weeklyTrips}</p>
                </div>
              )}

              {driver.isActive !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <p className={`font-medium ${driver.isActive ? 'text-green-700' : 'text-red-700'}`}>{driver.isActive ? 'نشط' : 'غير نشط'}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">لديه سيارة</p>
                <p className="font-medium text-gray-800">{driver.hasCar ? 'نعم' : 'لا'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">رقم السيارة</p>
                <p className="font-medium text-gray-800">{car?.plateNumber ?? '—'}</p>
              </div>

              {/* ماركة السيارة */}
              <div>
                <p className="text-sm text-gray-500">ماركة السيارة</p>

                <p className="text-xs text-gray-600 mt-1">
                  الماركة الحالية: <span className="text-xl font-bold">{car?.brand ?? '—'}</span>
                </p>

              </div>

               {/* نوع السيارة  */}

            <div>
              <p className="text-sm text-gray-500 mb-2">أنواع السيارة</p>

              {Array.isArray(car?.carTypes) && car.carTypes.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {car.carTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center gap-2 border rounded-lg p-2"
                    >
                      {type.image && (
                        <img
                          src={type.image}
                          alt={type.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <span className="text-sm font-medium">{type.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">—</p>
              )}
            </div>


            {/* رقم السيارة */}

              <div>
                <p className="text-sm text-gray-500"> رقم السيارة </p>
                <p className="font-medium text-gray-800">{car?.plateNumber ?? '—'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">تاريخ التسجيل</p>
                <p className="font-medium text-gray-800">{new Date(driver.createdAt).toLocaleString('ar-SA')}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">آخر تحديث</p>
                <p className="font-medium text-gray-800">{driver.updatedAt ? new Date(driver.updatedAt).toLocaleString('ar-SA') : '—'}</p>
              </div>
            </div>
          </div>

          {/* Driver Earnings Section */}
          {driverEarnings && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">إحصائيات الأرباح</h2>
              {loadingEarnings ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-800" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <HiTrendingUp className="w-6 h-6 text-indigo-700" />
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-200 px-2 py-1 rounded">إجمالي الرحلات</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-900">{driverEarnings.totalTrips}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <HiCurrencyDollar className="w-6 h-6 text-green-700" />
                      <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">إجمالي الأرباح</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{driverEarnings.totalEarnings.toFixed(2)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <HiChartBar className="w-6 h-6 text-orange-700" />
                      <span className="text-xs font-medium text-orange-700 bg-orange-200 px-2 py-1 rounded">عمولة التطبيق</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{driverEarnings.appCommission.toFixed(2)}</p>
                    <p className="text-xs text-orange-600 mt-1">({driverEarnings.commissionPercentage}%)</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <HiCreditCard className="w-6 h-6 text-purple-700" />
                      <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded">الأرباح الصافية</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{driverEarnings.netEarnings.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">العمولة</p>
                    <p className="text-2xl font-bold text-gray-900">{driverEarnings.appCommission.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-sm text-gray-500">المستوى</p>
                      <p className="text-lg font-semibold text-indigo-700">المستوى {driverEarnings.level}</p>
                      <p className="text-xs text-gray-500">نسبة العمولة: {driverEarnings.commissionPercentage}%</p>
                    </div>

                    <button
                      onClick={() => setIsDeductDialogOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <HiMinusCircle className="w-4 h-4" />
                      خصم من العمولة
                    </button>
                  </div>
                </div>

                {/* Wallet card */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4 border border-sky-200">
                    <div className="flex items-center justify-between mb-2">
                      <HiCurrencyDollar className="w-6 h-6 text-sky-700" />
                      <span className="text-xs font-medium text-sky-700 bg-sky-200 px-2 py-1 rounded">رصيد المحفظة</span>
                    </div>

                    {loadingWallet ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-700" />
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-sky-900">{walletBalance !== null ? walletBalance.toFixed(2) : '—'}</p>
                    )}

                    <p className="text-xs text-sky-600 mt-1">رصيد يمكن استخدامه للدفع أو السحب</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cars list */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">السيارات</h2>
            {(() => {
              const cars = driver
                ? (Array.isArray(driver.getCarDriverDtos) ? driver.getCarDriverDtos : driver.getCarDriverDtos ? [driver.getCarDriverDtos] : [])
                : [];

              return cars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cars.map((c) => (
                    <div key={c.id} className="border rounded-lg p-4 hover:shadow-sm">
                      <div className="flex gap-2 mb-3 flex-wrap ">
                        {c.carImage && <img src={c.carImage} onClick={() => setPreviewImage(c.carImage!)} className="w-20 h-14 object-cover rounded" alt="car" />}
                        {c.frontImage && <img src={c.frontImage} onClick={() => setPreviewImage(c.frontImage!)} className="w-20 h-14 object-cover rounded" alt="front" />}
                        {c.backImage && <img src={c.backImage} onClick={() => setPreviewImage(c.backImage!)} className="w-20 h-14 object-cover rounded" alt="back" />}
                        {c.driverLicenseFrontImage && <img src={c.driverLicenseFrontImage} onClick={() => setPreviewImage(c.driverLicenseFrontImage!)} className="w-20 h-14 object-cover rounded" alt="back" />}
                        {c.driverLicenseBackImage && <img src={c.driverLicenseBackImage} onClick={() => setPreviewImage(c.driverLicenseBackImage!)} className="w-20 h-14 object-cover rounded" alt="back" />}
                        {c.criminalRecordImage && <img src={c.criminalRecordImage} onClick={() => setPreviewImage(c.criminalRecordImage!)} className="w-20 h-14 object-cover rounded" alt="back" />}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">الطراز</p>
                          <p className="font-medium text-gray-800">{c.brand}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">اللون</p>
                          <p className="font-medium text-gray-800">{c.color}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">اللوحة</p>
                          <p className="font-medium text-gray-800">{c.plateNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">الركاب</p>
                          <p className="font-medium text-gray-800">{c.passengerCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">سنة الضمان</p>
                          <p className="font-medium text-gray-800">{c.warrantyYear}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">رقم التسجيل</p>
                          <p className="font-medium text-gray-800">{c.registrationNumber}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">الميزات</p>
                        <div className="flex flex-wrap gap-1">
                          {c.hasAC && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">مكيف</span>}
                          {c.hasChildSeat && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">مقعد أطفال</span>}
                          {c.allowsPets && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">يسمح بالحيوانات</span>}
                          {c.allowsDelivery && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">توصيل</span>}
                          {c.isDisabilityAccessible && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">دخول لذوي الإعاقة</span>}
                          {c.hasBikeHolder && <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded">حامل دراجات</span>}
                          {c.hasExtraLuggageSpace && <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded">حقيبة إضافية</span>}
                          {c.isSmokingAllowed && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">تدخين مسموح</span>}
                          {c.acceptsCreditCard && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">بطاقة ائتمان</span>}
                        </div>
                      </div>

                      {(c.level !== undefined || c.tripsCount !== undefined || c.weeklyTrips !== undefined) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-2">إحصائيات السيارة</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {c.level !== undefined && (
                              <div>
                                <p className="text-gray-500">المستوى</p>
                                <p className="font-medium text-gray-800">{c.level ?? '—'}</p>
                              </div>
                            )}
                            {c.tripsCount !== undefined && (
                              <div>
                                <p className="text-gray-500">الرحلات</p>
                                <p className="font-medium text-gray-800">{c.tripsCount ?? '—'}</p>
                              </div>
                            )}
                            {c.weeklyTrips !== undefined && (
                              <div>
                                <p className="text-gray-500">الأسبوعية</p>
                                <p className="font-medium text-gray-800">{c.weeklyTrips ?? '—'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">لا توجد سيارات</p>
              );
            })()}
          </div>
        </div>
      )}

      {/* Deduct Dialog */}
      {isDeductDialogOpen && (
        <div className="fixed inset-0 z-[999] bg-#022949 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsDeductDialogOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">خصم من العمولة</h3>
              <button onClick={() => setIsDeductDialogOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ المطلوب خصمه *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                  placeholder="أدخل المبلغ"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                {driverEarnings && <p className="text-xs text-gray-500 mt-1">العمولة : {driverEarnings.appCommission.toFixed(2)}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الملاحظات (اختياري)</label>
                <textarea
                  value={deductNote}
                  onChange={(e) => setDeductNote(e.target.value)}
                  placeholder="أضف ملاحظة عن سبب الخصم"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsDeductDialogOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                  إلغاء
                </button>
                <button
                  onClick={handleDeduct}
                  disabled={isSubmitting || !deductAmount.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isSubmitting || !deductAmount.trim() ? 'bg-red-600/60 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  } transition-colors`}
                >
                  {isSubmitting ? 'جاري الخصم...' : 'خصم'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] bg-#022949 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow"
            >
              <HiX className="w-5 h-5 text-black" />
            </button>

            <img
              src={previewImage}
              alt="preview"
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}


      {isApproveModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-#022949 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl p-6">

            <h3 className="text-lg font-bold mb-4">
              اعتماد أنواع السيارة
            </h3>

            {carTypeApprovals.map((ct) => {
              const car = Array.isArray(driver?.getCarDriverDtos)
                ? driver.getCarDriverDtos[0]
                : driver?.getCarDriverDtos;

              const type = car?.carTypes?.find(t => t.id === ct.carTypeId);

              return (
                <div key={ct.carTypeId} className="border rounded-lg p-3 mb-3">
                  <p className="font-medium mb-2">{type?.name}</p>

                  <select
                    value={ct.status}
                    onChange={(e) => {
                      const value = Number(e.target.value) as 1 | 2;
                      setCarTypeApprovals(prev =>
                        prev.map(x =>
                          x.carTypeId === ct.carTypeId
                            ? { ...x, status: value }
                            : x
                        )
                      );
                    }}
                    className="border rounded p-1 w-full mb-2"
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
                        prev.map(x =>
                          x.carTypeId === ct.carTypeId
                            ? { ...x, adminNotes: value }
                            : x
                        )
                      );
                    }}
                  />
                </div>
              );
            })}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                إلغاء
              </button>

              <button
                onClick={handleApproveCarTypes}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default DriverDetails;