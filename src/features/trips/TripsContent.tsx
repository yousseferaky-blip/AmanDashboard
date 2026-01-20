import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiLocationMarker,
  HiSearch,
  HiFilter,
  HiChevronLeft,
  HiChevronRight,
  HiSelector,
  HiX,
  HiEye,
} from "react-icons/hi";
import axiosInstance from "../../api/AxiosIntance";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  joinDate: string;
  averageRating: number;
  totalRatings: number;
  completedRides: number;
}

interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalRides: number;
}

interface CarType {
  id: number;
  name: string;
  imageUrl: string;
  pricePerKm: number;
  minPricePerKm: number;
  maxPricePerKm: number;
  isActive: boolean;
  description: string;
  carDrivers: null;
}

interface CarInfo {
  id: number;
  carImage: string;
  brand: string;
  warrantyYear: number;
  passengerCount: number;
  color: string;
  plateNumber: string;
  registrationNumber: string;
  carTypeName: string;
  carTypeId: number;
}

interface RideItem {
  id: number;
  from: string;
  to: string;
  date: string;
  price: number;
  seats: number;
  status: "Pending" | "Accepted" | "Rejected" | "Completed";
  statusText: string;
  createdAt: string;
  updatedAt: string | null;
  driver: Driver;
  passenger: Passenger;
  car: CarInfo;
  rating: unknown | null;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

const statusBadge = (status: RideItem["status"], text: string) => {
  const map: Record<RideItem["status"], string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Accepted: "bg-blue-100 text-blue-800",
    Rejected: "bg-red-100 text-red-800",
    Completed: "bg-green-100 text-green-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${map[status]}`}>
      {text}
    </span>
  );
};

