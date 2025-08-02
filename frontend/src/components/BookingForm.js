'use client';
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_BOOKING, CHECKOUT } from '../graphql/mutations';
import { GET_TOUR_DETAIL } from '../graphql/queries';

export default function BookingForm({ tourId }) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [voucher, setVoucher] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // ✅ GraphQL mutations
  const [createBooking, { loading: bookingLoading, error: bookingError }] = useMutation(CREATE_BOOKING);
  const [checkout, { loading: checkoutLoading, error: checkoutError }] = useMutation(CHECKOUT);

  // ✅ State cho pricing calculation
  const [pricing, setPricing] = useState({
    basePrice: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    isCalculating: false,
    isValidVoucher: null
  });

  // ✅ Query tour detail
  const { data: tourData, loading: tourLoading, error: tourError } = useQuery(GET_TOUR_DETAIL, {
    variables: { id: tourId },
    skip: !tourId,
    errorPolicy: 'all'
  });

  // ✅ Memoized calculatePricing function
  const calculatePricing = useCallback(async () => {
    if (!tourData?.tour?.price) return;

    setPricing(prev => ({ ...prev, isCalculating: true }));

    try {
      const basePrice = tourData.tour.price;
      const totalPassengers = adults + children;
      const subtotal = basePrice * totalPassengers;

      let discount = 0;
      let isValidVoucher = null;

      if (voucher.trim()) {
        // ✅ Mock voucher validation với better structure
        const mockVoucherDiscounts = {
          'SAVE10': { type: 'percentage', value: 10, description: 'Save 10%' },
          'SAVE50K': { type: 'fixed', value: 50, description: 'Save $50' },
          'WELCOME20': { type: 'percentage', value: 20, maxDiscount: 100, description: 'Welcome 20% off' }
        };

        const voucherData = mockVoucherDiscounts[voucher.toUpperCase()];
        if (voucherData) {
          isValidVoucher = true;
          if (voucherData.type === 'percentage') {
            discount = (subtotal * voucherData.value) / 100;
            if (voucherData.maxDiscount && discount > voucherData.maxDiscount) {
              discount = voucherData.maxDiscount;
            }
          } else if (voucherData.type === 'fixed') {
            discount = Math.min(voucherData.value, subtotal);
          }
        } else {
          isValidVoucher = false;
        }
      }

      const total = Math.max(0, subtotal - discount);

      setPricing({
        basePrice,
        subtotal,
        discount,
        total,
        isCalculating: false,
        isValidVoucher
      });
    } catch (error) {
      console.error('Pricing calculation error:', error);
      setPricing(prev => ({ ...prev, isCalculating: false }));
    }
  }, [tourData?.tour?.price, adults, children, voucher]);

  // ✅ Calculate pricing when dependencies change
  useEffect(() => {
    if (tourData?.tour?.price) {
      calculatePricing();
    }
  }, [calculatePricing]);

  // ✅ Enhanced handleSubmit with better error handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Input validation
    if (totalPassengers === 0) {
      alert('Please select at least one passenger');
      return;
    }

    const passengers = [
      ...Array(adults).fill().map((_, index) => ({ 
        name: `Adult ${index + 1}`, 
        age: 30, 
        type: 'adult' 
      })),
      ...Array(children).fill().map((_, index) => ({ 
        name: `Child ${index + 1}`, 
        age: 10, 
        type: 'child' 
      }))
    ];

    try {
      // ✅ Bước 1: Tạo booking
      const bookingRes = await createBooking({
        variables: {
          input: {
            tour: tourId,
            passengers,
            voucher: voucher.trim() || null,
            paymentMethod
          }
        }
      });

      const bookingId = bookingRes.data.createBooking.id;

      // ✅ Bước 2: Handle payment methods
      if (paymentMethod === 'cash') {
        // Cash payment - hiển thị thông báo thành công
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 5000);
      } else {
        // ✅ Online payments - sử dụng GraphQL checkout mutation
        await handleOnlinePayment(bookingId, paymentMethod);
      }
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  // ✅ Handle online payments với GraphQL
  const handleOnlinePayment = async (bookingId, method) => {
    try {
      // ✅ Map frontend payment method names to backend expected values
      const methodMapping = {
        'credit_card': 'Stripe',
        'vnpay': 'VNPay',
        'momo': 'VNPay' // Sử dụng VNPay cho MoMo hoặc có thể tạo method riêng
      };

      const backendMethod = methodMapping[method] || method;

      const checkoutRes = await checkout({
        variables: {
          bookingId,
          method: backendMethod
        }
      });

      const { payUrl } = checkoutRes.data.checkout;
      
      if (payUrl) {
        // ✅ Redirect to payment gateway
        window.location.href = payUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment checkout error:', error);
      // ✅ Better user feedback
      const errorMessage = error.message || 'Payment failed. Please try again.';
      alert(`Payment Error: ${errorMessage}`);
    }
  };

  // ✅ Helper function to reset form
  const resetForm = useCallback(() => {
    setAdults(1);
    setChildren(0);
    setVoucher('');
    setPaymentMethod('cash');
  }, []);

  // ✅ Format currency helper - USD
  const formatCurrency = useCallback((amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Calculate total passengers
  const totalPassengers = adults + children;
  const loading = bookingLoading || checkoutLoading;
  const error = bookingError || checkoutError;

  // ✅ Enhanced loading state
  if (tourLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  // ✅ Enhanced error handling
  if (tourError && !tourData) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-red-200 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Tour</h3>
          <p className="text-slate-600 text-sm mb-4">{tourError.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ✅ Enhanced Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border-2 border-green-200 rounded-2xl p-4 shadow-xl transform transition-all duration-500 animate-slide-in">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-800">Booking Successful!</h4>
              <p className="text-green-700 text-sm">Your tour has been booked successfully. Check your email for confirmation.</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h8m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Book Your Adventure</h3>
                <p className="text-blue-100 text-sm">Complete your booking details below</p>
              </div>
            </div>
            {/* ✅ Enhanced price display */}
            <div className="text-right">
              <p className="text-blue-100 text-sm">Price per person</p>
              <p className="text-white font-bold text-lg">
                {formatCurrency(pricing.basePrice)}
              </p>
              {tourData?.tour?.title && (
                <p className="text-blue-200 text-xs truncate max-w-32">
                  {tourData.tour.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Passengers Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Passengers</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adults Counter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Adults (18+ years)
                </label>
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl overflow-hidden hover:border-blue-400 transition-colors">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={loading}
                      className="px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={adults}
                      min="1"
                      max="10"
                      onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                      disabled={loading}
                      required
                      className="flex-1 px-4 py-3 text-center font-semibold text-slate-800 bg-transparent focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setAdults(Math.min(10, adults + 1))}
                      disabled={loading}
                      className="px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Children Counter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Children (0-17 years)
                </label>
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl overflow-hidden hover:border-blue-400 transition-colors">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={loading}
                      className="px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={children}
                      min="0"
                      max="10"
                      onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                      disabled={loading}
                      className="flex-1 px-4 py-3 text-center font-semibold text-slate-800 bg-transparent focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      disabled={loading}
                      className="px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">Total Passengers:</span>
                <span className="text-blue-900 font-bold text-lg">{totalPassengers}</span>
              </div>
            </div>
          </div>

          {/* Voucher Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Voucher Code (Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                disabled={loading}
                placeholder="Enter your voucher code (SAVE10, SAVE50K, WELCOME20)"
                className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white text-slate-800 placeholder-slate-400 font-medium hover:border-slate-400 disabled:opacity-50 ${
                  pricing.isValidVoucher === true ? 'border-green-500 bg-green-50' :
                  pricing.isValidVoucher === false ? 'border-red-500 bg-red-50' :
                  'border-slate-300'
                }`}
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {/* Voucher validation feedback */}
              {pricing.isValidVoucher !== null && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {pricing.isValidVoucher ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {/* Voucher feedback messages */}
            {pricing.isValidVoucher === true && pricing.discount > 0 && (
              <p className="text-green-700 text-sm font-medium">
                ✅ Voucher applied! You save {formatCurrency(pricing.discount)}
              </p>
            )}
            {pricing.isValidVoucher === false && (
              <p className="text-red-700 text-sm font-medium">
                ❌ Invalid voucher code
              </p>
            )}
          </div>

          {/* Pricing Summary Section */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Pricing Summary</span>
              {pricing.isCalculating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </h4>
            
            <div className="space-y-3">
              {/* Base calculation */}
              <div className="flex justify-between items-center text-slate-700">
                <span>Base price × {totalPassengers} passenger{totalPassengers > 1 ? 's' : ''}</span>
                <span className="font-medium">{formatCurrency(pricing.subtotal)}</span>
              </div>
              
              {/* Discount row */}
              {pricing.discount > 0 && (
                <div className="flex justify-between items-center text-green-700">
                  <span>Discount ({voucher.toUpperCase()})</span>
                  <span className="font-medium">-{formatCurrency(pricing.discount)}</span>
                </div>
              )}
              
              {/* Divider */}
              <div className="border-t border-slate-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-slate-800">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(pricing.total)}
                  </span>
                </div>
              </div>
              
              {/* Savings highlight */}
              {pricing.discount > 0 && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-semibold text-sm">
                    🎉 You're saving {formatCurrency(pricing.discount)} with this voucher!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 flex items-center space-x-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Payment Method</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { 
                  value: 'credit_card', 
                  label: 'Credit Card (Stripe)', 
                  icon: '💳', 
                  desc: 'Secure payment via Stripe - Visa, Mastercard, Amex',
                  popular: true
                },
                { 
                  value: 'vnpay', 
                  label: 'VNPay', 
                  icon: '🏦', 
                  desc: 'Pay via VNPay banking gateway'
                },
                { 
                  value: 'momo', 
                  label: 'MoMo E-Wallet', 
                  icon: '📱', 
                  desc: 'Pay with MoMo digital wallet'
                },
                { 
                  value: 'cash', 
                  label: 'Cash Payment', 
                  icon: '💵', 
                  desc: 'Pay in cash at pickup location'
                }
              ].map((method) => (
                <label
                  key={method.value}
                  className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                  } ${method.popular ? 'ring-2 ring-blue-100' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={loading}
                    className="sr-only"
                  />
                  
                  {/* Popular badge */}
                  {method.popular && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                      paymentMethod === method.value 
                        ? 'bg-blue-100' 
                        : 'bg-slate-100 group-hover:bg-blue-100'
                    }`}>
                      <span className="text-2xl">{method.icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{method.label}</p>
                      <p className="text-sm text-slate-600">{method.desc}</p>
                    </div>
                  </div>
                  {paymentMethod === method.value && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
            
            {/* Payment Security Notice */}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Secure Payment</p>
                  <p className="text-xs text-slate-600">
                    All transactions are encrypted and processed securely. Credit card payments are powered by Stripe with industry-leading security standards.
                  </p>
                  {paymentMethod === 'credit_card' && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-blue-700">
                      <span className="font-medium">🛡️ Protected by Stripe</span>
                      <span>•</span>
                      <span>SSL Encrypted</span>
                      <span>•</span>
                      <span>PCI Compliant</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || pricing.isCalculating || totalPassengers === 0}
              className="group relative w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md overflow-hidden"
            >
              {/* Button Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button Content */}
              <div className="relative flex items-center space-x-3">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Booking...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h8m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v4" />
                    </svg>
                    <span>
                      {paymentMethod === 'credit_card' ? 'Pay with Stripe' : 
                       paymentMethod === 'vnpay' ? 'Pay with VNPay' :
                       paymentMethod === 'momo' ? 'Pay with MoMo' :
                       'Book Now'} - {formatCurrency(pricing.total)}
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-800">Booking Failed</h4>
                  <p className="text-red-700 text-sm">{error.message || 'Something went wrong. Please try again.'}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ✅ CSS Animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
