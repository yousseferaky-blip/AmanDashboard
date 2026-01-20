import React from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiPlus, HiSearch, HiFilter } from 'react-icons/hi';

const EmployeesContent: React.FC = () => {
  const employees = [
    { id: 1, name: 'أحمد الموظف', position: 'مدير', department: 'الإدارة', status: 'نشط' },
    { id: 2, name: 'فاطمة الموظفة', position: 'محاسبة', department: 'المالية', status: 'نشط' },
    { id: 3, name: 'علي الموظف', position: 'مطور', department: 'التقنية', status: 'نشط' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h1>
          <p className="text-gray-600">إدارة جميع الموظفين في النظام</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <HiPlus className="w-5 h-5 inline ml-2" />
          إضافة موظف
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن موظف..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <HiFilter className="w-5 h-5" />
            تصفية
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">قائمة الموظفين</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {employees.map((employee) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <HiUser className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    employee.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{employee.department}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeesContent; 