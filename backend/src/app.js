import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';
import studyGroupRoutes from './routes/studyGroupRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images
}));

// CORS
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json());

// Logging
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  stream: { write: (message) => logger.http(message.trim()) },
  skip: (req) => req.url === '/api/health'
}));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/api/health', (_req, res) => res.json({ message: 'Campus Companion API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling
app.use(errorHandler);

export default app;
