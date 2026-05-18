import React, { useMemo } from 'react';
import { HiX } from 'react-icons/hi';

interface FormState {
  level: string;
  requiredTrips: string;
  commissionPercentage: string;
}

interface Props {
  isOpen: boolean;
  isEditMode?: boolean;
  form: FormState;
  submitting: boolean;
  formError: string | null;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LevelCreateModal: React.FC<Props> = ({
  isOpen,
  isEditMode = false,
  form,
  submitting,
  formError,
  onClose,
  onChange,
  onSubmit,
}) => {
  const canSubmit = useMemo(() => {
    return form.level && form.requiredTrips && form.commissionPercentage;
  }, [form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-#022949 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'تعديل مستوى' : 'إضافة مستوى جديد'}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-5 py-4 space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{formError}</div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المستوى *</label>
              <input
                type="number"
                name="level"
                value={form.level}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                placeholder="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرحلات المطلوبة *</label>
              <input
                type="number"
                name="requiredTrips"
                value={form.requiredTrips}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                placeholder="10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نسبة العمولة (%) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                name="commissionPercentage"
                value={form.commissionPercentage}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                placeholder="10"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`px-4 py-2 rounded-lg text-black hover:text-white ${
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

export default LevelCreateModal;
