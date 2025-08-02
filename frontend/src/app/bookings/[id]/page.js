'use client';
import { use } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { GET_BOOKINGS } from '../../../graphql/queries';
import { CHECKOUT, CONFIRM_PAYMENT } from '../../../graphql/mutations';
import { useEffect, useState } from 'react';

export default function BookingDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Payment status từ URL
  const paymentStatus = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  
  // ✅ State để show payment notification
  const [showPaymentNotification, setShowPaymentNotification] = useState(false);
  const [paymentNotificationType, setPaymentNotificationType] = useState('success');
  const [paymentNotificationMessage, setPaymentNotificationMessage] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_BOOKINGS, {
    errorPolicy: 'all'
  });
  
  const [checkout, { loading: checkoutLoading }] = useMutation(CHECKOUT);
  const [confirmPayment] = useMutation(CONFIRM_PAYMENT);

  // ✅ Handle payment success/failure notifications from URL
  useEffect(() => {
    if (paymentStatus && sessionId) {
      if (paymentStatus === 'success') {
        handlePaymentSuccess(sessionId, paymentId);
      } else if (paymentStatus === 'cancelled') {
        showNotification('warning', 'Payment was cancelled. You can try again anytime.');
      }
      
      // ✅ Clean URL sau khi process
      const url = new URL(window.location);
      url.searchParams.delete('payment');
      url.searchParams.delete('session_id');
      url.searchParams.delete('payment_id');
      window.history.replaceState({}, '', url.toString());
    }
  }, [paymentStatus, sessionId, paymentId]);

  // ✅ Enhanced handlePaymentSuccess với better debugging
  const handlePaymentSuccess = async (stripeSessionId, paymentIdFromUrl) => {
    try {
      console.log('=== Payment Confirmation Debug ===');
      console.log('Stripe Session ID:', stripeSessionId);
      console.log('Payment ID from URL:', paymentIdFromUrl);
      console.log('Booking ID:', id);
      
      // ✅ Confirm payment với backend - match với backend schema
      const variables = {
        // ✅ paymentId là optional (ID) trong backend schema
        paymentId: paymentIdFromUrl || null,
        // ✅ transactionId là required (String!) trong backend schema
        transactionId: stripeSessionId
      };
      
      console.log('Confirm Payment Variables:', variables);
      
      const result = await confirmPayment({
        variables: variables
      });
      
      console.log('Confirm Payment Result:', result);
      
      // Refresh bookings list
      await refetch();
      
      showNotification('success', 'Payment successful! Your booking has been confirmed.');
    } catch (error) {
      console.error('=== Payment Confirmation Error ===');
      console.error('Error details:', error);
      console.error('GraphQL errors:', error.graphQLErrors);
      console.error('Network error:', error.networkError);
      
      // ✅ Fallback strategy nếu confirmation fail
      try {
        await refetch();
        const updatedBooking = data?.bookings.find((b) => b.id === id);
        
        if (updatedBooking?.paymentStatus === 'paid') {
          showNotification('success', 'Payment confirmed! Your booking is now active.');
        } else {
          showNotification('error', 'Payment processed but confirmation failed. Please contact support.');
        }
      } catch (refetchError) {
        console.error('Refetch failed:', refetchError);
        showNotification('error', 'Unable to verify payment status. Please contact support.');
      }
    }
  };

  // ✅ Show notification helper
  const showNotification = (type, message) => {
    setPaymentNotificationType(type);
    setPaymentNotificationMessage(message);
    setShowPaymentNotification(true);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setShowPaymentNotification(false);
    }, 5000);
  };

  // ✅ Handle continue payment for existing booking
  const handleContinuePayment = async () => {
    if (!booking || checkoutLoading) return;

    try {
      // ✅ Map payment methods to match backend expectations
      const methodMapping = {
        'credit_card': 'Stripe',
        'vnpay': 'VNPay', 
        'momo': 'VNPay', // Backend handles MoMo through VNPay
        'cash': 'cash'
      };

      const backendMethod = methodMapping[booking.paymentMethod] || booking.paymentMethod;

      if (backendMethod === 'cash') {
        alert('Cash payment will be collected at pickup location.');
        return;
      }

      console.log('Processing payment for existing booking:', booking.id, 'with method:', backendMethod);

      const checkoutRes = await checkout({
        variables: {
          bookingId: booking.id, // ✅ Use existing booking ID
          method: backendMethod
        }
      });

      const { payUrl } = checkoutRes.data.checkout;
      
      if (payUrl) {
        console.log('Redirecting to payment URL:', payUrl);
        window.location.href = payUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment continuation failed:', error);
      alert(`Payment failed: ${error.message}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-slate-700 text-lg font-semibold">Loading booking details...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your booking information</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Booking</h3>
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

  const booking = data?.bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Not Found</h3>
          <p className="text-slate-600 mb-6">The booking you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/bookings')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Bookings</span>
          </button>
        </div>
      </div>
    );
  }

  const handleWriteReview = () => {
    router.push(`/bookings/${id}/review`);
  };

  // ✅ Enhanced payment status checks to match backend
  const needsPayment = booking.paymentStatus === 'unpaid' || booking.paymentStatus === 'pending' || !booking.paymentStatus;
  const isCompleted = booking.paymentStatus === 'paid' || booking.paymentStatus === 'completed';
  const canPayOnline = booking.paymentMethod !== 'cash';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* ✅ Enhanced Payment Notification */}
      {showPaymentNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-2xl p-4 shadow-xl border-2 transition-all duration-300 ${
            paymentNotificationType === 'success' ? 'bg-green-50 border-green-200' :
            paymentNotificationType === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                paymentNotificationType === 'success' ? 'bg-green-100' :
                paymentNotificationType === 'warning' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                {paymentNotificationType === 'success' ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : paymentNotificationType === 'warning' ? (
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${
                  paymentNotificationType === 'success' ? 'text-green-800' :
                  paymentNotificationType === 'warning' ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  {paymentNotificationType === 'success' ? 'Payment Successful!' :
                   paymentNotificationType === 'warning' ? 'Payment Cancelled' :
                   'Payment Error'}
                </h4>
                <p className={`text-sm ${
                  paymentNotificationType === 'success' ? 'text-green-700' :
                  paymentNotificationType === 'warning' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {paymentNotificationMessage}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentNotification(false)}
                className={`${
                  paymentNotificationType === 'success' ? 'text-green-600 hover:text-green-800' :
                  paymentNotificationType === 'warning' ? 'text-yellow-600 hover:text-yellow-800' :
                  'text-red-600 hover:text-red-800'
                } transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/bookings')}
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">Back to Bookings</span>
                </button>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-slate-800">Booking Details</h1>
                <p className="text-slate-600">ID: {booking.id}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tour Information */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Tour Information</span>
                  </h2>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {booking.tour?.title || 'Unknown Tour'}
                  </h3>
                  <p className="text-slate-600 mb-4">Experience the adventure of a lifetime</p>
                  
                  {/* ✅ Enhanced Pricing Information */}
                  {(booking.total || booking.subtotal) && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>Booking Summary</span>
                      </h4>
                      
                      {booking.subtotal && (
                        <div className="flex justify-between items-center text-slate-700">
                          <span>Subtotal</span>
                          <span className="font-medium">{formatCurrency(booking.subtotal)}</span>
                        </div>
                      )}
                      
                      {booking.discount > 0 && (
                        <div className="flex justify-between items-center text-green-700">
                          <span>Discount {booking.voucher && `(${booking.voucher})`}</span>
                          <span className="font-medium">-{formatCurrency(booking.discount)}</span>
                        </div>
                      )}
                      
                      {booking.total && (
                        <div className="border-t border-slate-300 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-800">Total Amount</span>
                            <span className="text-xl font-bold text-blue-600">
                              {formatCurrency(booking.total)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Customer Information</span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-800">
                        {booking.user?.email || 'Unknown User'}
                      </p>
                      <p className="text-slate-600">Customer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Passengers ({booking.passengers?.length || 0})</span>
                  </h2>
                </div>
                <div className="p-6">
                  {booking.passengers?.length > 0 ? (
                    <div className="space-y-3">
                      {booking.passengers.map((passenger, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-4 flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{passenger.name}</p>
                            <p className="text-sm text-slate-600">
                              Age: {passenger.age} • Type: <span className="capitalize">{passenger.type}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 font-medium">No passenger information available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Information */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Booking Status</span>
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Status</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {booking.status || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Payment</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : booking.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {booking.paymentStatus || 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ Enhanced Payment Action - Continue Payment if needed */}
              {needsPayment && canPayOnline && (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden animate-pulse-slow">
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>Payment Required</span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <p className="text-slate-600 mb-2">Complete your payment to confirm your booking</p>
                      {booking.total && (
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(booking.total)}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={handleContinuePayment}
                      disabled={checkoutLoading}
                      className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        {checkoutLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>
                              {booking.paymentMethod === 'credit_card' ? 'Pay with Stripe' :
                               booking.paymentMethod === 'vnpay' ? 'Pay with VNPay' :
                               booking.paymentMethod === 'momo' ? 'Pay with MoMo' :
                               'Complete Payment'}
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                    
                    {/* Payment method info */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Payment method: <strong className="capitalize">{booking.paymentMethod}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Cash Payment Notice */}
              {needsPayment && !canPayOnline && (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Cash Payment</span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Payment on Arrival</h3>
                      <p className="text-slate-600 mb-4">
                        You've selected cash payment. Payment will be collected at the pickup location.
                      </p>
                      {booking.total && (
                        <p className="text-xl font-bold text-amber-600 mb-4">
                          Amount Due: {formatCurrency(booking.total)}
                        </p>
                      )}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-amber-800 text-sm">
                          💡 Please bring exact change or small bills for easier transaction
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Payment Details</span>
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Payment Method</span>
                    <span className="text-slate-800 font-semibold capitalize flex items-center space-x-2">
                      <span>{booking.paymentMethod || 'N/A'}</span>
                      {booking.paymentMethod === 'credit_card' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Stripe</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Voucher</span>
                    <span className="text-slate-800 font-semibold">
                      {booking.voucher || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Timeline</span>
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-slate-600 font-medium mb-1">Created</p>
                    <p className="text-slate-800 font-semibold">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium mb-1">Last Updated</p>
                    <p className="text-slate-800 font-semibold">
                      {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Action - Only show if payment is completed */}
              {isCompleted && (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>Share Your Experience</span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-600 mb-4">Your tour is complete! Share your experience with other travelers.</p>
                    <button
                      onClick={handleWriteReview}
                      className="block w-full text-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>Write a Review</span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
