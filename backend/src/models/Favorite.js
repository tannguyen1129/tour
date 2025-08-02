// models/Favorite.js
import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tour: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tour', 
    required: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  // ✅ Thêm field order để sort
  order: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Index unique để tránh duplicate
favoriteSchema.index({ user: 1, tour: 1 }, { unique: true });

// ✅ Index cho order field
favoriteSchema.index({ user: 1, order: 1 });

export default mongoose.model('Favorite', favoriteSchema);
