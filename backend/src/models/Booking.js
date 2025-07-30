import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  passengers: [{
    name: String,
    age: Number,
    type: { type: String, enum: ['adult', 'child'] }
  }],
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
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
  isDeleted: { type: Boolean, default: false },
  latestPayment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Payment' 
  } // 👉 Thêm field để liên kết payment gần nhất
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
