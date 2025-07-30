'use client';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TOURS, GET_CATEGORIES } from '@/graphql/queries';
import CreateTourForm from '@/components/CreateTourForm';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

export default function ManageTourPage() {
  const { loading, error, data, refetch } = useQuery(GET_TOURS);
  const { data: catData, loading: catLoading } = useQuery(GET_CATEGORIES);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const pageSize = 10;

  // Build URL helper function - same as TourDetailPage
  const buildUrl = (path) => path?.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

  // Loading state
  if (loading || catLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-gray-700">Loading tours...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 border-2 border-red-200 p-12 rounded-3xl shadow-2xl max-w-2xl text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-4">Error Loading Tours</h3>
            <p className="text-red-600 text-lg">{error.message}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Filter and paginate tours
  const filteredTours = data?.tours
    ? data.tours.filter(tour => {
        const searchMatch = tour.title.toLowerCase().includes(search.toLowerCase());
        const statusMatch = statusFilter === 'all' || tour.status === statusFilter;
        return searchMatch && statusMatch;
      })
    : [];

  const paginatedTours = filteredTours.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.max(Math.ceil(filteredTours.length / pageSize), 1);

  // Statistics
  const totalTours = data?.tours?.length || 0;
  const activeTours = data?.tours?.filter(t => t.status === 'active').length || 0;
  const draftTours = data?.tours?.filter(t => t.status === 'draft').length || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200';
      case 'draft':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Hero Header with Stats */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-3">Tour Management</h1>
                    <p className="text-blue-100 text-lg">Create, manage and monitor your tour offerings</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{totalTours}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Total Tours</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{activeTours}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Active Tours</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="text-3xl font-bold mb-2">{draftTours}</div>
                    <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Draft Tours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Tour Form */}
          {showCreateForm && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Tour</h2>
                    <p className="text-lg text-gray-600">Add a new tour to your collection</p>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <CreateTourForm
                  onCreated={() => {
                    refetch();
                    setShowCreateForm(false);
                  }}
                  categories={catData?.categories || []}
                  catLoading={catLoading}
                />
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Tour List</h2>
                  <p className="text-lg text-gray-600">Manage your tour inventory</p>
                </div>
                
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Create New Tour
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Search Tours
                  </label>
                  <input
                    type="text"
                    placeholder="Search by title, location, or description..."
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium bg-gray-50 focus:bg-white shadow-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Tours Grid */}
              {filteredTours.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                  <div className="max-w-lg mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-blue-200 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">No Tours Found</h3>
                    <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                      {search || statusFilter !== 'all' 
                        ? 'No tours match your current search criteria.' 
                        : 'Start building your tour collection by creating your first tour.'
                      }
                    </p>
                    {(search || statusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('all');
                          setPage(1);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedTours.map((tour, index) => (
                    <div
                      key={tour.id}
                      className={`group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all duration-300 ${
                        index % 2 === 0 ? 'lg:hover:scale-[1.01]' : ''
                      }`}
                    >
                      {/* Tour Header with Hero Image */}
                      <div className="relative h-48 lg:h-64 overflow-hidden">
                        {tour.images && tour.images.length > 0 ? (
                          <img
                            src={buildUrl(tour.images[0])}
                            alt={tour.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/800x300/3b82f6/ffffff?text=Amazing+Tour+Experience';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                            <div className="text-center text-white">
                              <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-lg font-medium">Amazing Tour Experience</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide border-2 shadow-lg backdrop-blur-sm ${getStatusColor(tour.status)}`}>
                            {tour.status}
                          </span>
                        </div>

                        {/* Tour Title Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg line-clamp-2">
                            {tour.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-white/90">
                            <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium">{tour.location}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span className="font-medium">${tour.price}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="font-medium">{tour.category?.name || 'Uncategorized'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tour Content */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                          {/* Services */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Services Included</h4>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {tour.servicesIncluded?.join(', ') || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Services Excluded</h4>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {tour.servicesExcluded?.join(', ') || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Cancel Policy</h4>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {tour.cancelPolicy || 'Not specified'}
                              </p>
                            </div>
                          </div>

                          {/* Itinerary */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Itinerary</h4>
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-6">
                              {tour.itinerary || 'No itinerary provided'}
                            </p>
                          </div>
                        </div>

                        {/* Media Gallery */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Images</h4>
                            <div className="flex flex-wrap gap-2">
                              {tour.images?.length > 0 ? (
                                tour.images.slice(0, 6).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={buildUrl(img)}
                                    alt={`Tour image ${idx + 1}`}
                                    className="h-16 w-16 object-cover rounded-xl shadow-sm border border-gray-200 hover:scale-110 transition-transform duration-200 cursor-pointer"
                                    onClick={() => setSelectedImage(buildUrl(img))}
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/64x64/e2e8f0/64748b?text=No+Image';
                                    }}
                                  />
                                ))
                              ) : (
                                <p className="text-gray-500 text-sm">No images uploaded</p>
                              )}
                              {tour.images?.length > 6 && (
                                <div className="h-16 w-16 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors">
                                  +{tour.images.length - 6}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Videos</h4>
                            <div className="flex flex-wrap gap-2">
                              {tour.videos?.length > 0 ? (
                                tour.videos.slice(0, 3).map((vid, idx) => (
                                  <video
                                    key={idx}
                                    src={buildUrl(vid)}
                                    className="h-16 w-24 rounded-xl shadow-sm border border-gray-200 hover:scale-110 transition-transform duration-200"
                                    controls
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ))
                              ) : (
                                <p className="text-gray-500 text-sm">No videos uploaded</p>
                              )}
                              {tour.videos?.length > 3 && (
                                <div className="h-16 w-24 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-gray-600">
                                  +{tour.videos.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                          <Link
                            href={`/admin/tours/${tour.id}`}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                          >
                            View Details
                          </Link>
                          <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                            Edit Tour
                          </button>
                          <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                            Delete Tour
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
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
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal - Same as TourDetailPage */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
