'use client';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_BOOKING } from '../graphql/mutations';

export default function BookingForm({ tourId }) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [voucher, setVoucher] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [createBooking, { loading, error }] = useMutation(CREATE_BOOKING);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const passengers = [
    ...Array(adults).fill().map(() => ({ name: 'Adult', age: 30, type: 'adult' })),
    ...Array(children).fill().map(() => ({ name: 'Child', age: 10, type: 'child' }))
  ];

  try {
    const bookingRes = await createBooking({
      variables: {
        input: {
          tour: tourId,
          passengers,
          voucher: voucher || null,
          paymentMethod
        }
      }
    });

    const bookingId = bookingRes.data.createBooking.id;

    if (paymentMethod === 'vnpay') {
      // Điều hướng sang checkout cho VNPay
      window.location.href = `/checkout/${bookingId}`;
    } else {
      // Hiển thị thông báo thành công cho các phương thức khác
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Reset form
      setAdults(1);
      setChildren(0);
      setVoucher('');
      setPaymentMethod('cash');
    }
  } catch (err) {
    console.error('Booking failed:', err);
  }
};


  // Calculate total passengers
  const totalPassengers = adults + children;

  return (
    <div className="relative">
      {/* Success Message */}
      {showSuccess && (
        <div className="absolute -top-4 left-0 right-0 z-10 bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 transform transition-all duration-500 animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-green-800">Booking Successful!</h4>
              <p className="text-green-700 text-sm">Your tour has been booked successfully. Check your email for confirmation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
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
              {/* Adults */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Adults (18+ years)
                </label>
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl overflow-hidden hover:border-blue-400 transition-colors">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
                      required
                      className="flex-1 px-4 py-3 text-center font-semibold text-slate-800 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setAdults(Math.min(10, adults + 1))}
                      className="px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Children */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Children (0-17 years)
                </label>
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl overflow-hidden hover:border-blue-400 transition-colors">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
                      className="flex-1 px-4 py-3 text-center font-semibold text-slate-800 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      className="px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
                placeholder="Enter your voucher code"
                className="w-full px-4 py-3 pl-12 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-800 placeholder-slate-400 font-medium hover:border-slate-400"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>

          {/* Payment Method Section */}
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
        value: 'momo', 
        label: 'MoMo E-Wallet', 
        icon: '📱', 
        desc: 'Pay with MoMo digital wallet'
      },
      { 
        value: 'vnpay', 
        label: 'VNPay', 
        icon: '🏦', 
        desc: 'Pay via VNPay banking gateway'
      },
      { 
        value: 'credit_card', 
        label: 'Credit Card', 
        icon: '💳', 
        desc: 'Visa, Mastercard accepted'
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
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          value={method.value}
          checked={paymentMethod === method.value}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="sr-only"
        />
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
        <p className="text-xs text-slate-600">All transactions are encrypted and processed securely through trusted payment gateways.</p>
      </div>
    </div>
  </div>
</div>



          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
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
                    <span>Book Now - {totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-red-800">Booking Failed</h4>
                  <p className="text-red-700 text-sm">{error.message || 'Something went wrong. Please try again.'}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