const TripsContent: React.FC = () => {
  // filters and list state
  const [driverName, setDriverName] = useState("");
  const [carType, setCarType] = useState("");
  const [status, setStatus] = useState<"" | RideItem["status"]>("");
  const [rideTime, setRideTime] = useState(""); // ISO string from input type="datetime-local"

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "date" | "price" | "status" | "driver" | ""
  >("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [items, setItems] = useState<RideItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RideItem | null>(null);

  // Car types state
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [carTypesLoading, setCarTypesLoading] = useState(false);

  // Route details dialog state
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const params = useMemo(() => {
    const p: Record<string, any> = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    };
    if (driverName.trim()) p.DriverName = driverName.trim();
    if (carType.trim()) p.CarTypeId = parseInt(carType.trim()); // Send as CarTypeId instead of CarType
    if (status) p.Status = status; // if API expects int, omit unless you know mapping
    if (rideTime) p.RideTime = new Date(rideTime).toISOString();
    if (sortBy) p.SortBy = sortBy;
    if (sortDirection) p.SortDirection = sortDirection;
    return p;
  }, [
    driverName,
    carType,
    status,
    rideTime,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  ]);

  const fetchCarTypes = async () => {
    setCarTypesLoading(true);
    try {
      const res = await axiosInstance.get<ApiResponse<CarType[]>>("/CarTypes");
      const carTypesList = res.data?.data ?? [];
      setCarTypes(carTypesList);
    } catch (err: any) {
      console.error(
        "تعذر جلب أنواع السيارات:",
        err?.response?.data?.message || err.message
      );
    } finally {
      setCarTypesLoading(false);
    }
  };

  const fetchRides = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get<ApiResponse<{ data: RideItem[] }>>(
        "/CarDriver/get-all-ride-for-admin",
        {
          params,
        }
      );
      const list = res.data?.data?.data ?? [];
      setItems(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || "تعذر جلب الرحلات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    fetchCarTypes();
  }, []);

  const canGoNext = items.length === pageSize; // heuristic if total not provided

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy !== key) {
      setSortBy(key);
      setSortDirection("asc");
    } else {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleString("ar-EG");
    } catch {
      return value;
    }
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleShowRouteDetails = (from: string, to: string) => {
    setSelectedRoute({ from, to });
    setRouteDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">إدارة الرحلات</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="relative">
            <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={driverName}
              onChange={(e) => {
                setPageNumber(1);
                setDriverName(e.target.value);
              }}
              placeholder="اسم السائق"
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39500]"
            />
          </div>
          <select
            value={carType}
            onChange={(e) => {
              setPageNumber(1);
              setCarType(e.target.value);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39500] bg-white"
            disabled={carTypesLoading}
          >
            <option value="">كل أنواع السيارات</option>
            {carTypes.map((type) => (
              <option key={type.id} value={type.id.toString()}>
                {type.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPageNumber(1);
              setStatus(e.target.value as any);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39500] bg-white"
          >
            <option value="">كل الحالات</option>
            <option value="Pending">في الانتظار</option>
            <option value="Accepted">مقبولة</option>
            <option value="Rejected">مرفوضة</option>
            <option value="Completed">مكتملة</option>
          </select>
          <input
            type="datetime-local"
            value={rideTime}
            onChange={(e) => {
              setPageNumber(1);
              setRideTime(e.target.value);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39500]"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <HiFilter className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            نتائج حسب المرشحات أعلاه
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">قائمة الرحلات</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">عدد الصفوف</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageNumber(1);
                setPageSize(Number(e.target.value));
              }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F39500]"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    #
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    من → إلى
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-gray-600 cursor-pointer"
                    onClick={() => toggleSort("date")}
                  >
                    التاريخ
                    <HiSelector className="inline w-4 h-4 mr-1 text-gray-400" />
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    السائق
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    الراكب
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    السيارة
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-gray-600 cursor-pointer"
                    onClick={() => toggleSort("price")}
                  >
                    السعر
                    <HiSelector className="inline w-4 h-4 mr-1 text-gray-400" />
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    المقاعد
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-gray-600 cursor-pointer"
                    onClick={() => toggleSort("status")}
                  >
                    الحالة
                    <HiSelector className="inline w-4 h-4 mr-1 text-gray-400" />
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {(pageNumber - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#F39500] rounded-full flex items-center justify-center text-white">
                          <HiLocationMarker className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-gray-800">
                            {truncateText(`${r.from} → ${r.to}`, 30)}
                          </div>
                          {`${r.from} → ${r.to}`.length > 30 && (
                            <button
                              onClick={() =>
                                handleShowRouteDetails(r.from, r.to)
                              }
                              className="text-[#F39500] hover:text-[#e8850e] transition-colors"
                              title="عرض التفاصيل كاملة"
                            >
                              <HiEye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {r.driver?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {r.passenger?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {r.car?.carTypeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {r.price}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {r.seats}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {statusBadge(r.status, r.statusText)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => setSelected(r)}
                        className="px-3 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      لا توجد رحلات مطابقة حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">صفحة {pageNumber}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber === 1 || loading}
            >
              <HiChevronRight className="inline w-4 h-4" /> السابق
            </button>
            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={!canGoNext || loading}
            >
              التالي <HiChevronLeft className="inline w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl h-[90vh] overflow-y-auto w-full max-w-3xl p-6 relative">
            <button
              className="absolute top-3 left-3 p-2 rounded hover:bg-gray-100"
              onClick={() => setSelected(null)}
              aria-label="إغلاق"
            >
              <HiX className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              تفاصيل الرحلة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-500">من → إلى</p>
                <p className="font-medium text-gray-800 break-words">
                  {selected.from}
                </p>
                <p className="font-medium text-gray-800 break-words">
                  {selected.to}
                </p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-500">التاريخ</p>
                <p className="font-medium text-gray-800">
                  {formatDate(selected.date)}
                </p>
                <p className="text-sm text-gray-500 mt-2">الحالة</p>
                <div>{statusBadge(selected.status, selected.statusText)}</div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-500">السعر</p>
                <p className="font-medium text-gray-800">{selected.price}</p>
                <p className="text-sm text-gray-500 mt-2">المقاعد</p>
                <p className="font-medium text-gray-800">{selected.seats}</p>
                <p className="text-sm text-gray-500 mt-2">رقم الرحلة</p>
                <p className="font-medium text-gray-800">{selected.id}</p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                <p className="font-medium text-gray-800">
                  {formatDate(selected.createdAt)}
                </p>
                {selected.updatedAt && (
                  <div>
                    <p className="text-sm text-gray-500 mt-2">آخر تحديث</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(selected.updatedAt)}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">التقييم</p>
                {/* <p className="font-medium text-gray-800">{selected.rating ?? '—'}</p> */}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded p-4">
                <h4 className="font-semibold text-gray-800 mb-2">السائق</h4>
                <p className="text-sm text-gray-500">الاسم</p>
                <p className="font-medium text-gray-800">
                  {selected.driver?.name || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">الجوال</p>
                <p className="font-medium text-gray-800">
                  {selected.driver?.phone || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">البريد</p>
                <p className="font-medium text-gray-800">
                  {selected.driver?.email || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">موثق</p>
                <p className="font-medium text-gray-800">
                  {selected.driver?.isVerified ? "نعم" : "لا"}
                </p>
                <p className="text-sm text-gray-500 mt-2">تاريخ الانضمام</p>
                <p className="font-medium text-gray-800">
                  {selected.driver?.joinDate
                    ? formatDate(selected.driver.joinDate)
                    : "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">رحلات مكتملة</p>
                <p className="font-medium text-gray-800">
                  {selected.driver?.completedRides ?? 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">متوسط التقييم</p>
                <p className="font-medium text-gray-800">
                  {selected.driver?.averageRating ?? 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">إجمالي التقييمات</p>
                <p className="font-medium text-gray-800">
                  {selected.driver?.totalRatings ?? 0}
                </p>
              </div>
              <div className="border rounded p-4">
                <h4 className="font-semibold text-gray-800 mb-2">الراكب</h4>
                <p className="text-sm text-gray-500">الاسم</p>
                <p className="font-medium text-gray-800">
                  {selected.passenger?.name || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">الجوال</p>
                <p className="font-medium text-gray-800">
                  {selected.passenger?.phone || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">البريد</p>
                <p className="font-medium text-gray-800">
                  {selected.passenger?.email || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">تاريخ الانضمام</p>
                <p className="font-medium text-gray-800">
                  {selected.passenger?.joinDate
                    ? formatDate(selected.passenger.joinDate)
                    : "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">إجمالي الرحلات</p>
                <p className="font-medium text-gray-800">
                  {selected.passenger?.totalRides ?? 0}
                </p>
              </div>
              <div className="border rounded p-4">
                <h4 className="font-semibold text-gray-800 mb-2">السيارة</h4>
                {selected.car?.carImage && (
                  <img
                    src={selected.car.carImage}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                )}
                <p className="text-sm text-gray-500">النوع</p>
                <p className="font-medium text-gray-800">
                  {selected.car?.carTypeName || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">اللون</p>
                <p className="font-medium text-gray-800">
                  {selected.car?.color || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">رقم اللوحة</p>
                <p className="font-medium text-gray-800">
                  {selected.car?.plateNumber || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">الماركة</p>
                <p className="font-medium text-gray-800">
                  {selected.car?.brand || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">سنة الضمان</p>
                <p className="font-medium text-gray-800">
                  {selected.car?.warrantyYear ?? "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">عدد الركاب</p>
                <p className="font-medium text-gray-800">
                  {selected.car?.passengerCount ?? "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">رقم التسجيل</p>
                <p className="font-medium text-gray-800">
                  {selected.car?.registrationNumber || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-2">نوع السيارة (ID)</p>
                <p className="font-medium text-gray-800">
                  {selected.car?.carTypeId ?? "—"}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md border"
                onClick={() => setSelected(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Details Dialog */}
      {routeDialogOpen && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative mx-4">
            <button
              className="absolute top-3 left-3 p-2 rounded hover:bg-gray-100"
              onClick={() => {
                setRouteDialogOpen(false);
                setSelectedRoute(null);
              }}
              aria-label="إغلاق"
            >
              <HiX className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-4 pr-8">
              تفاصيل المسار
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <HiLocationMarker className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    نقطة الانطلاق
                  </span>
                </div>
                <p className="text-gray-800 font-medium mr-11 leading-relaxed break-words">
                  {selectedRoute.from}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <HiLocationMarker className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    الوجهة
                  </span>
                </div>
                <p className="text-gray-800 font-medium mr-11 leading-relaxed break-words">
                  {selectedRoute.to}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                onClick={() => {
                  setRouteDialogOpen(false);
                  setSelectedRoute(null);
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TripsContent;
