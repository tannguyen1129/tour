import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  passengers: [{
    name: { type: String, required: true },
    age: { type: Number, required: true },
    type: { type: String, enum: ['adult', 'child'], required: true }
  }],
  voucher: { type: String },
  paymentMethod: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  total: { type: Number, default: 0 },
  basePrice: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  appliedVoucher: {
    code: String,
    discountType: String,
    discountValue: Number,
    appliedDiscount: Number,
    maxDiscount: Number       // ✅ Đã thêm
  },
  isDeleted: { type: Boolean, default: false },
  latestPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model('Booking', bookingSchema);
