import mongoose from 'mongoose';
import Attendance from '../backend/models/Attendance.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../backend/.env', override: true });

const checkDb = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bharat_petroleum';
    await mongoose.connect(dbUri);
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
