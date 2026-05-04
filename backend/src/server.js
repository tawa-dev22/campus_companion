import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedRBAC } from './config/seeder.js';
import logger from './config/logger.js';
import emailService from './services/emailService.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Socket.io Connection Handling
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
    logger.debug(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible globally if needed, or through a service
app.set('io', io);

const startServer = async () => {
  try {
    await connectDB();
    
    // Seed Roles, Permissions and Super Admin
    await seedRBAC();

    // Verify Email SMTP
    await emailService.verifyConnection();
    
    server.listen(PORT, () => {
      logger.info('backend connected successful');
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export { io };
