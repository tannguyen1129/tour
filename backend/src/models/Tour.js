import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  itinerary: { type: String },  // Lịch trình tóm tắt
  servicesIncluded: [String],
  servicesExcluded: [String],
  cancelPolicy: { type: String },
  images: [String],
  videos: [String],
  location: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isDeleted: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

tourSchema.pre('save', function(next) {
  if (this.isNew) {
    this.createdAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Tour', tourSchema);
