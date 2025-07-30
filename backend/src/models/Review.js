import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  images: [{ type: String }],
  status: { type: String, enum: ['visible', 'hidden'], default: 'visible' },
  isDeleted: { type: Boolean, default: false },
  reply: { type: String, default: '' }
}, { timestamps: true });

// ✅ Thêm virtual field "id" dựa vào _id
reviewSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// ✅ Cấu hình JSON trả về: có id, bỏ _id và __v
reviewSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  }
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
