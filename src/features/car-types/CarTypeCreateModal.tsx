import React, { useMemo } from 'react';

interface FormState {
  name: string;
  pricePerKm: string;
  minimumFare: string;
  surgePriceMultiplier: string;
  isActive: boolean;
  description: string;
  imageFile: File | null;
}

interface Props {
  isOpen: boolean;
  isEditMode?: boolean;
  form: FormState;
  previewUrl: string | null;
  submitting: boolean;
  formError: string | null;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CarTypeCreateModal: React.FC<Props> = ({
  isOpen,
  isEditMode = false,
  form,
  previewUrl,
  submitting,
  formError,
  onClose,
  onChange,
  onImage,
  onSubmit,
}) => {
  const canSubmit = useMemo(() => {
    if (isEditMode) {
      return form.name.trim() && form.pricePerKm; // For edit, image is optional
    }
    return form.name.trim() && form.pricePerKm && form.imageFile; // For create, image is required
  }, [form, isEditMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'تعديل نوع سيارة' : 'إضافة نوع سيارة'}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="إغلاق">X</button>
        </div>
        <form onSubmit={onSubmit} className="px-5 py-4 space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{formError}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
              <input name="name" value={form.name} onChange={onChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800" placeholder="اكتب اسم النوع" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سعر/كم</label>
              <input type="number" step="0.01" min="0" name="pricePerKm" value={form.pricePerKm} onChange={onChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800" placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للأجرة</label>
              <input type="number" step="0.01" min="0" name="minimumFare" value={form.minimumFare} onChange={onChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800" placeholder="0.00" />
            </div>
            <div>
  <label className="block text-sm font-medium mb-1">
          السعر لكل كيلو متر وقت الازدحام
  </label>
  <input
    type="number"
    step="0.1"
    name="surgePriceMultiplier"
    value={form.surgePriceMultiplier}
    onChange={onChange}
    placeholder="مثال: 1.5"
    className="w-full rounded-lg border px-3 py-2"
  />
</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} className="rounded" />
                <span className="text-sm text-gray-700">نشط</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea name="description" value={form.description} onChange={onChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-800" rows={3} placeholder="وصف مختصر..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">الصورة {!isEditMode && <span className="text-red-500">*</span>}</label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <span className="text-sm text-gray-600">{isEditMode ? 'تغيير الصورة' : 'اختر صورة'}</span>
                <input type="file" accept="image/*" onChange={onImage} className="hidden" />
              </label>
              {previewUrl && (
                <div className="mt-2 h-24 w-32 bg-gray-100 rounded-lg overflow-hidden border">
                  <img src={previewUrl} alt="preview" className="h-full w-full object-contain" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">إلغاء</button>
            <button type="submit" disabled={!canSubmit || submitting} className={`px-4 py-2 rounded-lg text-white ${submitting || !canSubmit ? 'bg-indigo-800/60' : 'bg-indigo-800 hover:bg-indigo-700'} transition-colors`}>
              {submitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarTypeCreateModal; 