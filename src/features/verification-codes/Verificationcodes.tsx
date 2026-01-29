import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/AxiosIntance";
import Swal from "sweetalert2";
import LoadingSpinner from "../../assets/LoadingSpinner";

const VerificationCodes = () => {
  const [codes, setCodes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    pageSize: 20,
  });

  const [pagination, setPagination] = useState(null);

  /* ================= FETCH CODES ================= */

  const fetchCodes = async () => {
    setLoading(true);
    
    const cleanedFilters = {
    ...filters,
    search: filters.search.trim(),
  };

    try {
      const res = await axiosInstance.get(
        "/admin/VerificationCodes",
        { params: cleanedFilters  }
      );

      if (res.data.success) {
        setCodes(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      Swal.fire("خطأ", "فشل تحميل رموز التحقق", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH STATISTICS ================= */

  const fetchStatistics = async () => {
    try {
      const res = await axiosInstance.get(
        "/admin/VerificationCodes/statistics"
      );
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* ================= DELETE ONE ================= */

  const deleteCode = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف رمز التحقق نهائيًا",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(
        `/admin/VerificationCodes/${id}`
      );

      Swal.fire("تم", "تم الحذف بنجاح", "success");
      fetchCodes();
      fetchStatistics();
    } catch (error) {
      Swal.fire("خطأ", "فشل الحذف", "error");
    }
  };

  /* ================= DELETE ALL ================= */
  
  const deleteAll = async () => {
    const result = await Swal.fire({
      title: "تحذير!",
      text: "سيتم حذف جميع رموز التحقق",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "حذف الكل",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(
        "/admin/VerificationCodes/cleanup"
      );

      Swal.fire("تم", "تم حذف جميع الرموز", "success");
      fetchCodes();
      fetchStatistics();
    } catch (error) {
      Swal.fire("خطأ", "فشل العملية", "error");
    }
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    fetchCodes();
  }, [filters]);

  useEffect(() => {
    fetchStatistics();
  }, []);

    if (loading) return <LoadingSpinner />;

  /* ================= UI ================= */

  return (
    <div className="p-6">
      
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">رموز التحقق</h2>
        <button
          onClick={deleteAll}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          حذف الكل
        </button>
      </div>

      {/* STATISTICS */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-gray-100 rounded">الإجمالي: {stats.total}</div>
          <div className="p-3 bg-green-100 rounded">نشط: {stats.active}</div>
          <div className="p-3 bg-red-100 rounded">منتهي: {stats.expired}</div>
        </div>
      )}

      {/* FILTERS */}
      
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* STATUS */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          className="border px-3 py-2 rounded"
        >
          <option value="all">الكل</option>
          <option value="active">نشط</option>
          <option value="expired">منتهي</option>
          <option value="used">مستخدم</option>
        </select>

        {/* SEARCH */}

        <input
          type="text"
          placeholder="بحث برقم الهاتف / الكود"
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
          className="border px-3 py-2 rounded w-64"
        />
      </div>


      {/* TABLE */}

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">الهاتف</th>
            <th className="p-2">الكود</th>
            <th className="p-2">الحالة</th>
            <th className="p-2">المستخدم</th>
            <th className="p-2">الإيميل</th>
            <th className="p-2">تاريخ الإنشاء</th>
            <th className="p-2">الانتهاء</th>
            <th className="p-2">المتبقي</th>
            <th className="p-2">إجراء</th>
          </tr>
        </thead>
      <tbody>
        {codes.map((item) => (
          <tr key={item.id} className="border-t text-sm">
            <td className="p-2">{item.phoneNumber}</td>
            <td className="p-2 font-bold">{item.code}</td>

            <td className="p-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  item.isExpired
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {item.status}
              </span>
            </td>

            <td className="p-2">{item.userName}</td>
            <td className="p-2">{item.userEmail || "-"}</td>

            <td className="p-2">
              {new Date(item.createdAt).toLocaleString("ar-EG")}
            </td>

            <td className="p-2">
              {new Date(item.expiresAt).toLocaleString("ar-EG")}
            </td>

            <td className="p-2">{item.timeRemaining}</td>

            <td className="p-2">
              <button
                onClick={() => deleteCode(item.id)}
                 className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
              >
                حذف
              </button>
            </td>
          </tr>
        ))}
      </tbody>

      </table>


      {/* PAGINATION */}

      {pagination && (
        <div className="flex justify-between items-center mt-6">
          {/* PAGE SIZE */}
          <select
            value={filters.pageSize}
            onChange={(e) =>
              setFilters({
                ...filters,
                pageSize: Number(e.target.value),
                page: 1,
              })
            }
            className="border px-3 py-2 rounded"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          {/* PAGE CONTROLS */}
          <div className="flex gap-2">
            <button
              disabled={filters.page === 1}
              onClick={() =>
                setFilters({ ...filters, page: filters.page - 1 })
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              السابق
            </button>

            <span className="px-3 py-1">
              صفحة {pagination.currentPage} من {pagination.totalPages}
            </span>

            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() =>
                setFilters({ ...filters, page: filters.page + 1 })
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default VerificationCodes;
