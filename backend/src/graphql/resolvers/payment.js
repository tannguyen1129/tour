import Payment from '../../models/Payment.js';
import Booking from '../../models/Booking.js';
import Tour from '../../models/Tour.js';
import { createVNPayUrl } from '../../utils/vnpay-utils.js';
import { createStripeCheckoutSession } from '../../utils/stripe-utils.js';

export default {
  // ✅ Thêm Query resolver
  Query: {
    getPaymentByBooking: async (_, { bookingId }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const booking = await Booking.findById(bookingId);
      if (!booking) throw new Error('Booking not found');

      if (booking.user.toString() !== user.id) {
        throw new Error('Unauthorized');
      }

      const payment = await Payment.findOne({ booking: bookingId }).sort({ createdAt: -1 });
      return payment;
    }
  },

  Mutation: {
    // ✅ Cập nhật checkout mutation để handle existing bookings
    checkout: async (_, { bookingId, method }, { user, req }) => {
      if (!user) throw new Error('Unauthorized');

      const booking = await Booking.findById(bookingId).populate('tour');
      if (!booking) throw new Error('Booking not found');

      // ✅ Verify ownership
      if (booking.user.toString() !== user.id) {
        throw new Error('Unauthorized - You can only pay for your own bookings');
      }

      // ✅ Kiểm tra nếu đã có payment existing
      let payment = await Payment.findOne({ 
        booking: bookingId,
        status: { $in: ['pending', 'success'] }
      }).sort({ createdAt: -1 }); // Get latest payment

      if (!payment) {
        // Tạo payment mới nếu chưa có
        const tour = booking.tour || await Tour.findById(booking.tour);
        if (!tour) throw new Error('Tour not found');

        const amountUSD = Math.round(tour.price * booking.passengers.length * 100); // Convert to cents

        payment = await Payment.create({
          booking: bookingId,
          method,
          amount: amountUSD,
          status: 'pending'
        });

        // Gắn payment vào booking
        booking.latestPayment = payment._id;
        await booking.save();
      } else {
        // ✅ Update existing payment method nếu khác
        if (payment.method !== method) {
          payment.method = method;
          payment.status = 'pending'; // Reset status for retry
          await payment.save();
        }
      }

      let payUrl = '';

      if (method === 'VNPay') {
        const clientIp = req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || '127.0.0.1';
        payUrl = createVNPayUrl(payment, booking, clientIp);
      } else if (method === 'Stripe') {
        payUrl = await createStripeCheckoutSession(payment, booking, user.email);
      } else {
        throw new Error('Unsupported payment method');
      }

      return {
        payment,
        payUrl,
      };
    },

    // ✅ Cải thiện confirmPayment để handle properly
    confirmPayment: async (_, { paymentId, transactionId }, { user }) => {
  try {
    console.log('=== Confirm Payment Debug ===');
    console.log('User ID:', user?.id);
    console.log('Payment ID:', paymentId);
    console.log('Transaction ID:', transactionId);
    
    if (!user) throw new Error('Unauthorized');

    // ✅ Enhanced payment finding logic
    let payment;
    
    if (paymentId) {
      console.log('Searching by payment ID...');
      payment = await Payment.findById(paymentId);
      console.log('Payment found by ID:', payment ? 'Yes' : 'No');
    }
    
    if (!payment && transactionId) {
      console.log('Searching by transaction ID...');
      payment = await Payment.findOne({ transactionId });
      console.log('Payment found by transaction ID:', payment ? 'Yes' : 'No');
    }
    
    if (!payment && transactionId) {
      console.log('Searching by booking ID...');
      // ✅ Try to find by booking ID if transactionId is booking ID
      try {
        const booking = await Booking.findById(transactionId);
        if (booking) {
          console.log('Booking found, searching for payment...');
          payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });
          console.log('Payment found by booking:', payment ? 'Yes' : 'No');
        }
      } catch (bookingError) {
        console.log('Not a valid booking ID:', transactionId);
      }
    }

    if (!payment) {
      console.log('No payment found with provided criteria');
      throw new Error(`Payment not found for transactionId: ${transactionId}`);
    }

    console.log('Payment found:', payment._id);

    const booking = await Booking.findById(payment.booking);
    if (!booking) {
      console.log('Booking not found for payment:', payment.booking);
      throw new Error('Booking not found');
    }

    console.log('Booking found:', booking._id);

    if (booking.user.toString() !== user.id) {
      console.log('Authorization failed');
      throw new Error('Unauthorized access to this payment');
    }

    // ✅ Check if already confirmed
    if (payment.status === 'success') {
      console.log('Payment already confirmed');
      return payment;
    }

    // ✅ Update payment và booking status
    payment.status = 'success';
    payment.transactionId = transactionId;
    await payment.save();

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.latestPayment = payment._id;
    await booking.save();

    console.log('Payment confirmed successfully');
    return payment;
    
  } catch (error) {
    console.error('Confirm Payment Error:', error.message);
    throw error;
  }
}
  }
};
