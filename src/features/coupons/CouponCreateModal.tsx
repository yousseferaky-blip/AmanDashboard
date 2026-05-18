import React, { useMemo } from 'react';
import { HiX } from 'react-icons/hi';

interface FormState {
  discountValue: string;
  isPercentage: boolean;
  startDate: string;
  endDate: string;
  maxUsageCount: string;
  maxUsagePerUser: string;
  description: string;
  newCode: string;
}

interface Props {
  isOpen: boolean;
  isEditMode?: boolean;
  form: FormState;
  submitting: boolean;
  formError: string | null;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CouponCreateModal: React.FC<Props> = ({
  isOpen,
  isEditMode = false,
  form,
  submitting,
  formError,
  onClose,
  onChange,
  onCheckboxChange,
  onSubmit,
}) => {
  const canSubmit = useMemo(() => {
    return (
      form.discountValue &&
      form.startDate &&
      form.endDate &&
      form.description.trim() &&
      form.newCode.trim()
    );
  }, [form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-#022949 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{isEditMode ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-4 sm:px-5 py-4 space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs sm:text-sm">{formError}</div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكود *</label>
              <input
                name="newCode"
                value={form.newCode}
                onChange={onChange}
                className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                placeholder=" الكود..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                rows={3}
                placeholder="وصف الكوبون..."
                required
              />
            </div>
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={onChange}
                  className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  placeholder="10"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.isPercentage ? 'يتم تطبيق الخصم كنسبة مئوية' : 'يتم تطبيق الخصم كمبلغ ثابت بالريال'}
                </p>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPercentage"
                    checked={form.isPercentage}
                    onChange={onCheckboxChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">نسبة مئوية</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChange}
                  className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChange}
                  className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حد الاستخدام العام</label>
              <input
                type="number"
                min="0"
                name="maxUsageCount"
                value={form.maxUsageCount}
                onChange={onChange}
                className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                placeholder="0 (غير محدود)"
              />
              <p className="text-xs text-gray-500 mt-1">اتركه 0 أو فارغاً لاستخدام غير محدود</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حد الاستخدام للشخص الواحد</label>
              <input
                type="number"
                min="0"
                name="maxUsagePerUser"
                value={form.maxUsagePerUser}
                onChange={onChange}
                className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                placeholder="...."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`w-full sm:w-auto px-4 py-2 text-sm sm:text-base rounded-lg text-black hover:text-white ${
                submitting || !canSubmit ? 'bg-#022949 cursor-not-allowed' : 'bg-#022949 hover:bg-indigo-700'
              } transition-colors`}
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponCreateModal;

