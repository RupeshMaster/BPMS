import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['super-admin', 'admin', 'worker'] },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: String },
  address: { type: String },
  aadhar: { type: String },
  pan: { type: String },
  image: { type: String }, // Base64 or URL
  nozzle: { type: String },
  fuelType: { type: String, enum: ['Petrol', 'Diesel'] },
  shift: { type: String, enum: ['Morning Shift', 'Afternoon Shift', 'Night Shift'] },
  joiningDate: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
