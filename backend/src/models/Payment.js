import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  method: { 
    type: String, 
    required: true 
  }, // 'VNPay', 'Momo', 'Cash', etc.
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  },
  transactionId: { 
    type: String 
  }, // Mã giao dịch từ cổng thanh toán
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
