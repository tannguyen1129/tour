import Booking from '../../models/Booking.js';

// Hàm phụ trợ kiểm tra quyền truy cập booking
function canAccessBooking(booking, user) {
  if (!user) throw new Error('Unauthorized');

  if (user.role === 'admin') return true;

  if (String(booking.user._id || booking.user) !== String(user.id)) {
    throw new Error('Forbidden');
  }

  return true;
}

export default {
  Query: {
    bookings: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const filter = { isDeleted: { $ne: true } };

      // Chỉ admin mới được xem tất cả
      if (user.role !== 'admin') {
        filter.user = user.id;
      }

      return Booking.find(filter)
        .populate('user', 'id email')
        .populate('tour', 'id title');
    },

    booking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const booking = await Booking.findById(id)
        .populate('user', 'id email')
        .populate('tour', 'id title');

      if (!booking || booking.isDeleted) throw new Error('Booking not found');

      canAccessBooking(booking, user);

      return booking;
    }
  },

  Mutation: {
    createBooking: async (_, { input }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const created = await Booking.create({
        tour: input.tour,
        user: user.id,
        passengers: input.passengers,
        voucher: input.voucher,
        paymentMethod: input.paymentMethod,
        status: 'pending',
        paymentStatus: 'unpaid',
        isDeleted: false
      });

      return Booking.findById(created._id)
        .populate('tour', 'id title')
        .populate('user', 'id email');
    },

    updateBooking: async (_, { id, status, paymentStatus }, { user }) => {
      if (!user) throw new Error('Unauthorized');

      const booking = await Booking.findById(id);
      if (!booking || booking.isDeleted) throw new Error('Booking not found');

      canAccessBooking(booking, user);

      const updated = await Booking.findByIdAndUpdate(
        id,
        { status, paymentStatus },
        { new: true }
      )
        .populate('tour', 'id title')
        .populate('user', 'id email');

      return updated;
    },

    deleteBooking: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Forbidden');

      const booking = await Booking.findById(id);
      if (!booking || booking.isDeleted) throw new Error('Booking not found');

      await Booking.findByIdAndUpdate(id, { isDeleted: true });
      return true;
    }
  }
};
