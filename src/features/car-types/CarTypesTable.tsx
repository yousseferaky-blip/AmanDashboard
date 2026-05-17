import React from 'react';
import { HiCheckCircle, HiXCircle, HiPencil, HiTrash } from 'react-icons/hi';
import type { CarType } from './types';

interface CarTypesTableProps {
  items: CarType[];
  onEdit?: (item: CarType) => void;
  onDelete?: (item: CarType) => void;
}

const formatPrice = (n?: number) => (n != null ? n.toFixed(2) : '-');

const CarTypesTable: React.FC<CarTypesTableProps> = ({ items, onEdit, onDelete }) => {
  // Read country from localStorage (set by CountrySwitcher)
  const countryCode = localStorage.getItem('countryCode') || '+20';
  const isYemen = countryCode === '+967';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الصورة</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الاسم</th>

              {isYemen ? (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-yellow-700 bg-yellow-50">سعر/كم (اليمن)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-yellow-700 bg-yellow-50">الحد الأدنى للأجرة (اليمن)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-yellow-700 bg-yellow-50">سعر الازدحام (اليمن)</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">سعر/كم</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الحد الأدنى للأجرة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">أدنى</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">أعلى</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">السعر لكل كيلومتر وقت الازدحام</th>
                </>
              )}

              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الحالة</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الوصف</th>
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">إجراءات</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((car, idx) => (
              <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="h-12 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={car.imageUrl} alt={car.name} className="h-full w-full object-contain" loading="lazy" />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{car.name}</td>

                {isYemen ? (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap bg-yellow-50/40">{formatPrice(car.pricePerKmYemen)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap bg-yellow-50/40">{formatPrice(car.minimumFareYemen)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap bg-yellow-50/40">{formatPrice(car.surgePriceMultiplierYemen)}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{formatPrice(car.pricePerKm)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{formatPrice(car.minimumFare)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{formatPrice(car.minPricePerKm)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{formatPrice(car.maxPricePerKm)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{formatPrice(car.surgePriceMultiplier)}</td>
                  </>
                )}

                <td className="px-4 py-3 whitespace-nowrap">
                  {car.isActive ? (
                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full text-xs">
                      <HiCheckCircle className="w-4 h-4" /> نشطة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full text-xs">
                      <HiXCircle className="w-4 h-4" /> غير نشطة
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-[24rem]">
                  <div className="line-clamp-2">{car.description || '-'}</div>
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(car)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-blue-600 hover:bg-blue-50 border border-blue-200 text-xs"
                          title="تعديل"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(car)}
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
                <td colSpan={onEdit || onDelete ? 11 : 10} className="px-4 py-10 text-center text-gray-500">
                  لا توجد بيانات أنواع سيارات حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CarTypesTable;