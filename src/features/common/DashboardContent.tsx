import React from 'react';
import { motion } from 'framer-motion';
import { 
  HiCurrencyDollar, 
  HiCube, 
  HiUsers, 
  HiTag,
  HiPlus,
  HiChartBar,
  HiUserGroup,
  HiCog,
  HiCheckCircle,
  HiClock,
  HiPlusCircle,
  HiCheck
} from 'react-icons/hi';

const DashboardContent: React.FC = () => {
  const stats = [
    { title: 'إجمالي المبيعات', value: '١٢٥,٤٣٢', change: '+12%', icon: HiCurrencyDollar, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'الطلبات الجديدة', value: '٨٤٧', change: '+8%', icon: HiCube, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'العملاء النشطين', value: '٢,٤٣١', change: '+15%', icon: HiUsers, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'المنتجات المتاحة', value: '١,٢٣٤', change: '+5%', icon: HiTag, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  const recentOrders = [
    { id: '#1234', customer: 'أحمد محمد', amount: '١,٢٠٠', status: 'مكتمل', icon: HiCheckCircle },
    { id: '#1235', customer: 'فاطمة علي', amount: '٨٠٠', status: 'قيد المعالجة', icon: HiClock },
    { id: '#1236', customer: 'علي حسن', amount: '٢,١٠٠', status: 'مكتمل', icon: HiCheckCircle },
    { id: '#1237', customer: 'سارة أحمد', amount: '٦٥٠', status: 'قيد المعالجة', icon: HiClock },
  ];

  const quickActions = [
    { name: 'إضافة منتج', icon: HiPlus, color: 'bg-blue-50 hover:bg-blue-100', iconColor: 'text-blue-600' },
    { name: 'عرض التقارير', icon: HiChartBar, color: 'bg-green-50 hover:bg-green-100', iconColor: 'text-green-600' },
    { name: 'إدارة العملاء', icon: HiUserGroup, color: 'bg-purple-50 hover:bg-purple-100', iconColor: 'text-purple-600' },
    { name: 'الإعدادات', icon: HiCog, color: 'bg-orange-50 hover:bg-orange-100', iconColor: 'text-orange-600' },
  ];

  const activities = [
    { message: 'تم إضافة منتج جديد "لابتوب جيمنج"', time: 'منذ 5 دقائق', status: 'success', icon: HiPlusCircle },
    { message: 'تم إكمال طلب #1234 بنجاح', time: 'منذ 15 دقيقة', status: 'success', icon: HiCheck },
    { message: 'مستخدم جديد انضم للنظام', time: 'منذ ساعة', status: 'info', icon: HiUsers },
  ];

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
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-3">مرحباً بك في لوحة التحكم</h1>
        <p className="text-blue-100 text-lg">تابع أداء متجرك وادارة عملياتك بسهولة</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between"> 


              <div>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className={`text-sm font-medium ${stat.color}`}>{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">الطلبات الحديثة</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <order.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-lg">{order.amount}</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      order.status === 'مكتمل' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">الإجراءات السريعة</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.button 
                  key={action.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 ${action.color}`}
                >
                  <action.icon className={`text-3xl ${action.iconColor}`} />
                  <span className="text-sm font-medium text-gray-700">{action.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">نشاط النظام</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 
                  activity.status === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <activity.icon className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-600 flex-1">{activity.message}</p>
                <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardContent; 