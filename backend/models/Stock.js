import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  fuelType: { type: String, required: true, unique: true, enum: ['Petrol', 'Diesel'] },
  current: { type: Number, required: true, default: 0 },
  capacity: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.models.Stock || mongoose.model('Stock', stockSchema);
