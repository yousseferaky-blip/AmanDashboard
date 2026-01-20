import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiUsers, 
  HiTag,
  HiRefresh,
  HiX,
  HiClipboardList,
  HiCurrencyDollar
} from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';

interface StatItem {
  value: number;
  deltaPercent: number | null;
  suffix: string | null;
}

interface RecentOrder {
  rideId: number;
  customerName: string;
  status: string;
  statusText: string;
  amount: number;
  createdAt: string;
}

interface DashboardData {
  totalRideCompleted: StatItem;
  newOrders: StatItem;
  activeCustomers: StatItem;
  availableCarType: StatItem;
  recentOrders: RecentOrder[];
  errors: unknown[];
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DashboardData;
}

const DashboardContent: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get<ApiResponse>('/admin/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.message || 'فشل في جلب بيانات لوحة التحكم');
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatPercentage = (percent: number | null, suffix: string | null) => {
    if (percent === null) return '';
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%${suffix || ''}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'غير محدد';
    }
  };


  // Generate stats array from API data
  const stats = dashboardData ? [
    { 
      title: 'إجمالي الرحلات المكتملة', 
      value: formatNumber(dashboardData.totalRideCompleted.value), 
      change: formatPercentage(dashboardData.totalRideCompleted.deltaPercent, dashboardData.totalRideCompleted.suffix), 
      icon: HiCurrencyDollar, 
      color: dashboardData.totalRideCompleted.deltaPercent && dashboardData.totalRideCompleted.deltaPercent >= 0 ? 'text-indigo-600' : 'text-red-600', 
      bgColor: dashboardData.totalRideCompleted.deltaPercent && dashboardData.totalRideCompleted.deltaPercent >= 0 ? 'bg-indigo-50' : 'bg-red-50' 
    },
    { 
      title: 'الطلبات الجديدة', 
      value: formatNumber(dashboardData.newOrders.value), 
      change: formatPercentage(dashboardData.newOrders.deltaPercent, dashboardData.newOrders.suffix), 
      icon: HiClipboardList, 
      color: dashboardData.newOrders.deltaPercent && dashboardData.newOrders.deltaPercent >= 0 ? 'text-indigo-600' : 'text-red-600', 
      bgColor: dashboardData.newOrders.deltaPercent && dashboardData.newOrders.deltaPercent >= 0 ? 'bg-indigo-50' : 'bg-red-50' 
    },
    { 
      title: 'العملاء النشطين', 
      value: formatNumber(dashboardData.activeCustomers.value), 
      change: formatPercentage(dashboardData.activeCustomers.deltaPercent, dashboardData.activeCustomers.suffix), 
      icon: HiUsers, 
      color: dashboardData.activeCustomers.deltaPercent && dashboardData.activeCustomers.deltaPercent >= 0 ? 'text-indigo-600' : 'text-red-600', 
      bgColor: dashboardData.activeCustomers.deltaPercent && dashboardData.activeCustomers.deltaPercent >= 0 ? 'bg-indigo-50' : 'bg-red-50' 
    },
    { 
      title: 'أنواع السيارات المتاحة', 
      value: formatNumber(dashboardData.availableCarType.value), 
      change: formatPercentage(dashboardData.availableCarType.deltaPercent, dashboardData.availableCarType.suffix), 
      icon: HiTag, 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-50' 
    },
  ] : [];





  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Welcome Section */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-1000"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight"
            >
              مرحباً بك في لوحة التحكم
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-base sm:text-lg leading-relaxed"
            >
              تابع أداء نظامك وادارة عملياتك بسهولة وفعالية
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 flex items-center gap-2 text-white/80"
            >
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <span className="text-sm">النظام متصل ويعمل بشكل طبيعي</span>
            </motion.div>
          </div>
          
          <motion.button
            onClick={fetchDashboardData}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-3 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg"
          >
            <HiRefresh className={`w-5 h-5 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            <span className="font-medium">تحديث البيانات</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
          <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-800 mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات لوحة التحكم...</p>
          </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl p-8 shadow-lg border border-red-200"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiX className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {!loading && !error && dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
                <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -8 }}
              className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gray-100 to-transparent rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2 group-hover:text-gray-600 transition-colors">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {stat.value}
                      </p>
                      {stat.change && (
                        <motion.span 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            stat.change.includes('+') 
                              ? 'bg-green-100 text-green-700' 
                              : stat.change.includes('-')
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {stat.change}
                        </motion.span>
                      )}
                    </div>
                  </div>
                  
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`p-3 rounded-2xl ${stat.bgColor} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color} transition-transform duration-300`} />
                  </motion.div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      stat.color.includes('indigo') ? 'from-indigo-400 to-indigo-600' :
                      stat.color.includes('red') ? 'from-red-400 to-red-600' :
                      stat.color.includes('blue') ? 'from-blue-400 to-blue-600' :
                      stat.color.includes('purple') ? 'from-purple-400 to-purple-600' :
                      'from-indigo-500 to-indigo-600'
                    }`}
                  ></motion.div>
                </div>
                  </div>
                </motion.div>
              ))}
            </div>
      )}

      {/* Recent Orders Section */}
      {!loading && !error && dashboardData && (
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                <HiClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">الطلبات الأخيرة</h3>
                <p className="text-sm text-gray-500">آخر الطلبات المكتملة</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order, index) => (
                  <motion.div
                    key={order.rideId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">#{order.rideId}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.statusText}
                      </span>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(order.amount)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiClipboardList className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">لا توجد طلبات حديثة</p>
                <p className="text-gray-400 text-sm mt-1">ستظهر الطلبات الجديدة هنا</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardContent; 