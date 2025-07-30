import Payment from '../../models/Payment.js';
import Booking from '../../models/Booking.js';
import Tour from '../../models/Tour.js';
import { createVNPayUrl } from '../../utils/vnpay-utils.js';

export default {
  Mutation: {
    checkout: async (_, { bookingId, method }, { user, req }) => {
      if (!user) throw new Error('Unauthorized');

      const booking = await Booking.findById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const tour = await Tour.findById(booking.tour);
      if (!tour) throw new Error('Tour not found');

      const amountVND = Math.round(tour.price * 23000);
      if (amountVND <= 0) throw new Error('Invalid amount');

      const payment = await Payment.create({
        booking: bookingId,
        method,
        amount: amountVND,
        status: 'pending'
      });

      booking.latestPayment = payment._id;
      await booking.save();

      if (method !== 'VNPay') throw new Error('Only VNPay supported');

      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const payUrl = createVNPayUrl(payment, booking, clientIp);

      return {
        payment,
        payUrl
      };
    }
  }
};
