'use client';
import { useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client'; // ✅ Thêm useApolloClient
import { GET_TOURS, IS_FAVORITE } from '../../graphql/queries';
import { TOGGLE_FAVORITE } from '../../graphql/mutations';
import TourCard from '../../components/TourCard';

// ✅ Cập nhật FavoriteButton component
function FavoriteButton({ tourId }) {
  const client = useApolloClient(); // ✅ Thêm Apollo Client

  const { data: isFavoriteData, loading: checkingFavorite } = useQuery(IS_FAVORITE, {
    variables: { tourId },
    errorPolicy: 'ignore',
    skip: !tourId,
    fetchPolicy: 'cache-and-network', // ✅ Quan trọng: luôn check cả cache và network
    notifyOnNetworkStatusChange: true
  });

  const [toggleFavorite, { loading: toggling }] = useMutation(TOGGLE_FAVORITE, {
    variables: { tourId },
    onCompleted: async (data) => {
      console.log(data.toggleFavorite.message);
      
      // ✅ Cập nhật cache và refetch favorites nếu cần
      if (data.toggleFavorite.success) {
        // Update IS_FAVORITE cache ngay lập tức
        const newIsFavorite = !data.toggleFavorite.favorite.isDeleted;
        client.writeQuery({
          query: IS_FAVORITE,
          variables: { tourId },
          data: { isFavorite: newIsFavorite }
        });
      }
    },
    onError: (error) => {
      console.error('Lỗi toggle favorite:', error);
    },
    // ✅ Update cache optimistically
    optimisticResponse: {
      toggleFavorite: {
        __typename: 'FavoriteResponse',
        success: true,
        message: isFavoriteData?.isFavorite ? 'Removed from favorites' : 'Added to favorites',
        favorite: {
          __typename: 'Favorite',
          id: 'temp-id',
          isDeleted: isFavoriteData?.isFavorite || false,
          tour: {
            __typename: 'Tour',
            id: tourId,
            title: 'Tour Title'
          }
        }
      }
    },
    update: (cache, { data }) => {
      if (data?.toggleFavorite?.success) {
        const newIsFavorite = !data.toggleFavorite.favorite.isDeleted;
        cache.writeQuery({
          query: IS_FAVORITE,
          variables: { tourId },
          data: { isFavorite: newIsFavorite }
        });
      }
    }
  });

  const isFavorite = isFavoriteData?.isFavorite || false;
  const isLoading = checkingFavorite || toggling;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`absolute top-4 left-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg ${
        isFavorite 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg 
          className={`w-5 h-5 transition-all duration-200 ${isFavorite ? 'scale-110' : ''}`} 
          fill={isFavorite ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isFavorite ? 0 : 2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
    </button>
  );
}
export default function ToursPage() {
  const { loading, error, data } = useQuery(GET_TOURS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const pageSize = 6;

  // Lọc danh sách tour dựa trên tìm kiếm và bộ lọc
  const filteredTours = data?.tours
    ? data.tours.filter(tour => {
        const matchesSearch = tour.title.toLowerCase().includes(search.toLowerCase()) || 
                              tour.location.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter ? tour.category?.name === categoryFilter : true;
        const matchesPrice = priceFilter 
          ? (priceFilter === 'low' ? tour.price <= 500 : 
             priceFilter === 'medium' ? tour.price > 500 && tour.price <= 1000 : 
             tour.price > 1000) 
          : true;
        return matchesSearch && matchesCategory && matchesPrice;
      })
    : [];

  // Phân trang
  const paginatedTours = filteredTours.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(Math.ceil(filteredTours.length / pageSize), 1);

  // Lấy danh sách category duy nhất để lọc
  const categories = [...new Set(data?.tours.map(tour => tour.category?.name).filter(Boolean))];

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-slate-700 text-lg font-semibold">Discovering amazing tours...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait while we load the best experiences for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 font-medium">{error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section - giữ nguyên như cũ */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-16 lg:py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        </div>

        <div className="relative w-full px-4 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Explore Our
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Amazing Tours
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Discover breathtaking destinations and create unforgettable memories with our carefully curated travel experiences
          </p>
        </div>
      </div>

      {/* Main Content - giữ nguyên phần filter */}
      <div className="w-full px-4 lg:px-8 -mt-8 relative z-10 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Advanced Filter Card - giữ nguyên như cũ */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 lg:p-8 mb-8 lg:mb-12">
            {/* ... giữ nguyên toàn bộ phần filter như code cũ ... */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Find Your Perfect Tour</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search Tours</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title or location..."
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 pl-10 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-slate-800 placeholder-slate-400 font-medium hover:border-slate-400"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Category</span>
                </label>
                <select
                  value={categoryFilter}
                  onChange={e => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-slate-800 font-medium hover:border-slate-400"
                >
                  <option value="" className="text-slate-600">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="text-slate-800">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Price Range</span>
                </label>
                <select
                  value={priceFilter}
                  onChange={e => {
                    setPriceFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-slate-800 font-medium hover:border-slate-400"
                >
                  <option value="" className="text-slate-600">All Prices</option>
                  <option value="low" className="text-slate-800">Budget-Friendly (≤ $500)</option>
                  <option value="medium" className="text-slate-800">Mid-Range ($500 - $1000)</option>
                  <option value="high" className="text-slate-800">Premium (&gt; $1000)</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-slate-700 font-medium">
                    {filteredTours.length} tour{filteredTours.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                {(search || categoryFilter || priceFilter) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setCategoryFilter('');
                      setPriceFilter('');
                      setPage(1);
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

          {/* Tours Grid với nút yêu thích */}
          {filteredTours.length === 0 ? (
            <div className="text-center py-12 lg:py-16">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 lg:p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No tours found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your search criteria or explore different categories</p>
                <button
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('');
                    setPriceFilter('');
                    setPage(1);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  Show All Tours
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tours Grid với nút yêu thích overlay */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
                {paginatedTours.map((tour, index) => (
                  <div
                    key={tour.id}
                    className="transform transition-all duration-300 hover:scale-105 relative"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <TourCard tour={tour} />
                    {/* Nút yêu thích được overlay lên trên TourCard */}
                    <FavoriteButton tourId={tour.id} />
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination - giữ nguyên như cũ */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <span className="text-sm font-medium">
                        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredTours.length)} of {filteredTours.length} tours
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center space-x-2 px-4 py-2 border-2 border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium hover:border-slate-400 disabled:hover:bg-white disabled:hover:border-slate-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Previous</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          const isActive = pageNum === page;
                          const isNear = Math.abs(pageNum - page) <= 2;
                          const isFirst = pageNum === 1;
                          const isLast = pageNum === totalPages;

                          if (totalPages <= 7 || isNear || isFirst || isLast) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                                  isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110'
                                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (pageNum === page - 3 || pageNum === page + 3) {
                            return (
                              <span key={pageNum} className="text-slate-400 px-2">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center space-x-2 px-4 py-2 border-2 border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium hover:border-slate-400 disabled:hover:bg-white disabled:hover:border-slate-300"
                      >
                        <span>Next</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
