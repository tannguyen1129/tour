'use client';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TOUR_DETAIL, GET_REVIEWS } from '../../../graphql/queries';
import BookingForm from '../../../components/BookingForm';
import { useAuth } from '../../../context/AuthContext';
import { use } from 'react';

export default function TourDetailPage({ params }) {
  const { id } = use(params); 
  const { user } = useAuth();

  const { loading, error, data } = useQuery(GET_TOUR_DETAIL, { variables: { id } });
  const tour = data?.tour;

  const { data: reviewData, loading: reviewLoading, error: reviewError } = useQuery(GET_REVIEWS, {
    variables: { tour: tour?.id },
    skip: !tour?.id
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const reviewsPerPage = 4;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-slate-700 text-lg font-semibold">Loading tour details...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait while we prepare your adventure</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tour Not Found</h3>
            <p className="text-red-600 font-medium">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tour Not Found</h3>
          <p className="text-slate-600">The tour you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const reviews = reviewData?.reviews || [];
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const pagedReviews = reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const buildUrl = (path) => path?.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] lg:h-[70vh] overflow-hidden">
        {tour.images && tour.images.length > 0 ? (
          <img
            src={buildUrl(tour.images[0])}
            alt={tour.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1200x600/3b82f6/ffffff?text=Amazing+Tour+Experience';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-24 h-24 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl font-medium">Amazing Tour Experience</p>
            </div>
          </div>
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40"></div>
        
        {/* Hero Content */}
        {/* Hero Content */}
<div className="absolute inset-0 flex items-end z-20">
  <div className="w-full px-4 lg:px-8 pb-8 lg:pb-12">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-6 lg:space-y-0">
        <div className="flex-1 space-y-4 relative z-30">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            {tour.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-lg">{tour.location}</span>
            </div>
            <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium text-lg">{tour.category?.name}</span>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-white/30'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <span className="font-medium text-lg">{averageRating} ({reviews.length} reviews)</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 min-w-[200px] relative z-30">
          <div className="text-center">
            <p className="text-white/80 text-sm font-medium">Starting from</p>
            <p className="text-3xl font-bold text-white">${tour.price}</p>
            <p className="text-white/80 text-sm">per person</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      </div>

      {/* Main Content */}
      <div className="w-full px-4 lg:px-8 -mt-16 relative z-10 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Tour Details Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>About This Tour</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-xl p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600 mb-1">Location</p>
                            <p className="text-lg font-semibold text-slate-800 leading-relaxed">{tour.location}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600 mb-1">Price</p>
                            <p className="text-lg font-semibold text-slate-800">${tour.price}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {tour.description && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-4">Description</h3>
                      <p className="text-slate-700 leading-relaxed text-base">{tour.description}</p>
                    </div>
                  )}
                </div>

                {/* Itinerary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Itinerary</span>
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-base">{tour.itinerary}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h8m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
                <span>Book This Tour</span>
              </h2>
              {user ? (
                <BookingForm tourId={tour.id} />
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-amber-800 mb-2">Login Required</h3>
                  <p className="text-amber-700 mb-4">Please log in to book this amazing tour experience</p>
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                    Sign In to Book
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section - Moved to bottom */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Customer Reviews</span>
                </h2>
                {reviews.length > 0 && (
                  <div className="text-right">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-slate-300'}`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-slate-800">{averageRating}</span>
                      <span className="text-slate-600">({reviews.length} reviews)</span>
                    </div>
                  </div>
                )}
              </div>

              {reviewLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading reviews...</p>
                </div>
              )}

              {reviewError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600 font-medium">Error loading reviews: {reviewError.message}</p>
                </div>
              )}

              {!reviewLoading && reviews.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pagedReviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < rev.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                            </div>
                            <span className="font-bold text-slate-800">{rev.rating}/5</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-600">
                              {rev.user?.email || 'Anonymous'}
                            </p>
                          </div>
                        </div>
                        <p className="text-slate-700 mb-4 leading-relaxed">{rev.comment}</p>

                        {rev.reply && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                            <p className="text-green-800 font-semibold text-sm mb-1">Admin Reply:</p>
                            <p className="text-green-700 text-sm">{rev.reply}</p>
                          </div>
                        )}

                        {rev.images?.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto">
                            {rev.images.map((img, i) => (
                              <img
                                key={i}
                                src={buildUrl(img)}
                                alt={`Review image ${i + 1}`}
                                className="h-16 w-16 object-cover rounded-lg border-2 border-slate-200 hover:border-blue-400 transition-colors cursor-pointer flex-shrink-0"
                                onClick={() => setSelectedImage(buildUrl(img))}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/64x64/e2e8f0/64748b?text=No+Image';
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                              currentPage === i + 1
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                !reviewLoading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Reviews Yet</h3>
                    <p className="text-slate-600">Be the first to share your experience with this tour!</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
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
    </div>
  );
}
