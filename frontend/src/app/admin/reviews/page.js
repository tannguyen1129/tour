'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_REVIEWS } from '../../../graphql/queries';
import { REPLY_REVIEW, DELETE_REVIEW, UPDATE_REVIEW } from '../../../graphql/mutations';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Polling và refresh state
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const { loading, error, data, refetch, startPolling, stopPolling } = useQuery(GET_REVIEWS, {
    pollInterval: isPollingEnabled ? 30000 : 0,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network'
  });
  
  const [replyReview] = useMutation(REPLY_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);
  const [updateReview] = useMutation(UPDATE_REVIEW);
  const [replyText, setReplyText] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Simple date validation function theo approach đã fix
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
      return !isNaN(date.getTime()) && date.getTime() > 0;
    } catch {
      return false;
    }
  };

  // ✅ Simple date formatting function
  const formatDate = (dateString) => {
    return isValidDate(dateString) 
      ? new Date(dateString).toLocaleDateString('en-GB')
      : 'No date';
  };

  // ✅ Simple relative time function
  const getRelativeTime = (dateString) => {
    if (!isValidDate(dateString)) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return '';
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle polling
  const togglePolling = () => {
    if (isPollingEnabled) {
      stopPolling();
      setIsPollingEnabled(false);
    } else {
      startPolling(30000);
      setIsPollingEnabled(true);
    }
  };

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="text-slate-700 text-lg font-semibold">Loading reviews...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait while we fetch all reviews</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Reviews</h3>
              <p className="text-red-600 font-medium mb-4">{error.message}</p>
              <button
                onClick={handleRefresh}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ✅ Add safety check for data - match với backend structure
  if (!data || !data.reviews) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-700 font-medium">Loading review data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleReply = async (id) => {
    const reply = replyText[id]?.trim();
    if (!reply) return;
    try {
      await replyReview({
        variables: { id, reply },
      });
      await refetch();
      setReplyText((prev) => ({ ...prev, [id]: '' }));
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Reply failed:', err);
      alert('Failed to submit reply. Please try again.');
    }
  };

  const handleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
    try {
      await updateReview({ variables: { id, status: newStatus } });
      await refetch();
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update review status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteReview({ variables: { id } });
        await refetch();
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  const buildUrl = (path) =>
    path?.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

  // ✅ Enhanced filter reviews với safe property access
  const filteredReviews = data.reviews.filter((review) => {
    // ✅ Safe text search với fallback values
    const text = `${review.user?.email || ''} ${review.tour?.title || ''} ${review.comment || ''}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());
    
    // ✅ Safe status matching với fallback
    const reviewStatus = review.status || 'visible'; // Default to visible nếu null
    const matchesStatus = statusFilter === 'all' || reviewStatus === statusFilter;
    
    // ✅ Safe rating matching với fallback
    const reviewRating = review.rating || 0;
    const matchesRating = ratingFilter === 'all' || reviewRating.toString() === ratingFilter;
    
    // ✅ Filter out deleted reviews - match với backend logic
    const notDeleted = !review.isDeleted;
    
    return matchesSearch && matchesStatus && matchesRating && notDeleted;
  });

  // ✅ Safe statistics calculation với backend data structure
  const activeReviews = data.reviews.filter(r => !r.isDeleted);
  const totalReviews = activeReviews.length;
  const visibleReviews = activeReviews.filter(r => (r.status || 'visible') === 'visible').length;
  const hiddenReviews = activeReviews.filter(r => (r.status || 'visible') === 'hidden').length;
  const averageRating = totalReviews > 0 
    ? (activeReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Review Management</h1>
                  <p className="text-slate-600">Monitor and manage customer reviews</p>
                </div>
              </div>

              {/* Refresh Controls */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Last updated</p>
                  <p className="text-sm font-medium text-slate-700">
                    {lastRefresh.toLocaleTimeString()}
                  </p>
                </div>

                <button
                  onClick={togglePolling}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isPollingEnabled
                      ? 'bg-green-100 text-green-700 border-2 border-green-200 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-700 border-2 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isPollingEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  <span className="text-sm">Auto Refresh</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <svg 
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-slate-800">{totalReviews}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Visible</p>
                    <p className="text-2xl font-bold text-green-600">{visibleReviews}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Hidden</p>
                    <p className="text-2xl font-bold text-yellow-600">{hiddenReviews}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-purple-600">{averageRating}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Search Reviews</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by user, tour, comment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800 placeholder-slate-400"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
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
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Rating</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            {/* Filter Results Summary */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-slate-700 font-medium">
                    {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                {(searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setRatingFilter('all');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Review Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{review.user?.email || 'Unknown User'}</p>
                          <p className="text-sm text-slate-600">reviewing <span className="font-medium text-blue-600">{review.tour?.title || 'Unknown Tour'}</span></p>
                          {/* ✅ Add created date như backend đã có */}
                          <p className="text-xs text-slate-500">
                            {formatDate(review.createdAt)} {getRelativeTime(review.createdAt) && `• ${getRelativeTime(review.createdAt)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-slate-300'}`}
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                          <span className="ml-2 font-semibold text-slate-700">{review.rating || 0}/5</span>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            (review.status || 'visible') === 'visible'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          {review.status || 'visible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-800 mb-2">Review Comment</h4>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">
                        "{review.comment || 'No comment provided'}"
                      </p>
                    </div>

                    {/* Review Images */}
                    {review.images?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-slate-800 mb-2">Review Images</h4>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {review.images.map((img, i) => (
                            <img
                              key={i}
                              src={buildUrl(img)}
                              alt={`Review image ${i + 1}`}
                              className="h-20 w-20 object-cover rounded-xl border-2 border-slate-200 hover:border-blue-400 transition-colors cursor-pointer flex-shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x80/e2e8f0/64748b?text=No+Image';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Reply */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-800 mb-2">Admin Reply</h4>
                      {review.reply && (
                        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-3 shadow-sm">
                          <div className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-green-800 mb-1">Admin Response:</p>
                              <p className="text-green-900 font-medium leading-relaxed bg-white/60 rounded-lg p-3 border border-green-200">
                                {review.reply}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-3">
                        <textarea
                          placeholder="Write admin reply..."
                          value={replyText[review.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-white text-slate-800 placeholder-slate-500 font-medium shadow-sm"
                          rows={3}
                        />
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={!replyText[review.id]?.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:shadow-sm transform hover:scale-105 disabled:hover:scale-100"
                        >
                          <span className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span>Send Reply</span>
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => handleStatus(review.id, review.status || 'visible')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          (review.status || 'visible') === 'visible'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={(review.status || 'visible') === 'visible' ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                        <span>Set {(review.status || 'visible') === 'visible' ? 'Hidden' : 'Visible'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl font-medium transition-all duration-200 border border-red-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Reviews Found</h3>
                <p className="text-slate-600">No reviews match your current filters. Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
