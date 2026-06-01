import mongoose from 'mongoose';

export const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bharat_petroleum';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000 // Time out after 5s
    });
    console.log(`[Database] MongoDB connected successfully to: ${dbUri}`);
    return true;
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    console.warn('[Database] Using Mock database simulation due to connection failure.');
    return false;
  }
};
