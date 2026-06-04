import mongoose from 'mongoose';
import Attendance from './models/Attendance.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bharat_petroleum');
    console.log('Connected to MongoDB');

    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking attendance for date: ${today}`);

    const logs = await Attendance.find({});
    console.log(`Total attendance logs: ${logs.length}`);
    console.log(JSON.stringify(logs, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkDb();
