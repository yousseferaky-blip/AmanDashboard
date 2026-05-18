import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../../api/AxiosIntance";
import Swal from "sweetalert2";
import {
  HiX,
  HiPlus,
  HiEye,
  HiPencil,
  HiTrash,
  HiSwitchHorizontal,
} from "react-icons/hi";
import LoadingSpinner from "../../assets/LoadingSpinner";

/* ================= Interface ================= */

interface AdvertisementForm {
  id?: number | string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  mediaType: string;
  mediaFile: File | null;
  mediaUrl: string;
  mediaURL?: string;
  mediaPath?: string;
  MediaUrl?: string;
  actionUrl: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

/* ================= CONFIG ================= */

const FILE_BASE_URL = "https://amanapi.runasp.net/";

/* ================= SMALL COMPONENT ================= */

const Field = ({ label, value }) => (
  <div className="space-y-1">
    <span className="text-sm text-gray-500">{label}</span>
    <div className="font-medium text-gray-800 break-all">
      {value || "-"}
    </div>
  </div>
);

/* ================= MODAL ================= */

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  form: AdvertisementForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  mode,
  form,
  onChange,
  onSubmit,
  submitting,
}) => {
  if (!isOpen) return null;

  const isView = mode === "view";

  const rawMedia =
    form.mediaUrl ||
    form.mediaURL ||
    form.mediaPath ||
    form.MediaUrl ||
    "";

  const previewSrc = form.mediaFile
    ? URL.createObjectURL(form.mediaFile)
    : rawMedia
    ? rawMedia.startsWith("http")
      ? rawMedia
      : FILE_BASE_URL + rawMedia.replace(/^\//, "")
    : "";

  return (
    <div
      className="fixed inset-0 z-[999] bg-#022949 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-#D89022 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-#D89022">
          <h3 className="text-lg font-bold">
            {mode === "add" && "إضافة إعلان"}
            {mode === "edit" && "تعديل إعلان"}
            {mode === "view" && "تفاصيل الإعلان"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {previewSrc && (
            <div className="border rounded-xl overflow-hidden bg-gray-50">
              {form.mediaType === "Video" ? (
                <video
                  src={previewSrc}
                  controls
                  className="w-full max-h-[400px] bg-#022949"
                />
              ) : (
                <img
                  src={previewSrc}
                  alt="Advertisement"
                  className="w-full max-h-[400px] object-contain"
                />
              )}
            </div>
          )}

          {isView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="العنوان (عربي)" value={form.titleAr} />
              <Field label="العنوان (إنجليزي)" value={form.titleEn} />
              <Field label="الوصف (عربي)" value={form.descriptionAr} />
              <Field label="الوصف (إنجليزي)" value={form.descriptionEn} />
              <Field label="نوع الإعلان" value={form.mediaType} />
              <Field label="Action URL" value={form.actionUrl} />
              <Field label="تاريخ البداية" value={form.startDate} />
              <Field label="تاريخ النهاية" value={form.endDate} />
              <Field
                label="الحالة"
                value={form.isActive ? "نشط" : "غير نشط"}
              />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="titleAr"
                  value={form.titleAr}
                  onChange={onChange}
                  placeholder="العنوان عربي"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  name="titleEn"
                  value={form.titleEn}
                  onChange={onChange}
                  placeholder="العنوان إنجليزي"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <textarea
                name="descriptionAr"
                value={form.descriptionAr}
                onChange={onChange}
                placeholder="الوصف عربي"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <textarea
                name="descriptionEn"
                value={form.descriptionEn}
                onChange={onChange}
                placeholder="الوصف إنجليزي"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <select
                name="mediaType"
                value={form.mediaType}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Image">Image</option>
                <option value="Video">Video</option>
              </select>

              <input
                type="file"
                name="mediaFile"
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                name="actionUrl"
                value={form.actionUrl}
                onChange={onChange}
                placeholder="Action URL"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 border rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-700 text-white rounded-lg"
                >
                  {submitting ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

/* ================= PAGE ================= */

const Advertisement = () => {
  
  const emptyForm: AdvertisementForm = {
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    mediaType: "Image",
    mediaFile: null,
    mediaUrl: "",
    actionUrl: "",
    startDate: "",
    endDate: "",
};

  const [ads, setAds] = useState<AdvertisementForm[]>([]);
  const [form, setForm] = useState<AdvertisementForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] =
  useState<"add" | "edit" | "view">("add");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/Advertisement");
        setAds(res.data.data);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  /* ===== Toggle Active with SweetAlert ===== */

  const toggleActive = async (ad: AdvertisementForm) => {
    const active = ad.isActive;

    const res = await Swal.fire({
      title: active ? "إيقاف الإعلان؟" : "تفعيل الإعلان؟",
      text: active
        ? "سيتم إيقاف الإعلان"
        : "سيتم تفعيل الإعلان",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم",
      cancelButtonText: "إلغاء",
    });

    if (!res.isConfirmed) return;

    await axiosInstance.patch(`/Advertisement/${ad.id}/toggle`);
    Swal.fire("تم", "تم تغيير الحالة بنجاح", "success");
    fetchAds();
  };

  const deleteAd = async (id: number | string | undefined) => {
    const res = await Swal.fire({
      title: "حذف الإعلان؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "حذف",
      cancelButtonText: "إلغاء",
    });

    if (!res.isConfirmed) return;

    await axiosInstance.delete(`/Advertisement/${id}`);
    Swal.fire("تم", "تم الحذف", "success");
    fetchAds();
  };



  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex justify-between mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">الإعلانات</h1>
          <p className="text-gray-500">إدارة الإعلانات</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setModalMode("add");
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-700 text-white rounded-lg"
        >
          <HiPlus /> إضافة إعلان
        </button>
      </div>

      {/* Table */}
      <div className="bg-#D89022 rounded-xl border overflow-hidden">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">العنوان</th>
              <th className="px-4 py-3">النوع</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  لا توجد إعلانات
                </td>
              </tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{ad.titleAr}</td>
                  <td className="px-4 py-3">{ad.mediaType}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        ad.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ad.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center"> <div className="flex justify-center gap-3"> <HiEye title="عرض" className="cursor-pointer text-blue-600" onClick={() => { setForm(ad); setModalMode("view"); setModalOpen(true); }} /> <HiPencil title="تعديل" className="cursor-pointer text-yellow-600" onClick={() => { setForm(ad); setModalMode("edit"); setModalOpen(true); }} /> <HiSwitchHorizontal title="تفعيل / إيقاف" className="cursor-pointer text-indigo-600" onClick={() => toggleActive(ad)} /> <HiTrash title="حذف" className="cursor-pointer text-red-600" onClick={() => deleteAd(ad.id)} /> </div> </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      </div>


      {/* Modal */}
      <AdModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        form={form}
        submitting={submitting}
        onChange={(e) => {
            const target = e.target;

            if (target instanceof HTMLInputElement && target.type === "file") {
              setForm((p) => ({
                ...p,
                [target.name]: target.files ? target.files[0] : null,
              }));
            } else {
              const { name, value } =
                target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

              setForm((p) => ({
                ...p,
                [name]: value,
              }));
            }
          }}
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);

          try {
            const fd = new FormData();
            fd.append("MediaType", form.mediaType);
            if (form.mediaFile) fd.append("MediaFile", form.mediaFile);
            fd.append("titleAr", form.titleAr);
            fd.append("titleEn", form.titleEn);
            fd.append("descriptionAr", form.descriptionAr);
            fd.append("descriptionEn", form.descriptionEn);
            fd.append("actionUrl", form.actionUrl);
            fd.append("startDate", form.startDate);
            fd.append("endDate", form.endDate);

            modalMode === "add"
              ? await axiosInstance.post("/Advertisement", fd)
              : await axiosInstance.put(`/Advertisement/${form.id}`, fd);

            Swal.fire("تم", "تم الحفظ بنجاح", "success");
            fetchAds();
            setModalOpen(false);
          } catch {
            Swal.fire("خطأ", "فشل الحفظ", "error");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </motion.div>
  );
};

export default Advertisement;
