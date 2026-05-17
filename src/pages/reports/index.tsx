import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiDocumentReport,
  HiDownload,
  HiRefresh,
  HiFilter,
  HiX,
  HiCurrencyDollar,
  HiCube,
  HiUsers,
  HiTag,
  HiChartBar,
  HiPrinter
} from 'react-icons/hi';
import axiosInstance from '../../api/AxiosIntance';

interface KPIs {
  totalSales: number;
  totalRides: number;
  totalDistanceKm: number;
  avgFare: number;
  avgDistanceKm: number;
  salesPrev: number;
  salesDeltaPercent: number;
}

interface TimeSeriesItem {
  periodStartUtc: string;
  sales: number;
  rides: number;
}

interface StatusItem {
  key: string;
  label: string;
  sales: number;
  count: number;
}

interface PaymentMethodItem {
  key: string;
  label: string;
  sales: number;
  count: number;
}

interface CarTypeItem {
  key: string;
  label: string;
  sales: number;
  count: number;
}

interface TopDriver {
  id: string;
  name: string;
  sales: number;
  rides: number;
  avgRate: number;
}

interface TopCustomer {
  id: string;
  name: string;
  sales: number;
  rides: number;
  avgRate: number;
}

interface ReportsData {
  kpis: KPIs;
  timeSeries: TimeSeriesItem[];
  byStatus: StatusItem[];
  byPaymentMethod: PaymentMethodItem[];
  byCarType: CarTypeItem[];
  topDrivers: TopDriver[];
  topCustomers: TopCustomer[];
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ReportsData;
}

interface FilterParams {
  fromUtc: string;
  toUtc: string;
  groupBy: string;
  topN: number;
}

