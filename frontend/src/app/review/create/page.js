'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOKINGS, GET_REVIEWS } from '../../../graphql/queries';
import { CREATE_REVIEW } from '../../../graphql/mutations';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import UploadInput from '../../../components/UploadInput';

export default function CreateReviewPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const { data: bookingData, loading: bookingLoading, error: bookingError } = useQuery(GET_BOOKINGS, { 
    skip: !user,
    fetchPolicy: 'cache-and-network'
  });
  const { data: reviewData } = useQuery(GET_REVIEWS, { 
    skip: !user,
    fetchPolicy: 'cache-and-network'
  });
  const [createReview, { loading: creating, error: createError }] = useMutation(CREATE_REVIEW);

  const [selectedTour, setSelectedTour] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Simple date validation function (consistent với các page khác)
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleUploaded = (urls) => {
    setImages((prev) => [...prev, ...urls]);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTour) {
      alert('Please select a tour to review.');
      return;
    }

    // ✅ Enhanced duplicate check với safe property access
    const alreadyReviewed = reviewData?.reviews?.some(r =>
      r.tour?.id === selectedTour && r.user?.id === user?.id && !r.isDeleted
    );
    if (alreadyReviewed) {
      alert('You have already reviewed this tour.');
      return;
    }

    try {
      await createReview({
        variables: {
          tour: selectedTour,
          rating,
          comment: comment.trim() || 'No comment provided',
          images: images.filter(img => img && img.trim()) // Filter out empty images
        }
      });
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/tours');
      }, 2000);
    } catch (err) {
      console.error('Review creation failed:', err);
    }
  };

  // ✅ Match với backend logic - chỉ 'paid' bookings eligible (không có 'completed')
  const eligibleBookings = bookingData?.bookings?.filter(b => 
    b.paymentStatus === 'paid' && !b.isDeleted && b.tour?.id
  ) || [];

  // ✅ Safe reviewed tour IDs với proper null checks
  const reviewedTourIds = new Set(
    reviewData?.reviews?.filter(r => 
      r.user?.id === user?.id && !r.isDeleted && r.tour?.id
    ).map(r => r.tour.id) || []
  );

  const toursToReview = eligibleBookings.filter(b => !reviewedTourIds.has(b.tour.id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-slate-700 text-lg font-semibold">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-slate-700 text-lg font-semibold">Loading your bookings...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your completed tours</p>
        </div>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Bookings</h3>
            <p className="text-red-600 font-medium mb-4">{bookingError.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative Background Elements - ✅ Fixed animation properties */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"
          style={{
            animationName: 'float',
            animationDuration: '6s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate'
          }}
        ></div>
        <div 
          className="absolute top-20 right-20 w-60 h-60 bg-indigo-400/10 rounded-full blur-3xl"
          style={{
            animationName: 'float',
            animationDuration: '8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '2s'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl"
          style={{
            animationName: 'float',
            animationDuration: '7s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '4s'
          }}
        ></div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Review Submitted!</h3>
            <p className="text-slate-600">Thank you for sharing your experience. Redirecting...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Write a Review</h1>
            <p className="text-slate-600 text-lg">Share your experience with other travelers</p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* User Info Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Reviewer</p>
                  <p className="text-white font-bold text-lg">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Tour Selection */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-base font-bold text-slate-800">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Select Tour</span>
                </label>
                <select
                  value={selectedTour}
                  onChange={(e) => setSelectedTour(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800 font-medium hover:border-slate-400"
                  required
                >
                  <option value="" className="text-slate-600">-- Select a tour you completed --</option>
                  {toursToReview.map((b) => (
                    <option key={b.id} value={b.tour.id} className="text-slate-800">
                      {b.tour.title}
                    </option>
                  ))}
                </select>
                {toursToReview.length === 0 && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-amber-900 font-semibold">No tours available for review</p>
                        <p className="text-amber-800 text-sm">You need to complete and pay for a tour before you can review it.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rating Selection */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-base font-bold text-slate-800">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Rating</span>
                </label>
                <div className="flex items-center space-x-4">
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="px-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800 font-medium hover:border-slate-400"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r} className="text-slate-800">{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                          star <= rating ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        onClick={() => setRating(star)}
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-base font-bold text-slate-800">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Your Review</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none hover:border-slate-400 text-slate-800 placeholder-slate-500"
                  rows={6}
                  placeholder="Share your experience... What did you love about this tour? Any tips for future travelers?"
                />
              </div>

              {/* Upload Section */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-base font-bold text-slate-800">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Add Photos (Optional)</span>
                </label>
                <div className="border-2 border-dashed border-slate-400 rounded-xl p-6 hover:border-blue-500 transition-colors bg-slate-50">
                  <UploadInput
                    label="Upload Images"
                    onUploaded={handleUploaded}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-800">Uploaded Images ({images.length})</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Review Image ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-xl border-2 border-slate-300 group-hover:border-blue-500 transition-colors"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/96x96/e2e8f0/64748b?text=No+Image';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={creating || toursToReview.length === 0 || !selectedTour}
                  className="group relative w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md overflow-hidden"
                >
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button Content */}
                  <div className="relative flex items-center space-x-3">
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting Review...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Submit Review</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Error Message */}
              {createError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-800">Submission Failed</h4>
                      <p className="text-red-700 text-sm">{createError.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">How to write a great review</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Only paid bookings are eligible for reviews</li>
                  <li>• Share specific details about your experience</li>
                  <li>• Mention highlights, guides, and overall value</li>
                  <li>• Add photos to help other travelers</li>
                  <li>• Be honest and constructive in your feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Add CSS for float animation */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
