import mongoose from 'mongoose';

const rateHistorySchema = new mongoose.Schema({
  fuelType: { type: String, required: true, enum: ['Petrol', 'Diesel'] },
  ratePerLitre: { type: Number, required: true },
  effectiveFrom: { type: Date, required: true, default: Date.now },
  updatedBy: { type: String } // user ID or name
}, { timestamps: true });

export default mongoose.models.RateHistory || mongoose.model('RateHistory', rateHistorySchema);
