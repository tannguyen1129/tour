'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import {
  GET_DASHBOARD_OVERVIEW,
  GET_MONTHLY_STATS_FOR_YEAR,
  GET_TOP_TOURS,
  GET_REVENUE_BREAKDOWN,
  GET_USER_ANALYTICS,
  GET_PAYMENT_METHOD_ANALYTICS,
  formatCurrency,
  formatNumber,
  formatPercentage,
  createDateRange
} from '../../graphql/statistics.js';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AdminReports() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // SỬA: Thay đổi từ dropdown sang date picker
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDayOfMonth.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  // Tạo date range từ state
  const currentRange = createDateRange(startDate, endDate);

  // GraphQL Queries với error handling để tránh fake data
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useQuery(GET_DASHBOARD_OVERVIEW, {
    variables: { dateRange: currentRange },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true
  });

  const { data: monthlyData, loading: monthlyLoading, error: monthlyError } = useQuery(GET_MONTHLY_STATS_FOR_YEAR, {
    variables: { year: selectedYear },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true
  });

  const { data: topToursData, loading: topToursLoading, error: topToursError } = useQuery(GET_TOP_TOURS, {
    variables: {
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
      sortBy: 'revenue',
      limit: 5
    },
    errorPolicy: 'all',
    skip: !currentRange.startDate || !currentRange.endDate
  });

  const { data: revenueData, loading: revenueLoading, error: revenueError } = useQuery(GET_REVENUE_BREAKDOWN, {
    variables: {
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
      groupBy: 'day'
    },
    errorPolicy: 'all',
    skip: !currentRange.startDate || !currentRange.endDate
  });

  const { data: userAnalyticsData, loading: userAnalyticsLoading, error: userAnalyticsError } = useQuery(GET_USER_ANALYTICS, {
    variables: {
      startDate: currentRange.startDate,
      endDate: currentRange.endDate
    },
    errorPolicy: 'all',
    skip: !currentRange.startDate || !currentRange.endDate
  });

  const { data: paymentData, loading: paymentLoading, error: paymentError } = useQuery(GET_PAYMENT_METHOD_ANALYTICS, {
    variables: {
      startDate: currentRange.startDate,
      endDate: currentRange.endDate
    },
    errorPolicy: 'all',
    skip: !currentRange.startDate || !currentRange.endDate
  });

  // Authentication check
  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // SỬA: Thêm quick date range buttons
  const setQuickDateRange = (type) => {
    const now = new Date();
    let start, end;

    switch (type) {
      case 'today':
        start = end = now;
        break;
      case 'yesterday':
        start = end = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last_7_days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'last_30_days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'current_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Đang chuyển hướng...</p>
      </div>
    );
  }

  // SỬA: Kiểm tra dữ liệu thật từ API trước khi hiển thị
  const hasRealData = dashboardData?.dashboardOverview;
  const hasMonthlyData = monthlyData?.monthlyStatsForYear && monthlyData.monthlyStatsForYear.length > 0;
  const hasRevenueData = revenueData?.revenueBreakdown;
  const hasTopToursData = topToursData?.topTours && topToursData.topTours.length > 0;
  const hasUserData = userAnalyticsData?.userAnalytics;
  const hasPaymentData = paymentData?.paymentMethodAnalytics && paymentData.paymentMethodAnalytics.length > 0;

  // Chart configurations - chỉ tạo khi có dữ liệu thật
  const monthlyChartData = hasMonthlyData ? {
    labels: monthlyData.monthlyStatsForYear.map(stat => `Tháng ${stat.month}`),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: monthlyData.monthlyStatsForYear.map(stat => stat.totalRevenue || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Số booking',
        data: monthlyData.monthlyStatsForYear.map(stat => stat.totalBookings || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        yAxisID: 'y1',
      }
    ],
  } : null;

  const monthlyChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Thống kê theo tháng - Năm ${selectedYear}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Tháng'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Số booking'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const paymentMethodChartData = hasPaymentData ? {
    labels: paymentData.paymentMethodAnalytics.map(item => item.method),
    datasets: [
      {
        label: 'Phần trăm',
        data: paymentData.paymentMethodAnalytics.map(item => item.percentage || 0),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const paymentMethodChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Phân tích phương thức thanh toán',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 min-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-4 md:mb-0">
            Báo cáo Tổng hợp
          </h1>
        </div>

        {/* SỬA: Date Range Controls */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Chọn khoảng thời gian</h3>
          
          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Date Range Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickDateRange('today')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setQuickDateRange('yesterday')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Hôm qua
            </button>
            <button
              onClick={() => setQuickDateRange('last_7_days')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setQuickDateRange('last_30_days')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              30 ngày qua
            </button>
            <button
              onClick={() => setQuickDateRange('current_month')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Tháng này
            </button>
            <button
              onClick={() => setQuickDateRange('last_month')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Tháng trước
            </button>
          </div>

          {/* Year selector cho biểu đồ tháng */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm cho biểu đồ tháng:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {[2022, 2023, 2024, 2025].map(year => (
                <option key={year} value={year}>Năm {year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SỬA: Dashboard Overview Cards - chỉ hiển thị khi có data thật */}
        {hasRealData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Tổng doanh thu</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(dashboardData.dashboardOverview.totalRevenue)}
                  </p>
                  <p className="text-emerald-200 text-sm">
                    {dashboardData.dashboardOverview.growthRate !== null ? 
                      `${formatPercentage(dashboardData.dashboardOverview.growthRate)} so với trước` 
                      : 'Chưa có dữ liệu so sánh'}
                  </p>
                </div>
                <div className="text-4xl opacity-80">💰</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tổng booking</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(dashboardData.dashboardOverview.totalBookings)}
                  </p>
                  <p className="text-blue-200 text-sm">
                    {formatNumber(dashboardData.dashboardOverview.completedBookings)} hoàn thành
                  </p>
                </div>
                <div className="text-4xl opacity-80">📋</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Tổng người dùng</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(dashboardData.dashboardOverview.totalUsers)}
                  </p>
                  <p className="text-purple-200 text-sm">
                    {formatNumber(dashboardData.dashboardOverview.activeUsers)} hoạt động
                  </p>
                </div>
                <div className="text-4xl opacity-80">👥</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Đánh giá TB</p>
                  <p className="text-2xl font-bold">
                    {dashboardData.dashboardOverview.averageRating !== null ? 
                      `${dashboardData.dashboardOverview.averageRating.toFixed(1)}/5.0` 
                      : 'N/A'}
                  </p>
                  <p className="text-orange-200 text-sm">
                    {formatNumber(dashboardData.dashboardOverview.totalTours)} tour
                  </p>
                </div>
                <div className="text-4xl opacity-80">⭐</div>
              </div>
            </div>
          </div>
        ) : dashboardLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-gray-200 p-6 rounded-xl animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : dashboardError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-800">Lỗi tải dữ liệu tổng quan: {dashboardError.message}</p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <p className="text-yellow-800">Không có dữ liệu tổng quan trong khoảng thời gian này</p>
          </div>
        )}

        {/* Monthly Statistics Chart - chỉ hiển thị khi có data thật */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Biểu đồ thống kê theo tháng</h3>
          <div className="h-96">
            {monthlyLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-2 text-gray-600">Đang tải biểu đồ...</span>
              </div>
            ) : monthlyError ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-600">Lỗi tải dữ liệu biểu đồ: {monthlyError.message}</p>
              </div>
            ) : hasMonthlyData && monthlyChartData ? (
              <Bar data={monthlyChartData} options={monthlyChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Không có dữ liệu biểu đồ cho năm {selectedYear}</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue & Payment Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Phân tích Doanh thu</h3>
            {revenueLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : revenueError ? (
              <div className="text-center text-red-600 h-32 flex items-center justify-center">
                <p>Lỗi tải dữ liệu doanh thu: {revenueError.message}</p>
              </div>
            ) : hasRevenueData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tổng doanh thu:</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(revenueData.revenueBreakdown.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(revenueData.revenueBreakdown.confirmedRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Chờ thanh toán:</span>
                  <span className="font-semibold text-yellow-600">
                    {formatCurrency(revenueData.revenueBreakdown.pendingRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Giảm giá voucher:</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(revenueData.revenueBreakdown.voucherDiscounts)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 pt-4 border-t-2 border-emerald-100">
                  <span className="text-gray-800 font-semibold">Doanh thu ròng:</span>
                  <span className="font-bold text-emerald-600 text-lg">
                    {formatCurrency(revenueData.revenueBreakdown.netRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Giá trị đơn TB:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(revenueData.revenueBreakdown.averageOrderValue)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 h-32 flex items-center justify-center">
                <p>Không có dữ liệu doanh thu trong khoảng thời gian này</p>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Phương thức Thanh toán</h3>
            {paymentLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : paymentError ? (
              <div className="text-center text-red-600 h-64 flex items-center justify-center">
                <p>Lỗi tải dữ liệu thanh toán: {paymentError.message}</p>
              </div>
            ) : hasPaymentData && paymentMethodChartData ? (
              <div className="h-64">
                <Pie data={paymentMethodChartData} options={paymentMethodChartOptions} />
              </div>
            ) : (
              <div className="text-center text-gray-500 h-64 flex items-center justify-center">
                <p>Không có dữ liệu phương thức thanh toán trong khoảng thời gian này</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Tours & User Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Tours */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Top 5 Tour Doanh thu Cao</h3>
            {topToursLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : topToursError ? (
              <div className="text-center text-red-600 h-32 flex items-center justify-center">
                <p>Lỗi tải dữ liệu top tours: {topToursError.message}</p>
              </div>
            ) : hasTopToursData ? (
              <div className="space-y-3">
                {topToursData.topTours.map((tour, index) => (
                  <div key={tour.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 truncate max-w-40">{tour.title}</p>
                        <p className="text-sm text-gray-500">{tour.bookingCount} booking</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{formatCurrency(tour.totalRevenue)}</p>
                      <p className="text-sm text-gray-500">⭐ {tour.averageRating ? tour.averageRating.toFixed(1) : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 h-32 flex items-center justify-center">
                <p>Không có dữ liệu top tours trong khoảng thời gian này</p>
              </div>
            )}
          </div>

          {/* User Analytics */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Thống kê Người dùng</h3>
            {userAnalyticsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : userAnalyticsError ? (
              <div className="text-center text-red-600 h-32 flex items-center justify-center">
                <p>Lỗi tải dữ liệu người dùng: {userAnalyticsError.message}</p>
              </div>
            ) : hasUserData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(userAnalyticsData.userAnalytics.totalUsers)}
                    </p>
                    <p className="text-sm text-gray-600">Tổng người dùng</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(userAnalyticsData.userAnalytics.activeUsers)}
                    </p>
                    <p className="text-sm text-gray-600">Đang hoạt động</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(userAnalyticsData.userAnalytics.newUsers)}
                    </p>
                    <p className="text-sm text-gray-600">Người dùng mới</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatNumber(userAnalyticsData.userAnalytics.returningCustomers)}
                    </p>
                    <p className="text-sm text-gray-600">Khách quay lại</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-center text-gray-600 text-sm">Trung bình booking/người dùng</p>
                  <p className="text-center text-2xl font-bold text-gray-800">
                    {userAnalyticsData.userAnalytics.averageBookingsPerUser.toFixed(1)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 h-32 flex items-center justify-center">
                <p>Không có dữ liệu người dùng trong khoảng thời gian này</p>
              </div>
            )}
          </div>
        </div>

        {/* Export Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Xuất báo cáo</h3>
          <div className="flex flex-wrap gap-4">
            <button 
              disabled={!hasRealData}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transform transition-all duration-300 ${
                hasRealData 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              📊 Xuất Excel
            </button>
            <button 
              disabled={!hasRealData}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transform transition-all duration-300 ${
                hasRealData 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              📄 Xuất PDF
            </button>
            <button 
              disabled={!hasRealData}
              className={`px-6 py-3 font-semibold rounded-lg shadow-md transform transition-all duration-300 ${
                hasRealData 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              📈 Báo cáo Chi tiết
            </button>
          </div>
          {!hasRealData && (
            <p className="text-sm text-gray-500 mt-2">
              *Các nút xuất báo cáo sẽ khả dụng khi có dữ liệu thực
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
