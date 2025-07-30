import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String },
  detail: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Log', logSchema);
