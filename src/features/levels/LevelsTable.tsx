import React from 'react';
import { HiCheckCircle, HiXCircle, HiPencil, HiTrash, HiTrendingUp } from 'react-icons/hi';
import type { Level } from './types';

interface LevelsTableProps {
  items: Level[];
  onEdit?: (item: Level) => void;
  onDelete?: (item: Level) => void;
}

const LevelsTable: React.FC<LevelsTableProps> = ({ items, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">المستوى</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">نسبة العمولة</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الرحلات المطلوبة</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الأرباح</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">المزايا</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الحالة</th>
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">إجراءات</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((level, idx) => (
              <tr key={level.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <HiTrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">مستوى {level.level}</p>
                      <p className="text-xs text-gray-500">المستوى {level.level}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {level.commissionPercentage}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                  {level.requiredTrips}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  <span className="text-gray-400">—</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                  <div className="line-clamp-2">—</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full text-xs">
                    <HiCheckCircle className="w-4 h-4" /> نشط
                  </span>
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(level)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-blue-600 hover:bg-blue-50 border border-blue-200 text-xs"
                          title="تعديل"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(level)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-red-600 hover:bg-red-50 border border-red-200 text-xs"
                          title="حذف"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={onEdit || onDelete ? 8 : 7} className="px-4 py-10 text-center text-gray-500">
                  لا توجد مستويات حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LevelsTable;
