import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineKey } from 'react-icons/hi';

const CodesContent: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <HiOutlineKey className="w-8 h-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">إدارة الأكواد</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-lg text-gray-600">هنا يمكنك إدارة الأكواد في النظام.</p>
      </div>
    </motion.div>
  );
};

export default CodesContent; 