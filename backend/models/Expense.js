import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: String, required: true },
  addedBy: { type: String }
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
