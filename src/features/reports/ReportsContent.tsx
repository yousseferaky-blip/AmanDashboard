import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChartBar } from 'react-icons/hi';

const ReportsContent: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <HiOutlineChartBar className="w-8 h-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">التقارير</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-lg text-gray-600">هنا يمكنك عرض وتحليل تقارير النظام.</p>
      </div>
    </motion.div>
  );
};

export default ReportsContent; 