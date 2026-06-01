import mongoose from 'mongoose';

const generatorSchema = new mongoose.Schema({
  status: { type: String, default: 'OFF' },
  hours: { type: Number, default: 0 },
  dieselLiters: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Generator || mongoose.model('Generator', generatorSchema);
