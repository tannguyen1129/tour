'use client';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOKINGS } from '../../../graphql/queries';
import { UPDATE_BOOKING, DELETE_BOOKING } from '../../../graphql/mutations';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

export default function AdminBookingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // ✅ Enhanced Apollo Query với error policy và refetch
  const { loading, error, data, refetch, networkStatus } = useQuery(GET_BOOKINGS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    skip: !user || user.role !== 'admin'
  });
  
  const [deleteBooking, { loading: deleting }] = useMutation(DELETE_BOOKING, {
    onCompleted: () => {
      setNotification({ type: 'success', message: '✅ Booking deleted successfully!' });
      refetch();
    },
    onError: (error) => {
      setNotification({ type: 'error', message: `❌ Failed to delete booking: ${error.message}` });
    }
  });
  
  const [updateBooking, { loading: updating }] = useMutation(UPDATE_BOOKING, {
    onCompleted: () => {
      setNotification({ type: 'success', message: '✅ Booking status updated successfully!' });
      refetch();
    },
    onError: (error) => {
      setNotification({ type: 'error', message: `❌ Failed to update booking: ${error.message}` });
    }
  });

  // ✅ Enhanced State Management
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // ✅ Enhanced isValidDate function với comprehensive validation
  const isValidDate = (dateString) => {
    if (!dateString || 
        dateString === null || 
        dateString === undefined || 
        dateString === '' ||
        dateString === 'Invalid Date') {
      return false;
    }
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) && 
             date.getTime() > 0 && 
             date.getFullYear() > 1900 && 
             date.getFullYear() < 2100;
    } catch {
      return false;
    }
  };

  // ✅ Format currency helper
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // ✅ Format date helper
  const formatDate = (dateString) => {
    if (!isValidDate(dateString)) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // ✅ Format relative time
  const formatRelativeTime = (dateString) => {
    if (!isValidDate(dateString)) return 'No date';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return formatDate(dateString);
    } catch {
      return 'Invalid date';
    }
  };

  // ✅ Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // ✅ Enhanced Loading States
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="text-slate-700 text-lg font-semibold">Loading authentication...</p>
            <div className="text-slate-500 text-sm mt-2">Verifying your admin access...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">You need admin privileges to access this page</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-700 font-medium">Redirecting to login...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="text-slate-700 text-lg font-semibold">Loading bookings...</p>
            <p className="text-slate-500 text-sm mt-2">Fetching booking data from server...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !data) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Bookings</h3>
              <p className="text-red-600 font-medium mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ✅ Enhanced data safety check
  if (!data || !data.bookings || !Array.isArray(data.bookings)) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Booking Data</h2>
            <p className="text-slate-600 mb-4">Unable to load booking information</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Reload Data
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ✅ Enhanced Action Handlers
  const handleDelete = async (id) => {
    if (!id) {
      setNotification({ type: 'error', message: '❌ Invalid booking ID' });
      return;
    }

    const booking = data.bookings.find(b => b.id === id);
    const bookingTitle = booking?.tour?.title || 'this booking';

    if (confirm(`Are you sure you want to delete "${bookingTitle}"? This action cannot be undone.`)) {
      try {
        await deleteBooking({ variables: { id } });
      } catch (err) {
        console.error('Delete error:', err);
        setNotification({ 
          type: 'error', 
          message: `❌ Failed to delete booking: ${err.message}` 
        });
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!id || !newStatus) {
      setNotification({ type: 'error', message: '❌ Invalid parameters' });
      return;
    }

    setUpdatingId(id);
    try {
      await updateBooking({ variables: { id, status: newStatus } });
    } catch (err) {
      console.error('Update error:', err);
      setNotification({ 
        type: 'error', 
        message: `❌ Failed to update status: ${err.message}` 
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewDetail = (id) => {
    if (!id) {
      setNotification({ type: 'error', message: '❌ Invalid booking ID' });
      return;
    }
    router.push(`/admin/bookings/${id}`);
  };

  // ✅ Enhanced filtering and sorting logic
  const getFilteredAndSortedBookings = () => {
    if (!data?.bookings) return [];

    let filtered = data.bookings.filter((booking) => {
      if (!booking) return false;

      const tourTitle = booking.tour?.title?.toLowerCase() || '';
      const userEmail = booking.user?.email?.toLowerCase() || '';
      const userName = booking.user?.name?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      const matchesSearch = tourTitle.includes(search) || 
                           userEmail.includes(search) || 
                           userName.includes(search);

      // Enhanced date filtering
      const matchesDate = (() => {
        if (!dateFilter) return true;
        if (!isValidDate(booking.createdAt)) return false;
        
        try {
          const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
          return bookingDate === dateFilter;
        } catch {
          return false;
        }
      })();

      const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesDate && matchesPayment && matchesStatus;
    });

    // ✅ Enhanced Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'tour':
          aValue = a.tour?.title || '';
          bValue = b.tour?.title || '';
          break;
        case 'customer':
          aValue = a.user?.email || '';
          bValue = b.user?.email || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'paymentStatus':
          aValue = a.paymentStatus || '';
          bValue = b.paymentStatus || '';
          break;
        case 'total':
          aValue = a.total || 0;
          bValue = b.total || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  };

  const filteredBookings = getFilteredAndSortedBookings();

  // ✅ Enhanced Statistics calculation với safe access
  const calculateStats = () => {
    const bookings = data?.bookings || [];
    
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b?.status === 'confirmed').length,
      pending: bookings.filter(b => b?.status === 'pending').length,
      cancelled: bookings.filter(b => b?.status === 'cancelled').length,
      paid: bookings.filter(b => b?.paymentStatus === 'paid').length,
      unpaid: bookings.filter(b => b?.paymentStatus === 'unpaid').length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b?.total || 0), 0),
      averageBookingValue: bookings.length > 0 
        ? bookings.reduce((sum, b) => sum + (b?.total || 0), 0) / bookings.length 
        : 0
    };
  };

  const stats = calculateStats();

  // ✅ Sort handler
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // ✅ Get sort icon
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        {/* ✅ Enhanced Notification System */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-500 transform ${
            notification.type === 'success' 
              ? 'bg-green-50 border-2 border-green-200 text-green-800' 
              : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className="text-xl">
                  {notification.type === 'success' ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-semibold">{notification.message}</div>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {/* ✅ Enhanced Header with Real-time Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Booking Management</h1>
                  <p className="text-slate-600">Monitor and manage all tour bookings</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Real-time Status */}
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live Data</span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={() => refetch()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </span>
                </button>
              </div>
            </div>

            {/* ✅ Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Paid</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.paid}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Enhanced Filters Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span>Filter & Search Bookings</span>
              </h3>
              
              {/* Quick Stats */}
              <div className="text-sm text-slate-600">
                <span className="font-medium">
                  Showing {filteredBookings.length} of {stats.total} bookings
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Enhanced Search */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tour, customer email, or name..."
                    className="w-full px-4 py-3 pl-10 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800 placeholder-slate-400"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Payment</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="tour">Tour Name</option>
                  <option value="customer">Customer</option>
                  <option value="status">Status</option>
                  <option value="paymentStatus">Payment</option>
                  <option value="total">Amount</option>
                </select>
              </div>
            </div>

            {/* Results Summary & Actions */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-slate-700 font-medium">
                      {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                    </span>
                  </div>

                  {filteredBookings.length > 0 && (
                    <div className="text-sm text-slate-500">
                      Average: {formatCurrency(stats.averageBookingValue)}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Sort Order Toggle */}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                  >
                    {getSortIcon(sortBy)}
                    <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </button>

                  {/* Clear Filters */}
                  {(searchTerm || dateFilter || paymentFilter !== 'all' || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDateFilter('');
                        setPaymentFilter('all');
                        setStatusFilter('all');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Enhanced Bookings Table */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {data.bookings.length === 0 ? 'No Bookings Yet' : 'No Bookings Found'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {data.bookings.length === 0 
                  ? 'No bookings have been made yet. They will appear here once customers start making reservations.'
                  : 'No bookings match your current filters. Try adjusting your search criteria.'
                }
              </p>
              {data.bookings.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('');
                    setPaymentFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Table Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="font-medium">Updating...</span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('tour')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Tour</span>
                          {getSortIcon('tour')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('customer')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Customer</span>
                          {getSortIcon('customer')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('paymentStatus')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Payment</span>
                          {getSortIcon('paymentStatus')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('total')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Amount</span>
                          {getSortIcon('total')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBookings.map((booking) => (
                      <tr 
                        key={booking.id} 
                        className="hover:bg-slate-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="font-semibold text-slate-800 truncate">
                              {booking.tour?.title || 'Unknown Tour'}
                            </div>
                            {booking.tour?.price && (
                              <div className="text-sm text-slate-500">
                                Base: {formatCurrency(booking.tour.price)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="max-w-xs">
                              <div className="font-medium text-slate-800 truncate">
                                {booking.user?.name || booking.user?.email || 'Unknown User'}
                              </div>
                              {booking.user?.name && booking.user?.email && (
                                <div className="text-sm text-slate-500 truncate">
                                  {booking.user.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-500' 
                                : booking.status === 'pending'
                                ? 'bg-yellow-500'
                                : booking.status === 'cancelled'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                            }`}></div>
                            {booking.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.paymentStatus === 'paid' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : booking.paymentStatus === 'unpaid'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              booking.paymentStatus === 'paid' 
                                ? 'bg-blue-500' 
                                : booking.paymentStatus === 'unpaid'
                                ? 'bg-orange-500'
                                : 'bg-gray-500'
                            }`}></div>
                            {booking.paymentStatus || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-bold text-slate-900">
                              {formatCurrency(booking.total || 0)}
                            </div>
                            {booking.passengers?.length > 0 && (
                              <div className="text-slate-500">
                                {booking.passengers.length} passenger{booking.passengers.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatDate(booking.createdAt)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {formatRelativeTime(booking.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateStatus(
                                booking.id, 
                                booking.status === 'confirmed' ? 'pending' : 'confirmed'
                              )}
                              disabled={updating && updatingId === booking.id}
                              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                booking.status === 'confirmed'
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {updating && updatingId === booking.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                              <span>
                                {booking.status === 'confirmed' ? 'Set Pending' : 'Confirm'}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => handleViewDetail(booking.id)}
                              className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-semibold transition-all duration-200 border border-blue-200"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
                            
                            <button
                              onClick={() => handleDelete(booking.id)}
                              disabled={deleting}
                              className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-all duration-200 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deleting ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
