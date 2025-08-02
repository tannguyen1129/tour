'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BOOKINGS } from '../../graphql/queries';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function BookingsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const { loading, error, data, refetch } = useQuery(GET_BOOKINGS, {
    skip: !user
  });

  // ✅ Simple date validation function (consistent với approach đã fix)
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
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Login Required</h3>
          <p className="text-slate-600 mb-6">Please log in to view your bookings</p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-slate-700 text-lg font-semibold">Loading your bookings...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your travel history</p>
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
            <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Bookings</h3>
            <p className="text-red-600 font-medium mb-4">{error.message}</p>
            <button 
              onClick={() => refetch()} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Add safety check for data
  const bookings = data?.bookings?.filter(booking => !booking.isDeleted) || [];
  
  // ✅ Enhanced filtering with safe property access
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'confirmed') return booking.status === 'confirmed';
    if (filter === 'pending') return booking.status === 'pending';
    if (filter === 'completed') return booking.paymentStatus === 'paid'; // ✅ Match với backend - 'paid' thay vì 'completed'
    return true;
  });

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">No Bookings Yet</h3>
          <p className="text-slate-600 mb-8 leading-relaxed">
            You haven't made any bookings yet. Start exploring our amazing tours and create unforgettable memories!
          </p>
          <Link
            href="/tours"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Explore Tours</span>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Safe statistics calculation
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedPayments = bookings.filter(b => b.paymentStatus === 'paid').length; // ✅ Match với backend
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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

      <div className="relative z-10 py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">Your Bookings</h1>
                <p className="text-slate-600">Manage and track your travel adventures</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-slate-800">{bookings.length}</p>
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
                    <p className="text-2xl font-bold text-green-600">{confirmedBookings}</p>
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
                    <p className="text-2xl font-bold text-yellow-600">{pendingBookings}</p>
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
                    <p className="text-2xl font-bold text-purple-600">{completedPayments}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Filter Bookings</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'confirmed', label: 'Confirmed', count: confirmedBookings },
                { key: 'pending', label: 'Pending', count: pendingBookings },
                { key: 'completed', label: 'Paid', count: completedPayments } // ✅ Label thay đổi để match
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Grid */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No bookings found</h3>
              <p className="text-slate-600">No bookings match the selected filter.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-slate-200 overflow-hidden transition-all duration-500 transform hover:-translate-y-2"
                  style={{
                    // ✅ Fix: Sử dụng separate properties thay vì mix shorthand và individual
                    animationName: 'fadeInUp',
                    animationDuration: '0.6s',
                    animationTimingFunction: 'ease-out',
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards',
                    opacity: 0 // Start with opacity 0 for animation
                  }}
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white line-clamp-1">
                      {booking.tour?.title || 'Untitled Tour'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Booked on {isValidDate(booking.createdAt)
                        ? new Date(booking.createdAt).toLocaleDateString('en-GB')
                        : 'No date'}
                    </p>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.status || 'N/A'}
                      </span>
                      
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : booking.paymentStatus === 'unpaid'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {booking.paymentStatus || 'N/A'}
                      </span>
                    </div>

                    {/* Passengers Count */}
                    {booking.passengers?.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4 text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>View Details</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ CSS animations with proper keyframes */}
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
        
        @keyframes float {
          0% { 
            transform: translateY(0px) rotate(0deg); 
          }
          100% { 
            transform: translateY(-20px) rotate(3deg); 
          }
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
