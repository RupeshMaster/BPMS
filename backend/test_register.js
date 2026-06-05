import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ override: true });

const testRegister = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    console.log('Connecting to:', dbUri);
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    const testId = 'test_worker_' + Math.floor(Math.random() * 1000);
    console.log(`Attempting to register user with ID: ${testId}`);

    const newUser = {
      id: testId,
      password: 'password123',
      role: 'worker',
      name: 'Test Worker',
      phone: '9999999999',
      dob: '1995-01-01',
      address: 'Test Address',
      aadhar: 'mock_aadhar_path.pdf',
      pan: 'mock_pan_path.pdf',
      image: 'mock_photo_path.jpg',
      nozzle: ''
    };

    const created = await User.create(newUser);
    console.log('User created successfully:', created);

    // Clean up
    await User.deleteOne({ id: testId });
    console.log('Cleaned up test user');

    process.exit(0);
  } catch (err) {
    console.error('Error during registration test:', err);
    process.exit(1);
  }
};

testRegister();
