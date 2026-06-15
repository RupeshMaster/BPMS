import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  checkIn: { type: String, default: '' }, // Format: HH:MM AM/PM
  checkOut: { type: String, default: '' }, // Format: HH:MM AM/PM
  openingReading: { type: Number, default: 0 },
  closingReading: { type: Number, default: 0 },
  status: { type: String, required: true, enum: ['Active', 'On Leave', 'Absent', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
