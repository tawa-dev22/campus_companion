import mongoose from 'mongoose';
import logger from './logger.js';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error('MONGODB_URI is missing');
    throw new Error('MONGODB_URI is missing');
  }
  try {
    await mongoose.connect(uri);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}
