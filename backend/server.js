import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { DbWrapper } from './models/dbWrapper.js';
import authRoutes from './routes/authRoutes.js';
import fuelRoutes from './routes/fuelRoutes.js';
import nozzleRoutes from './routes/nozzleRoutes.js';
import workerRoutes from './routes/workerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React app can communicate with the backend
app.use(cors());
app.use(express.json());

// API route mounts
app.use('/api/auth', authRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/nozzles', nozzleRoutes);
app.use('/api/workers', workerRoutes);

// Base route for API check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Bharat Petroleum Management System API!' });
});

// Start server
const startServer = async () => {
  // Connect to DB (catch errors internally to allow JSON fallback)
  await connectDB();
  
  // Seed MongoDB if it's connected and empty
  await DbWrapper.seedMongo();

  app.listen(PORT, () => {
    console.log(`[Server] Backend server running successfully on port ${PORT}`);
  });
};

startServer();
