import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  time: { type: String, required: true },
  workersCount: { type: Number, default: 0 },
  onboardCount: { type: Number, default: 0 },
  status: { type: String, default: 'Inactive' }
}, { timestamps: true });

export default mongoose.models.Shift || mongoose.model('Shift', shiftSchema);
