import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },

  fullName: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dob: { type: Date }, // ngày sinh
  address: { type: String },
  avatar: { type: String }, // URL ảnh đại diện

  identityNumber: { type: String }, // CCCD / CMND
  issuedDate: { type: Date },
  issuedPlace: { type: String },

  nationality: { type: String, default: 'Vietnam' },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },

  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