const ReportsPage: React.FC = () => {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({
    fromUtc: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toUtc: new Date().toISOString().split('T')[0],
    groupBy: 'day',
    topN: 10
  });
  const [filtersApplied, setFiltersApplied] = useState(false);

  const fetchReports = async (useFilters: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (useFilters) {
        const params = {
          FromUtc: new Date(filters.fromUtc).toISOString(),
          ToUtc: new Date(filters.toUtc + 'T23:59:59').toISOString(),
          GroupBy: filters.groupBy,
          TopN: filters.topN
        };
        response = await axiosInstance.get<ApiResponse>('/admin/dashboard/reports', { params });
      } else {
        // First call without any query parameters
        response = await axiosInstance.get<ApiResponse>('/admin/dashboard/reports');
      }
      
      if (response.data.success) {
        setReportsData(response.data.data);
      } else {
        setError(response.data.message || 'فشل في جلب بيانات التقارير');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatPercentage = (percent: number | null, suffix: string | null) => {
    if (percent === null) return '';
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%${suffix || ''}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'غير محدد';
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      case 'Accepted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (key: keyof FilterParams, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    fetchReports(true);
  };

  const exportToCSV = () => {
    if (!reportsData) return;

    const csvContent = [
      // KPIs Section
      ['المؤشرات الرئيسية'],
      ['إجمالي المبيعات', reportsData.kpis.totalSales],
      ['إجمالي الرحلات', reportsData.kpis.totalRides],
      ['إجمالي المسافة (كم)', reportsData.kpis.totalDistanceKm],
      ['متوسط السعر', reportsData.kpis.avgFare],
      ['متوسط المسافة (كم)', reportsData.kpis.avgDistanceKm],
      ['نسبة التغيير في المبيعات (%)', reportsData.kpis.salesDeltaPercent],
      [''],
      
      // Status Breakdown
      ['توزيع الحالات'],
      ['الحالة', 'العدد', 'المبيعات'],
      ...reportsData.byStatus.map(status => [status.label, status.count, status.sales]),
      [''],
      
      // Payment Methods
      ['طرق الدفع'],
      ['الطريقة', 'العدد', 'المبيعات'],
      ...reportsData.byPaymentMethod.map(method => [method.label, method.count, method.sales]),
      [''],
      
      // Car Types
      ['أنواع السيارات'],
      ['النوع', 'العدد', 'المبيعات'],
      ...reportsData.byCarType.map(carType => [carType.label, carType.count, carType.sales]),
      [''],
      
      // Top Drivers
      ['أفضل السائقين'],
      ['الاسم', 'الرحلات', 'المبيعات', 'متوسط التقييم'],
      ...reportsData.topDrivers.map(driver => [driver.name, driver.rides, driver.sales, driver.avgRate]),
      [''],
      
      // Top Customers
      ['أفضل العملاء'],
      ['الاسم', 'الرحلات', 'المبيعات', 'متوسط التقييم'],
      ...reportsData.topCustomers.map(customer => [customer.name, customer.rides, customer.sales, customer.avgRate])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `تقرير_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToJSON = () => {
    if (!reportsData) return;

    const jsonData = {
      تاريخ_التقرير: new Date().toISOString(),
      المؤشرات_الرئيسية: {
        إجمالي_المبيعات: reportsData.kpis.totalSales,
        إجمالي_الرحلات: reportsData.kpis.totalRides,
        إجمالي_المسافة_كم: reportsData.kpis.totalDistanceKm,
        متوسط_السعر: reportsData.kpis.avgFare,
        متوسط_المسافة_كم: reportsData.kpis.avgDistanceKm,
        نسبة_التغيير_في_المبيعات: reportsData.kpis.salesDeltaPercent
      },
      توزيع_الحالات: reportsData.byStatus,
      طرق_الدفع: reportsData.byPaymentMethod,
      أنواع_السيارات: reportsData.byCarType,
      أفضل_السائقين: reportsData.topDrivers,
      أفضل_العملاء: reportsData.topCustomers,
      السلاسل_الزمنية: reportsData.timeSeries
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `تقرير_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printReport = () => {
    if (!reportsData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير شامل - ${new Date().toLocaleDateString('ar-SA')}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 20px;
            background: white;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3730a3;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #3730a3;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .section {
            margin-bottom: 30px;
            break-inside: avoid;
          }
          .section-title {
            background: #3730a3;
            color: white;
            padding: 10px 15px;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: bold;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .kpi-card {
            border: 1px solid #ddd;
            padding: 15px;
            text-align: center;
            background: #f9f9f9;
          }
          .kpi-value {
            font-size: 24px;
            font-weight: bold;
            color: #3730a3;
            margin: 5px 0;
          }
          .kpi-label {
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background: #f5f5f5;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .print-date {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير شامل للأداء</h1>
          <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
          <p>وقت الطباعة: ${new Date().toLocaleTimeString('ar-SA')}</p>
        </div>

        <div class="section">
          <h2 class="section-title">المؤشرات الرئيسية</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-value">${formatNumber(reportsData.kpis.totalSales)}</div>
              <div class="kpi-label">إجمالي المبيعات</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${formatNumber(reportsData.kpis.totalRides)}</div>
              <div class="kpi-label">إجمالي الرحلات</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${formatNumber(reportsData.kpis.totalDistanceKm)}</div>
              <div class="kpi-label">إجمالي المسافة (كم)</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${formatNumber(reportsData.kpis.avgFare)}</div>
              <div class="kpi-label">متوسط السعر</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">توزيع الحالات</h2>
          <table>
            <thead>
              <tr>
                <th>الحالة</th>
                <th>عدد الرحلات</th>
                <th>إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody>
              ${reportsData.byStatus.map(status => `
                <tr>
                  <td>${status.label}</td>
                  <td>${status.count}</td>
                  <td>${formatNumber(status.sales)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">طرق الدفع</h2>
          <table>
            <thead>
              <tr>
                <th>طريقة الدفع</th>
                <th>عدد العمليات</th>
                <th>إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody>
              ${reportsData.byPaymentMethod.map(method => `
                <tr>
                  <td>${method.label}</td>
                  <td>${method.count}</td>
                  <td>${formatNumber(method.sales)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">أنواع السيارات</h2>
          <table>
            <thead>
              <tr>
                <th>نوع السيارة</th>
                <th>عدد الرحلات</th>
                <th>إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody>
              ${reportsData.byCarType.map(carType => `
                <tr>
                  <td>${carType.label}</td>
                  <td>${carType.count}</td>
                  <td>${formatNumber(carType.sales)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">أفضل السائقين</h2>
          <table>
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>اسم السائق</th>
                <th>عدد الرحلات</th>
                <th>إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody>
              ${reportsData.topDrivers.map((driver, index) => `
                <tr>
                  <td>#${index + 1}</td>
                  <td>${driver.name}</td>
                  <td>${driver.rides}</td>
                  <td>${formatNumber(driver.sales)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">أفضل العملاء</h2>
          <table>
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>اسم العميل</th>
                <th>عدد الرحلات</th>
                <th>إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody>
              ${reportsData.topCustomers.map((customer, index) => `
                <tr>
                  <td>#${index + 1}</td>
                  <td>${customer.name}</td>
                  <td>${customer.rides}</td>
                  <td>${formatNumber(customer.sales)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="print-date">
          تم إنشاء هذا التقرير بواسطة نظام إدارة الرحلات - ${new Date().toLocaleString('ar-SA')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const stats = reportsData ? [
    {
      title: 'إجمالي المبيعات',
      value: formatNumber(reportsData.kpis.totalSales),
      change: formatPercentage(reportsData.kpis.salesDeltaPercent, null),
      icon: HiCurrencyDollar,
      color: reportsData.kpis.salesDeltaPercent >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: reportsData.kpis.salesDeltaPercent >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'إجمالي الرحلات',
      value: formatNumber(reportsData.kpis.totalRides),
      change: '',
      icon: HiCube,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'إجمالي المسافة (كم)',
      value: formatNumber(reportsData.kpis.totalDistanceKm),
      change: '',
      icon: HiTag,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'متوسط السعر',
      value: formatNumber(reportsData.kpis.avgFare),
      change: '',
      icon: HiUsers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-#022949 rounded-xl flex items-center justify-center shadow-lg">
              <HiDocumentReport className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">التقارير والإحصائيات</h1>
              <p className="text-gray-600">تحليل شامل لأداء النظام</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={!reportsData}
              >
                <HiDownload className="w-4 h-4" />
                تصدير
              </button>
              {reportsData && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[150px]">
                  <button
                    onClick={exportToCSV}
                    className="w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors flex items-center gap-2"
                  >
                    <HiDownload className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors flex items-center gap-2"
                  >
                    <HiDownload className="w-4 h-4" />
                    JSON
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={printReport}
              disabled={!reportsData}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              <HiPrinter className="w-4 h-4" />
              طباعة
            </button>
            
            <button
              onClick={() => fetchReports(filtersApplied)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#53BA11] text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <HiFilter className="w-5 h-5 text-#022949" />
            <h3 className="text-lg font-semibold text-gray-800">فلاتر التقرير</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
              <input
                type="date"
                value={filters.fromUtc}
                onChange={(e) => handleFilterChange('fromUtc', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
              <input
                type="date"
                value={filters.toUtc}
                onChange={(e) => handleFilterChange('toUtc', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تجميع البيانات</label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800 bg-white"
              >
                <option value="day">يومي</option>
                <option value="week">أسبوعي</option>
                <option value="month">شهري</option>
                <option value="year">سنوي</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عدد النتائج</label>
              <input
                type="number"
                min="1"
                max="100"
                value={filters.topN}
                onChange={(e) => handleFilterChange('topN', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-#022949 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <HiChartBar className="w-4 h-4" />
              تطبيق الفلاتر
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center min-h-[200px]"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-800 mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات التقارير...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-red-200"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiX className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchReports(filtersApplied)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        {!loading && !error && reportsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        {stat.title}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        {stat.change && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            stat.change.includes('+') 
                              ? 'bg-green-100 text-green-700' 
                              : stat.change.includes('-')
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {stat.change}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className={`p-3 rounded-2xl ${stat.bgColor} shadow-lg`}
                    >
                      <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                    </motion.div>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        stat.color.includes('indigo') ? 'from-indigo-400 to-indigo-600' :
                        stat.color.includes('red') ? 'from-red-400 to-red-600' :
                        'from-indigo-500 to-indigo-600'
                      }`}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Data Tables Grid */}
        {!loading && !error && reportsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Status Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#53BA11] rounded-xl flex items-center justify-center shadow-lg">
                    <HiDocumentReport className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">توزيع الحالات</h3>
                    <p className="text-sm text-gray-500">تقسيم الرحلات حسب الحالة</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {reportsData.byStatus.map((status, index) => (
                    <motion.div
                      key={status.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status.key)}`}>
                          {status.label}
                        </span>
                        <span className="text-sm text-gray-600">{status.count} رحلة</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(status.sales)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#53BA11] rounded-xl flex items-center justify-center shadow-lg">
                    <HiCurrencyDollar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">طرق الدفع</h3>
                    <p className="text-sm text-gray-500">توزيع المبيعات حسب طريقة الدفع</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {reportsData.byPaymentMethod.map((method, index) => (
                    <motion.div
                      key={method.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <HiCurrencyDollar className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{method.label}</span>
                          <p className="text-sm text-gray-600">{method.count} عملية</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(method.sales)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Car Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#53BA11] rounded-xl flex items-center justify-center shadow-lg">
                    <HiCube className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">أنواع السيارات</h3>
                    <p className="text-sm text-gray-500">الأداء حسب نوع السيارة</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {reportsData.byCarType.map((carType, index) => (
                    <motion.div
                      key={carType.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <HiCube className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{carType.label}</span>
                          <p className="text-sm text-gray-600">{carType.count} رحلة</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(carType.sales)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Top Drivers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#53BA11] rounded-xl flex items-center justify-center shadow-lg">
                    <HiUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">أفضل السائقين</h3>
                    <p className="text-sm text-gray-500">السائقين الأعلى أداءً</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {reportsData.topDrivers.map((driver, index) => (
                    <motion.div
                      key={driver.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{driver.name}</span>
                          <p className="text-sm text-gray-600">{driver.rides} رحلة</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(driver.sales)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        )}

        {/* Top Customers Table */}
        {!loading && !error && reportsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#53BA11] rounded-xl flex items-center justify-center shadow-lg">
                    <HiUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">أفضل العملاء</h3>
                    <p className="text-sm text-gray-500">العملاء الأكثر نشاطاً</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400 bg-white px-3 py-1 rounded-full">
                  {reportsData.topCustomers.length} عميل
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الترتيب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم العميل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الرحلات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجمالي المبيعات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">متوسط التقييم</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportsData.topCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">#{index + 1}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <HiUsers className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">معرف: {customer.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <HiCube className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{customer.rides}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatNumber(customer.sales)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < customer.avgRate ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="mr-2 text-sm text-gray-600">
                            {customer.avgRate > 0 ? customer.avgRate.toFixed(1) : 'غير مقيم'}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportsPage; 
