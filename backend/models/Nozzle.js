import mongoose from 'mongoose';

const nozzleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fuel: { type: String, required: true, enum: ['Petrol', 'Diesel'] },
  status: { type: String, required: true, enum: ['Active', 'Offline', 'Maintain'], default: 'Active' },
  assignedWorker: { type: String, default: 'None' },
  assignedWorkerId: { type: String, default: '' },
  reading: { type: Number, default: 0 },
  openingReading: { type: Number, default: 0 },
  accuracyRate: { type: Number, default: 100.0 },
  lastMaintenance: { type: String }
}, { timestamps: true });

export default mongoose.models.Nozzle || mongoose.model('Nozzle', nozzleSchema);
