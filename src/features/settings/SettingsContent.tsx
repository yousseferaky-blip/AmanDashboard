import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineCog, 
  HiUser, 
  HiMail, 
  HiPhone, 
  HiCalendar,
  HiShieldCheck,
  HiTruck,
  HiClipboardList,
  HiStar,
  HiRefresh,
  HiPencil,
  HiX,
  HiCheck,
  HiPhotograph
} from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';

interface UserProfile {
  id: string;
  phoneNumber: string;
  name: string;
  email: string;
  profileImage: string | null;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string | null;
  fcmToken: string | null;
  token: string | null;
  role: string;
  driverStatus: string | null;
  drivingLicense: string | null;
  hasCar: boolean;
  carId: string | null;
  level: number;
  tripsCount: number;
  weeklyTrips: number;
  getCarDriverDtos: any | null;
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: UserProfile;
  errors: string[];
}

const SettingsContent: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    profileImage: null as File | null
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get<ApiResponse>('/Users/profile');
      if (response.data.success) {
        setProfile(response.data.data);
      } else {
        setError(response.data.message || 'فشل في جلب بيانات الملف الشخصي');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async () => {
    try {
      setUpdating(true);
      setUpdateError(null);

      const formData = new FormData();
      formData.append('Name', editForm.name);
      formData.append('Email', editForm.email);
      
      if (editForm.profileImage) {
        formData.append('ProfileImage', editForm.profileImage);
      }

      const response = await axiosInstance.put('/Users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // إعادة جلب البيانات المحدثة
        await fetchProfile();
        setIsEditing(false);
        setEditForm({ name: '', email: '', profileImage: null });
      } else {
        setUpdateError(response.data.message || 'فشل في تحديث البيانات');
      }
    } catch (err: any) {
      setUpdateError(err?.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditStart = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        email: profile.email || '',
        profileImage: null
      });
      setIsEditing(true);
      setUpdateError(null);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '', profileImage: null });
    setUpdateError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        setUpdateError('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // التحقق من حجم الملف (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateError('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      
      setEditForm(prev => ({ ...prev, profileImage: file }));
      setUpdateError(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'غير محدد';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HiOutlineCog className="w-6 h-6 sm:w-8 sm:h-8 text-[#F39500]" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">الإعدادات</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && profile && (
            <button
              onClick={handleEditStart}
              disabled={loading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <HiPencil className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">تحرير</span>
            </button>
          )}
          <button
            onClick={fetchProfile}
            disabled={loading}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#F39500] text-white rounded-lg hover:bg-[#e8850e] transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <HiRefresh className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 flex flex-col items-center justify-center min-h-[150px] sm:min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#F39500] mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base text-center">جاري تحميل بيانات الملف الشخصي...</p>
        </div>
      )}

      {error && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineCog className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
            <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {!loading && !error && profile && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* بطاقة الملف الشخصي الرئيسية */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            {isEditing ? (
              /* نموذج التحرير */
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">تحرير الملف الشخصي</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={updateProfile}
                      disabled={updating}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      <HiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      {updating ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button
                      onClick={handleEditCancel}
                      disabled={updating}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      <HiX className="w-3 h-3 sm:w-4 sm:h-4" />
                      إلغاء
                    </button>
                  </div>
                </div>

                {updateError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{updateError}</p>
                  </div>
                )}

                <div className="space-y-4 sm:space-y-6">
                  {/* تحرير الصورة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة الملف الشخصي
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-shrink-0">
                        {profile.profileImage ? (
                          <img
                            src={profile.profileImage}
                            alt="صورة الملف الشخصي"
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#F39500] to-orange-600 rounded-full flex items-center justify-center">
                            <HiUser className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="profileImage"
                        />
                        <label
                          htmlFor="profileImage"
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-full"
                        >
                          <HiPhotograph className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          <span className="text-xs sm:text-sm text-gray-600 truncate">
                            {editForm.profileImage ? editForm.profileImage.name : 'اختيار صورة جديدة'}
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          يُفضل صور بحجم أقل من 5MB وبصيغة JPG أو PNG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* تحرير الاسم */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39500] text-sm sm:text-base"
                        placeholder="أدخل الاسم"
                      />
                    </div>

                    {/* تحرير البريد الإلكتروني */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39500] text-sm sm:text-base"
                        placeholder="أدخل البريد الإلكتروني"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* عرض البيانات */
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="صورة الملف الشخصي"
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#F39500] to-orange-600 rounded-full flex items-center justify-center ${profile.profileImage ? 'hidden' : ''}`}>
                      <HiUser className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{profile.name}</h2>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                        <HiMail className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base break-all">{profile.email}</span>
                      </div>
                      {profile.phoneNumber && (
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                          <HiPhone className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">{profile.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <HiShieldCheck className={`w-4 h-4 sm:w-5 sm:h-5 ${profile.isPhoneVerified ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={`text-xs sm:text-sm font-medium ${profile.isPhoneVerified ? 'text-green-600' : 'text-gray-500'}`}>
                          {profile.isPhoneVerified ? 'هاتف موثق' : 'هاتف غير موثق'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* معلومات إضافية - تظهر فقط في وضع العرض */}
            {!isEditing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">معلومات الحساب</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base text-gray-600">المعرف:</span>
                      <span className="text-xs sm:text-sm font-mono text-gray-800 break-all">{profile.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base text-gray-600">تاريخ الإنشاء:</span>
                      <span className="text-xs sm:text-sm text-gray-800">{formatDate(profile.createdAt)}</span>
                    </div>
                    {profile.updatedAt && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm sm:text-base text-gray-600">آخر تحديث:</span>
                        <span className="text-xs sm:text-sm text-gray-800">{formatDate(profile.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">معلومات تقنية</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base text-gray-600">FCM Token:</span>
                      <span className={`text-xs sm:text-sm ${profile.fcmToken ? 'text-green-600' : 'text-gray-400'}`}>
                        {profile.fcmToken ? 'متوفر' : 'غير متوفر'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base text-gray-600">Token:</span>
                      <span className={`text-xs sm:text-sm ${profile.token ? 'text-green-600' : 'text-gray-400'}`}>
                        {profile.token ? 'متوفر' : 'غير متوفر'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base text-gray-600">المستوى:</span>
                      <span className="text-xs sm:text-sm text-gray-800">{profile.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </motion.div>
  );
};

export default SettingsContent; 