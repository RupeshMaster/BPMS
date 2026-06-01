import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  nozzle: { type: String, required: true },
  fuel: { type: String, required: true, enum: ['Petrol', 'Diesel'] },
  liters: { type: Number, required: true },
  amount: { type: Number, required: true },
  payment: { type: String, required: true, enum: ['Cash', 'Digital', 'Mix'], default: 'Cash' },
  cash: { type: Number, default: 0 },
  digital: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);
