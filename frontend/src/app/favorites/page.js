'use client';
import { useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_FAVORITES, IS_FAVORITE } from '../../graphql/queries';
import { REMOVE_FROM_FAVORITES, REORDER_FAVORITES } from '../../graphql/mutations';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function FavoritesPage() {
  const { user, isLoading } = useAuth();
  const client = useApolloClient();
  const [page, setPage] = useState(1);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);
  const pageSize = 10;

  const { loading, error, data, refetch } = useQuery(GET_FAVORITES, {
    variables: {
      limit: pageSize,
      offset: (page - 1) * pageSize
    },
    skip: isLoading || !user,
    fetchPolicy: 'cache-and-network'
  });

  // ✅ Sửa mutation - bỏ refetchQueries function
  const [removeFromFavorites] = useMutation(REMOVE_FROM_FAVORITES, {
    onCompleted: (data) => {
      if (data.removeFromFavorites.success) {
        refetch();
        console.log(data.removeFromFavorites.message);
      }
    },
    onError: (error) => {
      console.error('Lỗi xóa khỏi yêu thích:', error);
    }
  });

  const [reorderFavorites] = useMutation(REORDER_FAVORITES, {
    onCompleted: (data) => {
      if (data.reorderFavorites.success) {
        refetch();
        console.log('Đã cập nhật thứ tự yêu thích');
      }
    },
    onError: (error) => {
      console.error('Lỗi sắp xếp thứ tự:', error);
    }
  });

  // ✅ Cập nhật function với manual refetch
  const handleRemoveFavorite = async (tourId) => {
  if (window.confirm('Bạn có chắc muốn xóa tour này khỏi danh sách yêu thích?')) {
    try {
      await removeFromFavorites({ variables: { tourId } });
      
      // ✅ Force clear cache entry cho IS_FAVORITE của tour này
      client.cache.evict({
        fieldName: "isFavorite",
        args: { tourId }
      });
      
      // ✅ Write cache trực tiếp với giá trị false
      client.cache.writeQuery({
        query: IS_FAVORITE,
        variables: { tourId },
        data: { isFavorite: false }
      });
      
      // ✅ Garbage collection để clean cache
      client.cache.gc();
      
      // ✅ Refetch tất cả IS_FAVORITE queries
      await client.refetchQueries({
        include: [IS_FAVORITE]
      });
      
      console.log(`✅ Removed favorite for tour ${tourId} and updated cache`);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }
};

  // Drag & Drop handlers
  const handleDragStart = (e, favorite) => {
    setDraggedItem(favorite);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, favorite) => {
    e.preventDefault();
    setDraggedOver(favorite);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = async (e, targetFavorite) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetFavorite.id) {
      setDraggedItem(null);
      setDraggedOver(null);
      return;
    }

    const favorites = data?.getFavorites?.favorites || [];
    const draggedIndex = favorites.findIndex(f => f.id === draggedItem.id);
    const targetIndex = favorites.findIndex(f => f.id === targetFavorite.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Tạo array mới với thứ tự đã thay đổi
    const newFavorites = [...favorites];
    const [removed] = newFavorites.splice(draggedIndex, 1);
    newFavorites.splice(targetIndex, 0, removed);

    // Gửi request reorder
    try {
      const orderedIds = newFavorites.map(f => f.id);
      await reorderFavorites({ variables: { favoriteIds: orderedIds } });
    } catch (error) {
      console.error('Error reordering favorites:', error);
    }

    setDraggedItem(null);
    setDraggedOver(null);
  };

  // Early returns như cũ...
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-slate-600 font-semibold">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Login Required</h3>
          <p className="text-slate-600 mb-6">Please login to view your favorite tours</p>
          <Link
            href="/login"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-slate-700 text-lg font-semibold">Loading your favorites...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your favorite tours</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Error loading favorites</h3>
          <p className="text-red-600 font-medium mb-4">{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const favorites = data?.getFavorites?.favorites || [];
  const total = data?.getFavorites?.total || 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-red-500 via-pink-600 to-rose-700 py-16 lg:py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-rose-700/90"></div>
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="relative w-full px-4 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Your Favorite
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Tours
            </span>
          </h1>
          <p className="text-lg md:text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
            {total > 0 
              ? `You have ${total} favorite tour${total !== 1 ? 's' : ''} saved`
              : 'Start building your dream travel collection'
            }
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 lg:px-8 -mt-8 relative z-10 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Stats Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 lg:p-8 mb-8 lg:mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">My Favorites</h2>
                  <p className="text-slate-600">Drag to reorder • Click to remove</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-800">{total}</div>
                <div className="text-sm text-slate-600">Total Tours</div>
              </div>
            </div>
          </div>

          {/* Favorites List */}
          {favorites.length === 0 ? (
            <div className="text-center py-12 lg:py-16">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 lg:p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No favorite tours yet</h3>
                <p className="text-slate-600 mb-6">Start exploring and add tours to your favorites by clicking the heart icon</p>
                <Link
                  href="/tours"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  Explore Tours
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* List Container */}
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-8">
                <div className="divide-y divide-slate-100">
                  {favorites.map((favorite, index) => (
                    <FavoriteListItem
                      key={favorite.id}
                      favorite={favorite}
                      index={index}
                      onRemove={() => handleRemoveFavorite(favorite.tour.id)} // ✅ Pass tourId
                      onDragStart={(e) => handleDragStart(e, favorite)}
                      onDragOver={(e) => handleDragOver(e, favorite)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, favorite)}
                      isDraggedOver={draggedOver?.id === favorite.id}
                      isDragging={draggedItem?.id === favorite.id}
                    />
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <span className="text-sm font-medium">
                        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} favorites
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}  
                        disabled={page === 1}
                        className="flex items-center space-x-2 px-4 py-2 border-2 border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium"
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
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg transform scale-110'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center space-x-2 px-4 py-2 border-2 border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium"
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
    </div>
  );
}

// ✅ Component FavoriteListItem
function FavoriteListItem({ 
  favorite, 
  index, 
  onRemove, 
  onDragStart, 
  onDragOver, 
  onDragLeave, 
  onDrop,
  isDraggedOver,
  isDragging 
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const buildUrl = (path) =>
    path?.startsWith('http')
      ? path
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative p-6 transition-all duration-300 cursor-move
        ${isDragging ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'}
        ${isDraggedOver ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
      `}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="flex items-center space-x-6 ml-8">
        {/* Tour Image */}
        <div className="flex-shrink-0">
          {favorite.tour.images && favorite.tour.images.length > 0 ? (
            <img
              src={buildUrl(favorite.tour.images[0])}
              alt={favorite.tour.title}
              className="w-24 h-24 object-cover rounded-xl shadow-md"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/96x96/e2e8f0/64748b?text=No+Image';
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Tour Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">
                {favorite.tour.title}
              </h3>
              
              <div className="flex items-center space-x-6 text-sm text-slate-600 mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{favorite.tour.location}</span>
                </div>
                
                {favorite.tour.category && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>{favorite.tour.category.name}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Added {formatDate(favorite.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-slate-800">
                ${favorite.tour.price}
              </div>
              <div className="text-sm text-slate-500">per person</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* View Details Button */}
          <Link
            href={`/tours/${favorite.tour.id}`}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
          >
            <span>View</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex items-center justify-center w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200 group"
            title="Remove from favorites"
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Drop Indicator */}
      {isDraggedOver && (
        <div className="absolute left-0 right-0 top-0 h-1 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
}
