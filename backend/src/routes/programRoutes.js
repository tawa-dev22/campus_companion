import { Router } from 'express';
import { 
  getPrograms, 
  createProgram, 
  deleteProgram 
} from '../controllers/programController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Middleware to restrict access to System Administrators
const requireSystemAdmin = (req, res, next) => {
  if (req.user?.role?.name !== 'System Administrator') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Only System Administrators can perform this action.',
    });
  }
  next();
};

// General fetch route available to all authenticated users
router.get('/', authenticate, getPrograms);

// Admin-only modification routes
router.post('/admin', authenticate, requireSystemAdmin, createProgram);
router.delete('/admin/:id', authenticate, requireSystemAdmin, deleteProgram);

export default router;
